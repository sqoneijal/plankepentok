const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../../handle-error.js");

const router = express.Router();
const prisma = new PrismaClient();

const fakultasSchema = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama fakultas wajib diisi")),
});

// GET /api/unit-kerja/fakultas - Get all fakultas
router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = { nama: { contains: search, mode: "insensitive" } };
      const where = search ? query : {};

      const total = await prisma.tb_fakultas_master.count({ where });
      const results = await prisma.tb_fakultas_master.findMany({
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

// GET /api/unit-kerja/fakultas/:id - Get fakultas by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const results = await prisma.tb_fakultas_master.findUnique({
         where: { id: Number.parseInt(id) },
      });
      if (!results) {
         return res.json({ status: false, error: "Fakultas tidak ditemukan" });
      }
      res.json({ results, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/unit-kerja/fakultas - Create new fakultas
router.post("/", async (req, res) => {
   try {
      const { nama, user_modified } = req.body;

      const parsed = fakultasSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_fakultas_master.create({
         data: {
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Fakultas berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/unit-kerja/fakultas/:id - Update fakultas
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, user_modified } = req.body;

      const parsed = fakultasSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_fakultas_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Fakultas berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Fakultas tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/unit-kerja/fakultas/:id - Delete fakultas
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_fakultas_master.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Fakultas tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
