const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/referensi/unit-satuan - Get all unit satuan
router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const where = search
         ? {
              OR: [{ nama: { contains: search, mode: "insensitive" } }, { deskripsi: { contains: search, mode: "insensitive" } }],
           }
         : {};

      const total = await prisma.tb_unit_satuan.count({ where });
      const results = await prisma.tb_unit_satuan.findMany({
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

// GET /api/referensi/unit-satuan/:id - Get unit satuan by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const data = await prisma.tb_unit_satuan.findUnique({
         where: { id: Number.parseInt(id) },
      });
      if (!data) {
         return res.json({ status: false, error: "Unit satuan tidak ditemukan" });
      }
      res.json({ data, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/referensi/unit-satuan - Create new unit satuan
router.post("/", async (req, res) => {
   try {
      const { nama, deskripsi, aktif, user_modified } = req.body;

      const errors = {};

      if (!nama?.trim()) {
         errors.nama = "Nama unit satuan wajib diisi";
      }

      if (!aktif?.trim()) {
         errors.aktif = "Status unit satuan wajib dipilih";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_unit_satuan.create({
         data: {
            nama,
            deskripsi,
            aktif: aktif === "true",
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Unit satuan berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/referensi/unit-satuan/:id - Update unit satuan
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, deskripsi, aktif, user_modified } = req.body;

      const errors = {};

      if (!nama?.trim()) {
         errors.nama = "Nama unit satuan wajib diisi";
      }

      if (!aktif?.trim()) {
         errors.aktif = "Status unit satuan wajib dipilih";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_unit_satuan.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            deskripsi,
            aktif: aktif === "true",
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Unit satuan berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Unit satuan tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/referensi/unit-satuan/:id - Delete unit satuan
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_unit_satuan.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Unit satuan tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
