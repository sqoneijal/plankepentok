const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/referensi/standar-biaya - Get all standar biaya
router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [
            { kode: { contains: search, mode: "insensitive" } },
            { nama: { contains: search, mode: "insensitive" } },
            { deskripsi: { contains: search, mode: "insensitive" } },
         ],
      };
      const where = search ? query : {};

      const total = await prisma.tb_standar_biaya_master.count({ where });
      const results = await prisma.tb_standar_biaya_master.findMany({
         where,
         include: {
            kategori_sbm: true,
            unit_satuan: true,
         },
         orderBy: { id: "asc" },
         take: limit,
         skip: offset,
      });

      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// GET /api/referensi/standar-biaya/:id - Get standar biaya by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const data = await prisma.tb_standar_biaya_master.findUnique({
         where: { id: Number.parseInt(id) },
      });
      if (!data) {
         return res.json({ status: false, error: "Standar biaya tidak ditemukan" });
      }
      res.json({ data, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/referensi/standar-biaya - Create new standar biaya
router.post("/", async (req, res) => {
   try {
      const { kode, nama, deskripsi, id_kategori, id_unit_satuan, user_modified } = req.body;

      const errors = {};

      if (kode?.trim()) {
         const duplicate = await prisma.tb_standar_biaya_master.findUnique({
            where: { kode },
         });

         if (duplicate) {
            errors.kode = "Kode standar biaya sudah ada";
         }
      } else {
         errors.kode = "Kode standar biaya wajib diisi";
      }

      if (!nama?.trim()) {
         errors.nama = "Nama standar biaya wajib diisi";
      }

      if (!id_kategori) {
         errors.id_kategori = "ID kategori wajib dipilih";
      }

      if (!id_unit_satuan) {
         errors.id_unit_satuan = "ID unit satuan wajib dipilih";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_standar_biaya_master.create({
         data: {
            kode,
            nama,
            deskripsi,
            id_kategori: Number.parseInt(id_kategori),
            id_unit_satuan: Number.parseInt(id_unit_satuan),
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Standar biaya berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/referensi/standar-biaya/:id - Update standar biaya
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { kode, nama, deskripsi, id_kategori, id_unit_satuan, user_modified } = req.body;

      const errors = {};

      if (kode?.trim()) {
         const duplicate = await prisma.tb_kategori_sbm.findFirst({
            where: { kode, id: { not: Number.parseInt(id) } },
         });

         if (duplicate) {
            errors.kode = "Kode standar biaya sudah ada";
         }
      } else {
         errors.kode = "Kode standar biaya wajib diisi";
      }

      if (!nama?.trim()) {
         errors.nama = "Nama standar biaya wajib diisi";
      }

      if (!id_kategori) {
         errors.id_kategori = "ID kategori wajib dipilih";
      }

      if (!id_unit_satuan) {
         errors.id_unit_satuan = "ID unit satuan wajib dipilih";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_standar_biaya_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            kode,
            nama,
            deskripsi,
            id_kategori: Number.parseInt(id_kategori),
            id_unit_satuan: Number.parseInt(id_unit_satuan),
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Standar biaya berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/referensi/standar-biaya/:id - Delete standar biaya
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_standar_biaya_master.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
