const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../handle-error.js");

const validation = z.object({
   tahun_anggaran: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tahun anggaran wajib diisi")),
   total_pagu: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Total pagu wajib diisi")),
   is_aktif: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
});

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await prisma.tb_pengaturan.count();
      const results = await prisma.tb_pengaturan.findMany({
         orderBy: { tahun_anggaran: "desc" },
         take: limit,
         skip: offset,
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const results = await prisma.tb_pengaturan.findUnique({
         where: { id: Number.parseInt(id) },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { tahun_anggaran, total_pagu, is_aktif, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_pengaturan.create({
         data: {
            tahun_anggaran: Number.parseInt(tahun_anggaran),
            total_pagu: cleanRupiah(total_pagu),
            is_aktif: is_aktif === "true",
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Pengaturan berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message, status: false });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { total_pagu, is_aktif, user_modified } = req.body;
      const { id } = req.params;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_pengaturan.update({
         where: { id: Number.parseInt(id) },
         data: {
            total_pagu: cleanRupiah(total_pagu),
            is_aktif: is_aktif === "true",
            modified: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Pengaturan berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message, status: false });
   }
});

module.exports = router;
