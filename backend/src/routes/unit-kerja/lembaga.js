const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../../handle-error.js");

const router = express.Router();
const prisma = new PrismaClient();

const lembagaSchema = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama lembaga wajib diisi")),
});

// GET /api/unit-kerja/lembaga - Get all lembaga
router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = { nama: { contains: search, mode: "insensitive" } };
      const where = search ? query : {};

      const total = await prisma.tb_lembaga_master.count({ where });
      const results = await prisma.tb_lembaga_master.findMany({
         where,
         orderBy: { id: "asc" },
         take: limit,
         skip: offset,
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// GET /api/unit-kerja/lembaga/:id - Get lembaga by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const results = await prisma.tb_lembaga_master.findUnique({
         where: { id: Number.parseInt(id) },
      });
      if (!results) {
         return res.json({ status: false, error: "Lembaga tidak ditemukan" });
      }
      res.json({ results, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/unit-kerja/lembaga - Create new lembaga
router.post("/", async (req, res) => {
   try {
      const { nama, user_modified } = req.body;

      const parsed = lembagaSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_lembaga_master.create({
         data: {
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Lembaga berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/unit-kerja/lembaga/:id - Update lembaga
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, user_modified } = req.body;

      const parsed = lembagaSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_lembaga_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Lembaga berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Lembaga tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/unit-kerja/lembaga/:id - Delete lembaga
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_lembaga_master.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Lembaga tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
