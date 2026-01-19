const express = require("express");
const router = express.Router();
const db = require("@/db.js");

router.get("/kategori-sbm", async (req, res) => {
   try {
      const results = await db.read.tb_kategori_sbm.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/unit-satuan", async (req, res) => {
   try {
      const results = await db.read.tb_unit_satuan.findMany({
         where: { aktif: true },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/tahun-anggaran", async (req, res) => {
   try {
      const results = await db.read.tb_pengaturan.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/standar-biaya", async (req, res) => {
   try {
      const results = await db.read.tb_standar_biaya_master.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/biro", async (req, res) => {
   try {
      const results = await db.read.tb_biro_master.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/fakultas", async (req, res) => {
   try {
      const results = await db.read.tb_fakultas_master.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/tahun-anggaran", async (req, res) => {
   try {
      const results = await db.read.tb_pengaturan.findMany();
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/jenis-keluaran-tor", async (req, res) => {
   try {
      const results = await db.read.tb_mst_jenis_keluaran_tor.findMany({
         select: {
            id: true,
            nama: true,
            keterangan: true,
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/penerima-manfaat-tor", async (req, res) => {
   try {
      const results = await db.read.tb_mst_penerima_manfaat_tor.findMany({
         select: {
            id: true,
            nama: true,
            keterangan: true,
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/volume-keluaran-tor", async (req, res) => {
   try {
      const results = await db.read.tb_mst_volume_keluaran_tor.findMany({
         select: {
            id: true,
            nama: true,
            keterangan: true,
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
