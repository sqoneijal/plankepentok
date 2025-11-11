const express = require("express");
const { logAudit } = require("../helpers.js");

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

const router = express.Router();
const db = require("@/db.js");

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await db.read.tb_pengaturan.count();
      const results = await db.read.tb_pengaturan.findMany({
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         select: {
            id: true,
            tahun_anggaran: true,
            total_pagu: true,
            realisasi: true,
            is_aktif: true,
         },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const results = await db.read.tb_pengaturan.findUnique({
         where: { id: Number.parseInt(id) },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:tahun_anggaran/biro", async (req, res) => {
   try {
      const { tahun_anggaran } = req.params;
      const tahun = Number.parseInt(tahun_anggaran);

      // Fetch all biros
      const biros = await db.read.tb_biro_master.findMany();

      // Fetch existing pagu for this tahun
      const existingPagu = await db.read.tb_pagu_anggaran_biro.findMany({
         where: { tahun_anggaran: tahun },
         select: { id_biro: true },
      });

      const existingIds = new Set(existingPagu.map((p) => p.id_biro));

      // Find biros without pagu
      const missingBiros = biros.filter((biro) => !existingIds.has(biro.id));

      // Insert missing pagu
      if (missingBiros.length > 0) {
         const inserts = missingBiros.map((biro) => ({
            tahun_anggaran: tahun,
            total_pagu: 0,
            realisasi: 0,
            id_biro: biro.id,
            uploaded: new Date(),
            user_modified: "system",
         }));

         const newData = await db.write.tb_pagu_anggaran_biro.createMany({
            data: inserts,
            skipDuplicates: true,
         });

         logAudit("system", "CREATE", "tb_pagu_anggaran_biro", req.ip, null, { ...newData });
      }

      // Fetch all results
      const results = await db.read.tb_pagu_anggaran_biro.findMany({
         where: { tahun_anggaran: tahun },
         orderBy: { id: "asc" },
         select: {
            id: true,
            tahun_anggaran: true,
            total_pagu: true,
            realisasi: true,
            id_biro: true,
            biro_master: {
               select: {
                  id: true,
                  nama: true,
                  sub_unit: {
                     select: {
                        id: true,
                        level: true,
                        nama: true,
                     },
                  },
               },
            },
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/biro/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      const oldData = await db.read.tb_pagu_anggaran_biro.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Pagu biro tidak ditemukan" });
      }

      const newData = await db.write.tb_pagu_anggaran_biro.update({
         where: { id: Number.parseInt(id) },
         data: {
            total_pagu: cleanRupiah(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_pagu_anggaran_biro", req.ip, { ...oldData }, { ...newData });

      res.json({
         status: true,
         message: "Pagu biro berhasil diperbaharui",
         refetchQuery: [[`/pagu-anggaran/${oldData.tahun_anggaran}/sub-unit`]],
      });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:tahun_anggaran/fakultas", async (req, res) => {
   try {
      const { tahun_anggaran } = req.params;
      const tahun = Number.parseInt(tahun_anggaran);

      // Fetch all fakultas
      const fakultas = await db.read.tb_fakultas_master.findMany();

      // Fetch existing pagu for this tahun
      const existingPagu = await db.read.tb_pagu_anggaran_fakultas.findMany({
         where: { tahun_anggaran: tahun },
         select: { id_fakultas: true },
      });

      const existingIds = new Set(existingPagu.map((p) => p.id_fakultas));

      // Find fakultas without pagu
      const missingFakultas = fakultas.filter((fakulta) => !existingIds.has(fakulta.id));

      // Insert missing pagu
      if (missingFakultas.length > 0) {
         const inserts = missingFakultas.map((fakulta) => ({
            tahun_anggaran: tahun,
            total_pagu: 0,
            realisasi: 0,
            id_fakultas: fakulta.id,
            uploaded: new Date(),
            user_modified: "system",
         }));

         const newData = await db.write.tb_pagu_anggaran_fakultas.createMany({
            data: inserts,
            skipDuplicates: true,
         });

         logAudit("system", "CREATE", "tb_pagu_anggaran_fakultas", req.ip, null, { ...newData });
      }

      // Fetch all results
      const results = await db.read.tb_pagu_anggaran_fakultas.findMany({
         where: { tahun_anggaran: tahun },
         orderBy: { id: "asc" },
         select: {
            id: true,
            tahun_anggaran: true,
            total_pagu: true,
            realisasi: true,
            fakultas_master: {
               select: {
                  id: true,
                  nama: true,
                  sub_unit: {
                     select: {
                        id: true,
                        level: true,
                        nama: true,
                     },
                  },
               },
            },
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/fakultas/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      const oldData = await db.read.tb_pagu_anggaran_fakultas.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Pagu fakultas tidak ditemukan" });
      }

      const newData = await db.write.tb_pagu_anggaran_fakultas.update({
         where: { id: Number.parseInt(id) },
         data: {
            total_pagu: cleanRupiah(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_pagu_anggaran_fakultas", req.ip, { ...oldData }, { ...newData });

      res.json({ status: true, message: "Pagu fakultas berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:tahun_anggaran/upt", async (req, res) => {
   try {
      const { tahun_anggaran } = req.params;
      const tahun = Number.parseInt(tahun_anggaran);

      // Fetch all upts
      const upts = await db.read.tb_upt_master.findMany();

      // Fetch existing pagu for this tahun
      const existingPagu = await db.read.tb_pagu_anggaran_upt.findMany({
         where: { tahun_anggaran: tahun },
         select: { id_upt: true },
      });

      const existingIds = new Set(existingPagu.map((p) => p.id_upt));

      // Find upts without pagu
      const missingUpts = upts.filter((upt) => !existingIds.has(upt.id));

      // Insert missing pagu
      if (missingUpts.length > 0) {
         const inserts = missingUpts.map((upt) => ({
            tahun_anggaran: tahun,
            total_pagu: 0,
            realisasi: 0,
            id_upt: upt.id,
            uploaded: new Date(),
            user_modified: "system",
         }));

         const newData = await db.write.tb_pagu_anggaran_upt.createMany({
            data: inserts,
            skipDuplicates: true,
         });

         logAudit("system", "CREATE", "tb_pagu_anggaran_upt", req.ip, null, { ...newData });
      }

      // Fetch all results
      const results = await db.read.tb_pagu_anggaran_upt.findMany({
         where: { tahun_anggaran: tahun },
         orderBy: { id: "asc" },
         select: {
            id: true,
            tahun_anggaran: true,
            total_pagu: true,
            realisasi: true,
            upt_master: {
               select: {
                  id: true,
                  nama: true,
                  sub_unit: {
                     select: {
                        id: true,
                        level: true,
                        nama: true,
                     },
                  },
               },
            },
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/upt/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      const oldData = await db.read.tb_pagu_anggaran_upt.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Pagu UPT tidak ditemukan" });
      }

      const newData = await db.write.tb_pagu_anggaran_upt.update({
         where: { id: Number.parseInt(id) },
         data: {
            total_pagu: cleanRupiah(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_pagu_anggaran_upt", req.ip, { ...oldData }, { ...newData });

      res.json({ status: true, message: "Pagu UPT berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:tahun_anggaran/lembaga", async (req, res) => {
   try {
      const { tahun_anggaran } = req.params;
      const tahun = Number.parseInt(tahun_anggaran);

      // Fetch all lembagas
      const lembagas = await db.read.tb_lembaga_master.findMany();

      // Fetch existing pagu for this tahun
      const existingPagu = await db.read.tb_pagu_anggaran_lembaga.findMany({
         where: { tahun_anggaran: tahun },
         select: { id_lembaga: true },
      });

      const existingIds = new Set(existingPagu.map((p) => p.id_lembaga));

      // Find lembagas without pagu
      const missingLembagas = lembagas.filter((lembaga) => !existingIds.has(lembaga.id));

      // Insert missing pagu
      if (missingLembagas.length > 0) {
         const inserts = missingLembagas.map((lembaga) => ({
            tahun_anggaran: tahun,
            total_pagu: 0,
            realisasi: 0,
            id_lembaga: lembaga.id,
            uploaded: new Date(),
            user_modified: "system",
         }));

         const newData = await db.write.tb_pagu_anggaran_lembaga.createMany({
            data: inserts,
            skipDuplicates: true,
         });

         logAudit("system", "CREATE", "tb_pagu_anggaran_lembaga", req.ip, null, { ...newData });
      }

      // Fetch all results
      const results = await db.read.tb_pagu_anggaran_lembaga.findMany({
         where: { tahun_anggaran: tahun },
         orderBy: { id: "asc" },
         select: {
            id: true,
            tahun_anggaran: true,
            total_pagu: true,
            realisasi: true,
            lembaga_master: {
               select: {
                  id: true,
                  nama: true,
                  sub_unit: {
                     select: {
                        id: true,
                        level: true,
                        nama: true,
                     },
                  },
               },
            },
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/lembaga/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      const oldData = await db.read.tb_pagu_anggaran_lembaga.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Pagu lembaga tidak ditemukan" });
      }

      const newData = await db.write.tb_pagu_anggaran_lembaga.update({
         where: { id: Number.parseInt(id) },
         data: {
            total_pagu: cleanRupiah(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_pagu_anggaran_lembaga", req.ip, { ...oldData }, { ...newData });

      res.json({ status: true, message: "Pagu lembaga berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:tahun_anggaran/sub-unit", async (req, res) => {
   try {
      const { tahun_anggaran } = req.params;
      const tahun = Number.parseInt(tahun_anggaran);

      // Fetch all
      const subUnits = await db.read.tb_sub_unit.findMany();

      // Fetch existing pagu for this tahun
      const existingPagu = await db.read.tb_pagu_sub_unit.findMany({
         where: { tahun_anggaran: tahun },
         select: { id_sub_unit: true },
      });

      const existingIds = new Set(existingPagu.map((p) => p.id_sub_unit));

      // Find subUnits without pagu
      const missingSubUnits = subUnits.filter((row) => !existingIds.has(row.id));

      // Insert missing pagu
      if (missingSubUnits.length > 0) {
         const inserts = missingSubUnits.map((row) => ({
            tahun_anggaran: tahun,
            total_pagu: 0,
            realisasi: 0,
            id_sub_unit: row.id,
            uploaded: new Date(),
            user_modified: "system",
         }));

         const newData = await db.write.tb_pagu_sub_unit.createMany({
            data: inserts,
            skipDuplicates: true,
         });

         logAudit("system", "CREATE", "tb_pagu_sub_unit", req.ip, null, { ...newData });
      }

      // Fetch all results
      const results = await db.read.tb_pagu_sub_unit.findMany({
         where: { tahun_anggaran: tahun },
         orderBy: { id: "asc" },
         select: {
            id: true,
            id_sub_unit: true,
            tahun_anggaran: true,
            total_pagu: true,
            realisasi: true,
            sub_unit: {
               select: {
                  id: true,
                  nama: true,
               },
            },
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/sub-unit/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      const oldData = await db.read.tb_pagu_sub_unit.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Pagu sub unit tidak ditemukan" });
      }

      const newData = await db.write.tb_pagu_sub_unit.update({
         where: { id: Number.parseInt(id) },
         data: {
            total_pagu: cleanRupiah(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_pagu_sub_unit", req.ip, { ...oldData }, { ...newData });

      res.json({ status: true, message: "Pagu sub unit berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
