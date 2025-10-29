const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/angka-pagu", async (req, res) => {
   try {
      const pengaturan = await prisma.tb_pengaturan.findFirst({
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

      const sumAnggaranDisetujui = await prisma.tb_usulan_kegiatan.aggregate({
         _sum: {
            total_anggaran: true,
         },
         where: {
            id_pengaturan: pengaturan.id,
         },
      });

      const sumRencanaAnggaran = await prisma.tb_rab_detail.aggregate({
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

      const where = {
         usulan_kegiatan: { pengaturan: { is_aktif: true } },
         status_klaim: { not: "batal" },
      };

      const total = await prisma.tb_klaim_verifikasi.count({ where });
      const results = await prisma.tb_klaim_verifikasi.findMany({
         where,
         take: Number.parseInt(limit),
         skip: Number.parseInt(offset),
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
            usulan_kegiatan: {
               select: {
                  kode: true,
                  status_usulan: true,
                  tanggal_submit: true,
                  rencana_total_anggaran: true,
                  total_anggaran: true,
                  jenis_usulan: {
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
      return res.status(500).json({ status: false, message: error.message });
   }
});

module.exports = router;
