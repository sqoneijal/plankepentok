const express = require("express");
const { PrismaClient } = require("@prisma/client");
const errorHandler = require("../handle-error.js");
const { logAudit } = require("../helpers.js");
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
const prisma = new PrismaClient();

router.post("/:id_usulan", async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { id, new_total_biaya, anggaran_digunakan, user_modified, deskripsi, tanggal_selesai, tanggal_mulai } = req.body;

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

      const newData = await prisma.tb_realisasi.create({
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

      logAudit(user_modified, "CREATE", "tb_realisasi", req.ip, null, { ...newData });

      return res.json({ status: true, message: "Realisasi berhasil disimpan" });
   } catch (error) {
      return res.json({ error: error.message });
   }
});

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const where = { status_usulan: "diterima" };

      const total = await prisma.tb_usulan_kegiatan.count({ where });
      const results = await prisma.tb_usulan_kegiatan.findMany({
         where,
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         select: {
            id: true,
            kode: true,
            nama: true,
            waktu_mulai: true,
            waktu_selesai: true,
            rencana_total_anggaran: true,
            total_anggaran: true,
            rab_detail: {
               where: { approve: "valid" },
               select: {
                  rab_detail_perubahan: {
                     select: {
                        total_biaya: true,
                     },
                  },
               },
            },
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

      const realisasi = await prisma.tb_realisasi.findMany({
         where: { id_usulan: Number.parseInt(id_usulan) },
         select: { id_rab: true },
      });

      const realizedIds = realisasi.map((r) => r.id_rab);

      const results = await prisma.tb_rab_detail.findMany({
         where: { id_usulan: Number.parseInt(id_usulan), approve: "valid", id: { notIn: realizedIds } },
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
         },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const results = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id), status_usulan: "diterima" },
         select: {
            id: true,
            kode: true,
            nama: true,
            latar_belakang: true,
            tujuan: true,
            sasaran: true,
            waktu_mulai: true,
            waktu_selesai: true,
            tempat_pelaksanaan: true,
            id_unit_pengusul: true,
            operator_input: true,
            total_anggaran: true,
            tanggal_submit: true,
            rencana_total_anggaran: true,
            dokumen_pendukung: {
               where: { approve: "sesuai" },
               select: {
                  id: true,
                  nama_dokumen: true,
                  tipe_dokumen: true,
                  path_file: true,
                  file_dokumen: true,
               },
            },
            rab_detail: {
               where: { approve: "valid" },
               select: {
                  id: true,
                  uraian_biaya: true,
                  qty: true,
                  harga_satuan: true,
                  total_biaya: true,
                  catatan: true,
                  unit_satuan: {
                     select: {
                        id: true,
                        nama: true,
                        deskripsi: true,
                        aktif: true,
                     },
                  },
                  rab_detail_perubahan: {
                     select: { id: true, qty: true, harga_satuan: true, total_biaya: true },
                  },
               },
            },
            relasi_usulan_iku: {
               where: { approve: "sesuai" },
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
            realisasi: {
               select: {
                  id: true,
                  tanggal_mulai: true,
                  tanggal_selesai: true,
                  deskripsi: true,
                  anggaran_digunakan: true,
                  rab_detail: {
                     select: {
                        id: true,
                        uraian_biaya: true,
                        qty: true,
                        rab_detail_perubahan: {
                           select: { id: true, qty: true, harga_satuan: true, total_biaya: true },
                        },
                        unit_satuan: {
                           select: {
                              id: true,
                              nama: true,
                              deskripsi: true,
                              aktif: true,
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
