const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../../handle-error.js");

const router = express.Router();
const prisma = new PrismaClient();

const uptSchema = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama UPT wajib diisi")),
});

// GET /api/unir-kerja/upt - Get all upt
router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = { nama: { contains: search, mode: "insensitive" } };
      const where = search ? query : {};

      const total = await prisma.tb_upt_master.count({ where });
      const results = await prisma.tb_upt_master.findMany({
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

// GET /api/unir-kerja/upt/:id - Get upt by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const results = await prisma.tb_upt_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!results) {
         return res.json({ status: false, error: "UPT tidak ditemukan" });
      }
      res.json({ results, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/unir-kerja/upt - Create new upt
router.post("/", async (req, res) => {
   try {
      const { nama, user_modified } = req.body;

      const parsed = uptSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_upt_master.create({
         data: {
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "UPT berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/unir-kerja/upt/:id - Update upt
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, user_modified } = req.body;

      const parsed = uptSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      await prisma.tb_upt_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "UPT berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "UPT tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/unir-kerja/upt/:id - Delete upt
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_upt_master.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true, message: "UPT berhasil dihapus" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "UPT tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
