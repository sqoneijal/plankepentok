const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/kategori-sbm", async (req, res) => {
   try {
      const results = await prisma.tb_kategori_sbm.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/unit-satuan", async (req, res) => {
   try {
      const results = await prisma.tb_unit_satuan.findMany({
         where: { aktif: true },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/tahun-anggaran", async (req, res) => {
   try {
      const results = await prisma.tb_pengaturan.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/standar-biaya", async (req, res) => {
   try {
      const results = await prisma.tb_standar_biaya_master.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/biro", async (req, res) => {
   try {
      const results = await prisma.tb_biro_master.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/fakultas", async (req, res) => {
   try {
      const results = await prisma.tb_fakultas_master.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/tahun-anggaran", async (req, res) => {
   try {
      const results = await prisma.tb_pengaturan.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
