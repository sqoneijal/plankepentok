const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const router = express.Router();
const prisma = new PrismaClient();

const usulanSchema = z.object({
   kode: z.string().min(1, "Kode wajib diisi"),
   nama: z.string().min(1, "Nama wajib diisi"),
   waktu_mulai: z.string().min(1, "Waktu mulai wajib diisi"),
   waktu_selesai: z.string().min(1, "Waktu selesai wajib diisi"),
   tempat_pelaksanaan: z.string().min(1, "Tempat pelaksanaan wajib diisi"),
   rencana_total_anggaran: z.string().min(1, "Tempat pelaksanaan wajib diisi"),
});

const rabSchema = z.object({
   id_usulan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Uraian wajib diisi")),
   uraian_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Uraian wajib diisi")),
   qty: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Jumlah wajib diisi")),
   id_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Unit satuan wajib dipilih")),
   harga_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Harga satuan wajib diisi")),
   total_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Total biaya wajib diisi")),
});

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

router.get("/referensi-sbm", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const where = search
         ? {
              OR: [
                 { standar_biaya: { nama: { contains: search, mode: "insensitive" } } },
                 { standar_biaya: { deskripsi: { contains: search, mode: "insensitive" } } },
                 { unit_satuan: { nama: { contains: search, mode: "insensitive" } } },
                 { unit_satuan: { deskripsi: { contains: search, mode: "insensitive" } } },
              ],
           }
         : {};

      const total = await prisma.tb_detail_harga_sbm.count({ where: { status_validasi: "valid", ...where } });
      const results = await prisma.tb_detail_harga_sbm.findMany({
         orderBy: { uploaded: "asc" },
         where: { status_validasi: "valid", ...where },
         include: {
            standar_biaya: true,
            unit_satuan: true,
         },
         take: limit,
         skip: offset,
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/", async (req, res) => {
   try {
      const total = await prisma.tb_usulan_kegiatan.count();
      const results = await prisma.tb_usulan_kegiatan.findMany({
         orderBy: { uploaded: "asc" },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { kode, id_unit_pengusul, tempat_pelaksanaan, user_modified } = req.body;

      const created = await prisma.tb_usulan_kegiatan.create({
         data: {
            kode,
            id_unit_pengusul,
            tempat_pelaksanaan,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, id_usulan_kegiatan: created.id });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const results = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id) },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, latar_belakang, tujuan, sasaran, waktu_mulai, waktu_selesai, tempat_pelaksanaan, rencana_total_anggaran, user_modified } =
         req.body;

      const parsed = usulanSchema.safeParse(req.body);

      if (!parsed.success) {
         const formattedErrors = {};
         for (const key in parsed.error.flatten().fieldErrors) {
            const val = parsed.error.flatten().fieldErrors[key];
            formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
         }

         return res.json({
            status: false,
            message: "Periksa kembali inputan anda.",
            errors: formattedErrors,
         });
      }

      await prisma.tb_usulan_kegiatan.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            latar_belakang,
            tujuan,
            sasaran,
            waktu_mulai: waktu_mulai ? new Date(waktu_mulai) : undefined,
            waktu_selesai: waktu_selesai ? new Date(waktu_selesai) : undefined,
            tempat_pelaksanaan,
            tanggal_submit: new Date(),
            modified: new Date(),
            user_modified,
            rencana_total_anggaran: cleanRupiah(rencana_total_anggaran),
         },
      });
      res.json({ status: true, message: "Usulan kegiatan berhasil diperbaharui." });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      await prisma.tb_usulan_kegiatan.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true, message: "Usulan kegiatan deleted successfully" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/relasi-iku/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const total = await prisma.tb_relasi_usulan_iku.count({
         where: { id_usulan: Number.parseInt(id) },
      });
      const results = await prisma.tb_relasi_usulan_iku.findMany({
         where: { id_usulan: Number.parseInt(id) },
         include: { iku_master: true },
         orderBy: { iku_master: { kode: "asc" } },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/relasi-iku", async (req, res) => {
   try {
      const { id_usulan, id, user_modified } = req.body;

      // Check if the relation already exists
      const existing = await prisma.tb_relasi_usulan_iku.findFirst({
         where: {
            id_usulan: Number.parseInt(id_usulan),
            id_iku: Number.parseInt(id),
         },
      });

      if (existing) {
         return res.json({ status: false, message: "Relasi IKU sudah ada." });
      }

      await prisma.tb_relasi_usulan_iku.create({
         data: {
            id_usulan: Number.parseInt(id_usulan),
            id_iku: Number.parseInt(id),
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Relasi IKU berhasil ditambahkan." });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.delete("/relasi-iku/:id", async (req, res) => {
   try {
      const { id } = req.params;

      await prisma.tb_relasi_usulan_iku.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true, message: "Relasi IKU berhasil dihapus." });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/rab/:id_usulan/:id", async (req, res) => {
   try {
      const { id_usulan, id } = req.params;
      const results = await prisma.tb_rab_detail.findUnique({
         where: { id_usulan: Number.parseInt(id_usulan), id: Number.parseInt(id) },
         include: { unit_satuan: true },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/rab/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const total = await prisma.tb_rab_detail.count({
         where: { id_usulan: Number.parseInt(id) },
      });
      const results = await prisma.tb_rab_detail.findMany({
         where: { id_usulan: Number.parseInt(id) },
         include: { unit_satuan: true },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/rab", async (req, res) => {
   try {
      const { id_usulan, uraian_biaya, qty, id_satuan, harga_satuan, total_biaya, catatan, user_modified } = req.body;

      const parsed = rabSchema.safeParse(req.body);

      if (!parsed.success) {
         const formattedErrors = {};
         for (const key in parsed.error.flatten().fieldErrors) {
            const val = parsed.error.flatten().fieldErrors[key];
            formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
         }

         return res.json({
            status: false,
            message: "Periksa kembali inputan anda.",
            errors: formattedErrors,
         });
      }

      await prisma.tb_rab_detail.create({
         data: {
            id_usulan: Number.parseInt(id_usulan),
            uraian_biaya,
            qty: Number.parseInt(qty) || 1,
            id_satuan: Number.parseInt(id_satuan),
            harga_satuan: cleanRupiah(harga_satuan),
            total_biaya: cleanRupiah(total_biaya),
            catatan,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Rencana anggaran biaya berhasil ditambahkan.", id_usulan });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/rab/:id_usulan/:id", async (req, res) => {
   const { id_usulan, id } = req.params;
   const { uraian_biaya, qty, id_satuan, harga_satuan, total_biaya, catatan, user_modified } = req.body;

   const parsed = rabSchema.safeParse(req.body);

   if (!parsed.success) {
      const formattedErrors = {};
      for (const key in parsed.error.flatten().fieldErrors) {
         const val = parsed.error.flatten().fieldErrors[key];
         formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
      }

      return res.json({
         status: false,
         message: "Periksa kembali inputan anda.",
         errors: formattedErrors,
      });
   }

   await prisma.tb_rab_detail.update({
      where: { id_usulan: Number.parseInt(id_usulan), id: Number.parseInt(id) },
      data: {
         uraian_biaya,
         qty: Number.parseInt(qty) || 1,
         id_satuan: Number.parseInt(id_satuan),
         harga_satuan: cleanRupiah(harga_satuan),
         total_biaya: cleanRupiah(total_biaya),
         catatan,
         modified: new Date(),
         user_modified,
      },
   });
   res.status(201).json({ status: true, message: "Rencana anggaran biaya berhasil diperbaharui.", id_usulan });
});

router.delete("/rab/:id", async (req, res) => {
   try {
      const { id } = req.params;

      await prisma.tb_rab_detail.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true, message: "Rencana anggaran biaya berhasil dihapus." });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
