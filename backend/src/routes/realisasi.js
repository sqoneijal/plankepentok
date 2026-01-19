const express = require("express");
const errorHandler = require("@/handle-error.js");
const { logAudit } = require("@/helpers.js");
const { z } = require("zod");

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

const validation = z.object({
   tanggal_mulai: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tanggal mulai wajib diisi")),
   tanggal_selesai: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tanggal selesai wajib diisi")),
   anggaran_digunakan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Anggaran digunakan wajib diisi")),
   deskripsi: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Deskripsi wajib diisi")),
});

const router = express.Router();
const db = require("@/db.js");

const getActiveIdField = (data) => {
   const mapping = {
      id_biro: "tb_pagu_anggaran_biro",
      id_lembaga: "tb_pagu_anggaran_lembaga",
      id_upt: "tb_pagu_anggaran_upt",
      id_fakultas: "tb_pagu_anggaran_fakultas",
      id_sub_unit: "tb_pagu_sub_unit",
   };

   for (const [field, table] of Object.entries(mapping)) {
      if (data[field] != null) {
         return {
            field,
            value: data[field],
            tabel_referensi: table,
            keterangan: `Nilai berasal dari field '${field}' (${table})`,
         };
      }
   }

   return {
      field: null,
      value: null,
      tabel_referensi: null,
      keterangan: "Semua field bernilai null",
   };
};

const hitungRealiasi = async (anggaran_digunakan, unit_pengusul, user_modified, ip) => {
   const pengaturan = await db.read.tb_pengaturan.findFirst({
      where: { is_aktif: true },
   });

   const paguUnit = getActiveIdField(unit_pengusul);

   const oldData = await db.read[paguUnit.tabel_referensi].findFirst({
      where: { [paguUnit.field]: paguUnit.value, tahun_anggaran: pengaturan.tahun_anggaran },
   });

   const newData = await db.write[paguUnit.tabel_referensi].update({
      where: { id: oldData.id },
      data: {
         realisasi: cleanRupiah(anggaran_digunakan) + cleanRupiah(oldData.realisasi),
      },
   });

   await logAudit(user_modified, "UPDATE", paguUnit.tabel_referensi, ip, { ...oldData }, { ...newData });

   const newDataPengaturan = await db.write.tb_pengaturan.update({
      where: { id: pengaturan.id },
      data: {
         realisasi: cleanRupiah(anggaran_digunakan) + cleanRupiah(pengaturan.realisasi),
      },
   });

   await logAudit(user_modified, "UPDATE", "tb_pengaturan", ip, { ...pengaturan }, { ...newDataPengaturan });
};

