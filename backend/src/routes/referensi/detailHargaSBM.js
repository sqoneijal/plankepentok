const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/referensi/detail-harga-sbm - Get all detail harga sbm
router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [
            { id_standar_biaya: { equals: Number.parseInt(search) || undefined } },
            { tahun_anggaran: { equals: Number.parseFloat(search) || undefined } },
            { status_validasi: { contains: search, mode: "insensitive" } },
         ].filter(Boolean),
      };
      const where = search ? query : {};

      const total = await prisma.tb_detail_harga_sbm.count({ where });
      const results = await prisma.tb_detail_harga_sbm.findMany({
         where,
         include: {
            standar_biaya: {
               include: {
                  kategori_sbm: true,
                  unit_satuan: true,
               },
            },
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

// GET /api/referensi/detail-harga-sbm/:id - Get detail harga sbm by id
router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const data = await prisma.tb_detail_harga_sbm.findUnique({
         where: { id: Number.parseInt(id) },
         include: {
            standar_biaya: {
               include: {
                  tb_kategori_sbm: true,
                  unit_satuan: true,
               },
            },
            unit_satuan: true,
         },
      });
      if (!data) {
         return res.json({ status: false, error: "Detail harga SBM tidak ditemukan" });
      }
      res.json({ data, status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// POST /api/referensi/detail-harga-sbm - Create new detail harga sbm
router.post("/", async (req, res) => {
   try {
      const {
         id_standar_biaya,
         tahun_anggaran,
         harga_satuan,
         id_satuan,
         tanggal_mulai_efektif,
         tanggal_akhir_efektif,
         status_validasi,
         user_modified,
      } = req.body;

      const errors = {};

      if (!id_standar_biaya?.trim()) {
         errors.id_standar_biaya = "Standar biaya wajib dipilih";
      }

      if (!tahun_anggaran?.trim()) {
         errors.tahun_anggaran = "Tahun anggaran wajib diisi";
      }

      if (!id_satuan?.trim()) {
         errors.id_satuan = "Unit satuan wajib dipilih";
      }

      if (!harga_satuan?.trim()) {
         errors.harga_satuan = "Harga satuan wajib diisi";
      }

      if (!tanggal_mulai_efektif?.trim()) {
         errors.tanggal_mulai_efektif = "Tanggal mulai efektif wajib diisi";
      }

      if (!tanggal_akhir_efektif?.trim()) {
         errors.tanggal_akhir_efektif = "Tanggal akhir efektif wajib diisi";
      }

      if (!status_validasi?.trim()) {
         errors.status_validasi = "Status validasi wajib diisi";
      }

      // Validasi apakah kombinasi sudah terdaftar
      const existing = await prisma.tb_detail_harga_sbm.findFirst({
         where: {
            id_standar_biaya: Number.parseInt(id_standar_biaya),
            tahun_anggaran: Number.parseFloat(tahun_anggaran),
            id_satuan: Number.parseInt(id_satuan),
         },
      });
      if (existing) {
         errors.tahun_anggaran = "Kombinasi standar biaya, tahun anggaran, dan unit satuan sudah terdaftar";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_detail_harga_sbm.create({
         data: {
            id_standar_biaya: Number.parseInt(id_standar_biaya),
            tahun_anggaran: Number.parseFloat(tahun_anggaran),
            harga_satuan: Number.parseFloat(harga_satuan),
            id_satuan: Number.parseInt(id_satuan),
            tanggal_mulai_efektif: new Date(tanggal_mulai_efektif),
            tanggal_akhir_efektif: new Date(tanggal_akhir_efektif),
            status_validasi,
            uploaded: new Date(),
            user_modified,
         },
      });
      res.status(201).json({ status: true, message: "Detail harga SBM berhasil ditambahkan" });
   } catch (error) {
      if (error.code === "P2002") {
         return res.status(400).json({ status: false, error: "Kombinasi ID SBM, tahun anggaran, dan ID satuan sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

// PUT /api/referensi/detail-harga-sbm/:id - Update detail harga sbm
router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const {
         id_standar_biaya,
         tahun_anggaran,
         harga_satuan,
         id_satuan,
         tanggal_mulai_efektif,
         tanggal_akhir_efektif,
         status_validasi,
         user_modified,
      } = req.body;

      const errors = {};

      if (!id_standar_biaya) {
         errors.id_standar_biaya = "Standar biaya wajib dipilih";
      }

      if (!tahun_anggaran) {
         errors.tahun_anggaran = "Tahun anggaran wajib dipilih";
      }

      if (!harga_satuan) {
         errors.harga_satuan = "Harga satuan wajib diisi";
      }

      if (!id_satuan) {
         errors.id_satuan = "Unit satuan wajib dipilih";
      }

      if (!tanggal_mulai_efektif) {
         errors.tanggal_mulai_efektif = "Tanggal mulai efektif wajib diisi";
      }

      if (!tanggal_akhir_efektif) {
         errors.tanggal_akhir_efektif = "Tanggal akhir efektif wajib diisi";
      }

      if (!status_validasi?.trim()) {
         errors.status_validasi = "Status validasi wajib diisi";
      }

      if (Object.keys(errors).length > 0) {
         return res.json({ status: false, errors, message: "Periksa kembali isian anda" });
      }

      await prisma.tb_detail_harga_sbm.update({
         where: { id: Number.parseInt(id) },
         data: {
            id_standar_biaya: Number.parseInt(id_standar_biaya),
            tahun_anggaran: Number.parseFloat(tahun_anggaran),
            harga_satuan: Number.parseFloat(harga_satuan),
            id_satuan: Number.parseInt(id_satuan),
            tanggal_mulai_efektif: new Date(tanggal_mulai_efektif),
            tanggal_akhir_efektif: new Date(tanggal_akhir_efektif),
            status_validasi,
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Detail harga SBM berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Detail harga SBM tidak ditemukan" });
      }
      if (error.code === "P2002") {
         return res.status(400).json({ status: false, error: "Kombinasi ID SBM, tahun anggaran, dan ID satuan sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

// DELETE /api/referensi/detail-harga-sbm/:id - Delete detail harga sbm
router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      await prisma.tb_detail_harga_sbm.delete({
         where: { id: Number.parseInt(id) },
      });
      res.json({ status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
