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
   new_qty: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Qty wajib diisi")),
   new_harga_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Harga satuan wajib diisi")),
});

const router = express.Router();
const prisma = new PrismaClient();

router.post("/:id_usulan", async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { id, new_harga_satuan, harga_satuan, new_qty, qty } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      if (Number.parseFloat(cleanRupiah(new_harga_satuan)) > Number.parseFloat(cleanRupiah(harga_satuan))) {
         return res.json({
            status: false,
            message: "Periksa kembali inputan anda",
            errors: {
               new_harga_satuan: "Harga satuan lebih besar dari yang disetujui",
            },
         });
      }

      if (Number.parseInt(new_qty) > Number.parseInt(qty)) {
         return res.json({
            status: false,
            message: "Periksa kembali inputan anda",
            errors: {
               new_qty: "Jumlah Qty lebih besar dari yang disetujui",
            },
         });
      }

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

      const results = await prisma.tb_rab_detail.findMany({
         where: { id_usulan: Number.parseInt(id_usulan), approve: "valid" },
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
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
