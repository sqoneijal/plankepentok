const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/unir-kerja/biro - Get all biro
router.get("/", async (req, res) => {
   try {
      const limit = parseInt(req.query.limit) || 25;
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const where = search
         ? {
              nama: { contains: search, mode: "insensitive" },
           }
         : {};

      const total = await prisma.tb_biro_master.count({ where });
      const results = await prisma.tb_biro_master.findMany({
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

// GET /api/unir-kerja/biro/:id - Get biro by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const results = await prisma.tb_biro_master.findUnique({
         where: { id: parseInt(id) },
      });
      if (!results) {
         return res.json({ status: false, error: "Biro tidak ditemukan" });
      }
      res.json({ results, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/unir-kerja/biro - Create new biro
router.post("/", async (req, res) => {
   try {
      const { nama, user_modified } = req.body;

      const errors = {};

      if (!nama?.trim()) {
         errors.nama = "Nama biro wajib diisi";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_biro_master.create({
         data: {
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Biro berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/unir-kerja/biro/:id - Update biro
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, user_modified } = req.body;

      const errors = {};

      if (!nama?.trim()) {
         errors.nama = "Nama biro wajib diisi";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_biro_master.update({
         where: { id: parseInt(id) },
         data: {
            nama,
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Biro berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Biro tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/unir-kerja/biro/:id - Delete biro
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_biro_master.delete({
         where: { id: parseInt(id) },
      });
      res.json({ status: true });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Biro tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
