const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/referensi/kategori-sbm - Get all kategori sbm
router.get("/", async (req, res) => {
   try {
      const limit = parseInt(req.query.limit) || 25;
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const where = search
         ? {
              OR: [
                 { nama: { contains: search, mode: "insensitive" } },
                 { deskripsi: { contains: search, mode: "insensitive" } },
                 { kode: { contains: search, mode: "insensitive" } },
              ],
           }
         : {};

      const total = await prisma.tb_kategori_sbm.count({ where });
      const results = await prisma.tb_kategori_sbm.findMany({
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

// GET /api/referensi/kategori-sbm/:id - Get kategori sbm by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const data = await prisma.tb_kategori_sbm.findUnique({
         where: { id: parseInt(id) },
      });
      if (!data) {
         return res.json({ status: false, error: "Kategori SBM tidak ditemukan" });
      }
      res.json({ data, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/referensi/kategori-sbm - Create new kategori sbm
router.post("/", async (req, res) => {
   try {
      const { kode, nama, deskripsi, user_modified } = req.body;

      const errors = {};

      if (kode?.trim()) {
         const duplicate = await prisma.tb_kategori_sbm.findUnique({
            where: { kode },
         });

         if (duplicate) {
            errors.kode = "Kode kategori SBM sudah ada";
         }
      } else {
         errors.kode = "Kode kategori SBM wajib diisi";
      }

      if (!nama?.trim()) {
         errors.nama = "Nama kategori SBM wajib diisi";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_kategori_sbm.create({
         data: {
            kode,
            nama,
            deskripsi,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Kategori SBM berhasil ditambahkan" });
   } catch (error) {
      if (error.code === "P2002") {
         return res.json({ status: false, error: "Kode kategori SBM sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/referensi/kategori-sbm/:id - Update kategori sbm
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { kode, nama, deskripsi, user_modified } = req.body;

      const errors = {};

      if (kode?.trim()) {
         const duplicate = await prisma.tb_kategori_sbm.findFirst({
            where: { kode, id: { not: parseInt(id) } },
         });

         if (duplicate) {
            errors.kode = "Kode kategori SBM sudah ada";
         }
      } else {
         errors.kode = "Kode kategori SBM wajib diisi";
      }

      if (!nama?.trim()) {
         errors.nama = "Nama kategori SBM wajib diisi";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_kategori_sbm.update({
         where: { id: parseInt(id) },
         data: {
            kode,
            nama,
            deskripsi,
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Kategori SBM berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Kategori SBM tidak ditemukan" });
      }
      if (error.code === "P2002") {
         return res.json({ status: false, error: "Kode kategori SBM sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/referensi/kategori-sbm/:id - Delete kategori sbm
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_kategori_sbm.delete({
         where: { id: parseInt(id) },
      });
      res.json({ status: true });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Kategori SBM tidak ditemukan" });
      }
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
