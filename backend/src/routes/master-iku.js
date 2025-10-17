const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/referensi/unit-satuan - Get all unit satuan
router.get("/", async (req, res) => {
   try {
      const limit = parseInt(req.query.limit) || 25;
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search || "";
      const tahun_berlaku = req.query.tahun_berlaku ? parseInt(req.query.tahun_berlaku) : null;

      const where = {};
      if (search) {
         where.OR = [
            { jenis: { contains: search, mode: "insensitive" } },
            { kode: { contains: search, mode: "insensitive" } },
            { deskripsi: { contains: search, mode: "insensitive" } },
         ];
      }
      if (tahun_berlaku !== null) {
         where.tahun_berlaku = tahun_berlaku;
      }

      const total = await prisma.tb_iku_master.count({ where });
      const results = await prisma.tb_iku_master.findMany({
         where,
         orderBy: { kode: "asc" },
         take: limit,
         skip: offset,
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
