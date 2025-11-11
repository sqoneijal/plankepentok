const express = require("express");
const db = require("@/db.js");
const router = express.Router();

router.get("/angka-pagu", async (req, res) => {
   try {
      const pengaturan = await db.read.tb_pengaturan.findFirst({
         where: { is_aktif: true },
         select: {
            id: true,
            total_pagu: true,
            realisasi: true,
            tahun_anggaran: true,
         },
      });

      if (!pengaturan) {
         return res.json({ status: false, message: "Pengaturan aktif tidak ditemukan" });
      }

      const sumAnggaranDisetujui = await db.read.tb_usulan_kegiatan.aggregate({
         _sum: {
            total_anggaran: true,
         },
         where: {
            id_pengaturan: pengaturan.id,
         },
      });

      const sumRencanaAnggaran = await db.read.tb_rab_detail.aggregate({
         _sum: {
            total_biaya: true,
         },
         where: {
            usulan_kegiatan: {
               id_pengaturan: pengaturan.id,
            },
         },
      });

      const results = {
         total_pagu: pengaturan.total_pagu,
         tahun_anggaran: pengaturan.tahun_anggaran,
         realisasi: pengaturan.realisasi,
         rencana_anggaran: sumRencanaAnggaran._sum.total_biaya || 0,
         anggaran_disetujui: sumAnggaranDisetujui._sum.total_anggaran || 0,
      };

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
});

router.get("/status-verifikasi", async (req, res) => {
   try {
      const { limit, offset } = req.query;

      const pengaturan = await db.read.tb_pengaturan.findFirst({
         where: {
            is_aktif: true,
         },
         select: {
            id: true,
         },
      });

      const where = {
         id_pengaturan: pengaturan.id,
         status_usulan: { notIn: ["draft", "diterima"] },
      };

      const total = await db.read.tb_usulan_kegiatan.count({ where });
      const results = await db.read.tb_usulan_kegiatan.findMany({
         take: Number.parseInt(limit),
         skip: Number.parseInt(offset),
         where,
         select: {
            id: true,
            kode: true,
            tanggal_submit: true,
            id_jenis_usulan: true,
            rencana_total_anggaran: true,
            total_anggaran: true,
            jenis_usulan: {
               select: {
                  nama: true,
               },
            },
            anggaran_disetujui: {
               select: {
                  jumlah: true,
               },
            },
            klaim_verifikasi: {
               where: {
                  status_klaim: { not: "selesai" },
               },
               select: {
                  status_klaim: true,
                  verikator_usulan: {
                     select: {
                        tahap: true,
                        pengguna: {
                           select: {
                              fullname: true,
                           },
                        },
                     },
                  },
               },
            },
         },
      });

      return res.json({ results, total });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

module.exports = router;
