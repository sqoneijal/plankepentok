const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const router = express.Router();
const prisma = new PrismaClient();

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
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
