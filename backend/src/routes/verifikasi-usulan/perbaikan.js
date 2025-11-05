const express = require("express");
const prisma = require("@/db.js");

const router = express.Router();

router.get("/", async (req, res) => {
   try {
      const where = {
         status_usulan: "perbaiki",
      };

      const total = await prisma.tb_usulan_kegiatan.count({ where });
      const results = await prisma.tb_usulan_kegiatan.findMany({
         where,
         select: {
            id: true,
            kode: true,
            tanggal_submit: true,
            rencana_total_anggaran: true,
            total_anggaran: true,
            jenis_usulan: {
               select: {
                  nama: true,
               },
            },
            pengguna: {
               select: {
                  fullname: true,
               },
            },
            unit_pengusul: {
               select: {
                  biro_master: {
                     select: {
                        nama: true,
                     },
                  },
                  upt_master: {
                     select: {
                        nama: true,
                     },
                  },
                  fakultas_master: {
                     select: {
                        nama: true,
                     },
                  },
                  lembaga_master: {
                     select: {
                        nama: true,
                     },
                  },
                  sub_unit: {
                     select: {
                        nama: true,
                     },
                  },
               },
            },
         },
      });

      return res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id_usulan_kegiatan", async (req, res) => {
   try {
      const { id_usulan_kegiatan } = req.params;

      const results = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan_kegiatan) },
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
                  id: true,
                  fullname: true,
               },
            },
            total_anggaran: true,
            status_usulan: true,
            tanggal_submit: true,
            rencana_total_anggaran: true,
            catatan_perbaikan: true,
            jenis_usulan: {
               select: {
                  id: true,
                  nama: true,
               },
            },
            dokumen_pendukung: {
               orderBy: { uploaded: "asc" },
               select: {
                  id: true,
                  nama_dokumen: true,
                  tipe_dokumen: true,
                  path_file: true,
                  uploaded: true,
                  modified: true,
                  user_modified: true,
                  file_dokumen: true,
               },
            },
            rab_detail: {
               orderBy: { uploaded: "asc" },
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
            },
            relasi_usulan_iku: {
               orderBy: { id: "desc" },
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
            unit_pengusul: {
               select: {
                  biro_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  lembaga_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  upt_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  fakultas_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  sub_unit: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
               },
            },
            anggaran_disetujui: {
               select: { jumlah: true },
            },
            verifikasi: {
               select: {
                  id: true,
                  id_referensi: true,
                  table_referensi: true,
                  status: true,
                  catatan: true,
               },
            },
         },
      });

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

module.exports = router;