router.post("/:id_usulan", async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { id, new_total_biaya, anggaran_digunakan, user_modified, deskripsi, tanggal_selesai, tanggal_mulai, usulan_kegiatan } = req.body;
      const { unit_pengusul } = usulan_kegiatan;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      if (Number.parseFloat(cleanRupiah(anggaran_digunakan)) > Number.parseFloat(cleanRupiah(new_total_biaya))) {
         return res.json({
            status: false,
            message: "Periksa kembali inputan anda",
            errors: {
               anggaran_digunakan: "Anggaran digunakan lebih besar dari yang disetujui",
            },
         });
      }

      const newData = await db.write.tb_realisasi.create({
         data: {
            id_usulan: Number.parseInt(id_usulan),
            id_rab: Number.parseInt(id),
            tanggal_mulai: new Date(tanggal_mulai),
            tanggal_selesai: new Date(tanggal_selesai),
            deskripsi,
            anggaran_digunakan: Number.parseFloat(cleanRupiah(anggaran_digunakan)),
            uploaded: new Date(),
            user_modified,
         },
      });

      await logAudit(user_modified, "CREATE", "tb_realisasi", req.ip, null, { ...newData });
      await hitungRealiasi(anggaran_digunakan, unit_pengusul, user_modified, req.ip);

      return res.json({
         status: true,
         message: "Realisasi berhasil disimpan",
         refetchQuery: [
            [`/realisasi/${id_usulan}`, {}],
            [`/realisasi/${id_usulan}/ref-rab`, {}],
         ],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const where = { status_usulan: "diterima" };

      const total = await db.read.tb_usulan_kegiatan.count({ where });
      const results = await db.read.tb_usulan_kegiatan.findMany({
         where,
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         select: {
            id: true,
            kode: true,
            jenis_usulan: {
               select: {
                  nama: true,
               },
            },
            waktu_mulai: true,
            waktu_selesai: true,
            unit_pengusul: {
               select: {
                  biro_master: { select: { nama: true } },
                  fakultas_master: { select: { nama: true } },
                  upt_master: { select: { nama: true } },
                  lembaga_master: { select: { nama: true } },
                  sub_unit: { select: { nama: true } },
               },
            },
            anggaran_disetujui: {
               select: { jumlah: true },
            },
            realisasi: true,
         },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id_usulan/ref-rab", async (req, res) => {
   try {
      const { id_usulan } = req.params;

      const realisasi = await db.read.tb_realisasi.findMany({
         where: { id_usulan: Number.parseInt(id_usulan) },
         select: { id_rab: true },
      });

      const realizedIds = realisasi.map((r) => r.id_rab);

      const verifikasi = await db.read.tb_verifikasi.findMany({
         where: {
            table_referensi: "tb_rab_detail",
            status: "valid",
            id_usulan_kegiatan: Number.parseInt(id_usulan),
            id_referensi: { notIn: realizedIds },
         },
         orderBy: {
            tahap: "desc",
         },
         distinct: ["id_referensi", "table_referensi"],
         select: { id_referensi: true },
      });

      const referensiID = verifikasi.map((r) => r.id_referensi);

      const results = await db.read.tb_rab_detail.findMany({
         where: {
            id_usulan: Number.parseInt(id_usulan),
            id: { in: referensiID },
         },
         select: {
            id: true,
            uraian_biaya: true,
            qty: true,
            id_satuan: true,
            harga_satuan: true,
            total_biaya: true,
            unit_satuan: {
               select: {
                  id: true,
                  nama: true,
                  deskripsi: true,
               },
            },
            rab_detail_perubahan: {
               select: {
                  id: true,
                  qty: true,
                  harga_satuan: true,
                  total_biaya: true,
               },
            },
            usulan_kegiatan: {
               select: {
                  unit_pengusul: true,
               },
            },
         },
      });

      res.json({ results });
   } catch (error) {
      res.json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const sesuaiRelasiIKU = await db.read.tb_verifikasi.findMany({
         where: {
            table_referensi: "tb_relasi_usulan_iku",
            status: "sesuai",
            id_usulan_kegiatan: Number.parseInt(id),
         },
         orderBy: {
            tahap: "desc",
         },
         distinct: ["id_referensi", "table_referensi"],
         select: { id_referensi: true },
      });

      const sesuaiRelasiIKUID = sesuaiRelasiIKU.map((r) => r.id_referensi);

      const validAnggaranBiaya = await db.read.tb_verifikasi.findMany({
         where: {
            table_referensi: "tb_rab_detail",
            status: "valid",
            id_usulan_kegiatan: Number.parseInt(id),
         },
         orderBy: {
            tahap: "desc",
         },
         distinct: ["id_referensi", "table_referensi"],
         select: { id_referensi: true },
      });

      const validAnggaranBiayaID = validAnggaranBiaya.map((r) => r.id_referensi);

      const sesuaiDokumen = await db.read.tb_verifikasi.findMany({
         where: {
            table_referensi: "tb_dokumen_pendukung",
            status: "sesuai",
            id_usulan_kegiatan: Number.parseInt(id),
         },
         orderBy: {
            tahap: "desc",
         },
         distinct: ["id_referensi", "table_referensi"],
         select: { id_referensi: true },
      });

      const sesuaiDokumenID = sesuaiDokumen.map((r) => r.id_referensi);

      const results = await db.read.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id), status_usulan: "diterima" },
         select: {
            id: true,
            kode: true,
            latar_belakang: true,
            tujuan: true,
            sasaran: true,
            waktu_mulai: true,
            waktu_selesai: true,
            tempat_pelaksanaan: true,
            pengguna: {
               select: {
                  fullname: true,
               },
            },
            total_anggaran: true,
            status_usulan: true,
            tanggal_submit: true,
            rencana_total_anggaran: true,
            catatan_perbaikan: true,
            jenis_usulan: { select: { id: true, nama: true } },
            anggaran_disetujui: {
               select: { jumlah: true },
            },
            unit_pengusul: {
               select: {
                  biro_master: { select: { nama: true } },
                  lembaga_master: { select: { nama: true } },
                  fakultas_master: { select: { nama: true } },
                  upt_master: { select: { nama: true } },
                  sub_unit: { select: { nama: true } },
               },
            },
            relasi_usulan_iku: {
               where: { id: { in: sesuaiRelasiIKUID } },
               select: {
                  id: true,
                  iku_master: {
                     select: {
                        id: true,
                        jenis: true,
                        kode: true,
                        deskripsi: true,
                        tahun_berlaku: true,
                     },
                  },
               },
            },
            rab_detail: {
               where: { id: { in: validAnggaranBiayaID } },
               select: {
                  id: true,
                  id_usulan: true,
                  uraian_biaya: true,
                  qty: true,
                  unit_satuan: {
                     select: {
                        nama: true,
                        deskripsi: true,
                     },
                  },
                  harga_satuan: true,
                  total_biaya: true,
                  catatan: true,
                  rab_detail_perubahan: {
                     select: {
                        id: true,
                        qty: true,
                        harga_satuan: true,
                        total_biaya: true,
                     },
                  },
               },
            },
            dokumen_pendukung: {
               where: { id: { in: sesuaiDokumenID } },
               select: {
                  id: true,
                  nama_dokumen: true,
                  tipe_dokumen: true,
                  path_file: true,
                  file_dokumen: true,
               },
            },
            realisasi: {
               select: {
                  id: true,
                  tanggal_mulai: true,
                  tanggal_selesai: true,
                  deskripsi: true,
                  anggaran_digunakan: true,
                  rab_detail: {
                     select: {
                        uraian_biaya: true,
                        qty: true,
                        rab_detail_perubahan: {
                           select: {
                              id: true,
                              harga_satuan: true,
                              qty: true,
                              total_biaya: true,
                           },
                        },
                        unit_satuan: {
                           select: {
                              nama: true,
                              deskripsi: true,
                           },
                        },
                     },
                  },
               },
            },
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
