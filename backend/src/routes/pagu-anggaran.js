const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/universitas", async (req, res) => {
   try {
      const tahun_anggaran = parseInt(req.query.tahun_anggaran) || 0;
      const results = await prisma.tb_pengaturan.findFirst({
         where: { tahun_anggaran },
      });

      const pagu_universitas = parseInt(results.total_pagu) || 0;

      const resultsBiro = await prisma.tb_biro_master.findMany({
         include: {
            pagu_anggaran: {
               where: { tahun_anggaran },
            },
         },
      });

      let pagu_biro = 0;
      resultsBiro.map((row) => (pagu_biro += parseInt(row.total_pagu)));

      const sisa_pagu_sementara = pagu_universitas - pagu_biro;

      res.json({ results, sisa_pagu_sementara });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/biro", async (req, res) => {
   try {
      const tahun_anggaran = parseInt(req.query.tahun_anggaran) || 0;
      const results = await prisma.tb_biro_master.findMany({
         include: {
            pagu_anggaran: {
               where: { tahun_anggaran },
            },
         },
      });

      // Transform pagu_anggaran from array to object (take first or null)
      const transformedResults = results.map((r) => ({
         ...r,
         pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : null,
      }));

      // Check for biros with empty pagu_anggaran and insert new records
      const birosToInsert = transformedResults.filter((r) => r.pagu_anggaran === null).map((r) => r.id);
      if (birosToInsert.length > 0) {
         await prisma.tb_pagu_anggaran_biro.createMany({
            data: birosToInsert.map((id) => ({
               id_biro: id,
               tahun_anggaran,
            })),
         });

         // Refetch the results to include the newly inserted records
         const updatedResults = await prisma.tb_biro_master.findMany({
            include: {
               pagu_anggaran: {
                  where: { tahun_anggaran },
               },
            },
         });
         // Transform again
         const transformedUpdatedResults = updatedResults.map((r) => ({
            ...r,
            pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : {},
         }));
         res.json({ results: transformedUpdatedResults });
      } else {
         res.json({ results: transformedResults });
      }
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/biro/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      await prisma.tb_pagu_anggaran_biro.update({
         where: { id: parseInt(id) },
         data: {
            total_pagu: parseInt(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Pagu biro berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/lembaga/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      await prisma.tb_pagu_anggaran_lembaga.update({
         where: { id: parseInt(id) },
         data: {
            total_pagu: parseInt(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Pagu lembaga berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/lembaga", async (req, res) => {
   try {
      const tahun_anggaran = parseInt(req.query.tahun_anggaran) || 0;
      const results = await prisma.tb_lembaga_master.findMany({
         include: {
            pagu_anggaran: {
               where: { tahun_anggaran },
            },
         },
      });

      // Transform pagu_anggaran from array to object (take first or null)
      const transformedResults = results.map((r) => ({
         ...r,
         pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : null,
      }));

      // Check for lembaga with empty pagu_anggaran and insert new records
      const lembagaToInsert = transformedResults.filter((r) => r.pagu_anggaran === null).map((r) => r.id);
      if (lembagaToInsert.length > 0) {
         await prisma.tb_pagu_anggaran_lembaga.createMany({
            data: lembagaToInsert.map((id) => ({
               id_lembaga: id,
               tahun_anggaran,
            })),
         });

         // Refetch the results to include the newly inserted records
         const updatedResults = await prisma.tb_lembaga_master.findMany({
            include: {
               pagu_anggaran: {
                  where: { tahun_anggaran },
               },
            },
         });
         // Transform again
         const transformedUpdatedResults = updatedResults.map((r) => ({
            ...r,
            pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : {},
         }));
         res.json({ results: transformedUpdatedResults });
      } else {
         res.json({ results: transformedResults });
      }
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/fakultas", async (req, res) => {
   try {
      const tahun_anggaran = Number.parseInt(req.query.tahun_anggaran) || 0;
      const results = await prisma.tb_fakultas_master.findMany({
         include: {
            pagu_anggaran: {
               where: { tahun_anggaran },
            },
         },
      });

      // Transform pagu_anggaran from array to object (take first or null)
      const transformedResults = results.map((r) => ({
         ...r,
         pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : null,
      }));

      // Check for fakultas with empty pagu_anggaran and insert new records
      const fakultasToInsert = transformedResults.filter((r) => r.pagu_anggaran === null).map((r) => r.id);
      if (fakultasToInsert.length > 0) {
         await prisma.tb_pagu_anggaran_fakultas.createMany({
            data: fakultasToInsert.map((id) => ({
               id_fakultas: id,
               tahun_anggaran,
            })),
         });

         // Refetch the results to include the newly inserted records
         const updatedResults = await prisma.tb_fakultas_master.findMany({
            include: {
               pagu_anggaran: {
                  where: { tahun_anggaran },
               },
            },
         });
         // Transform again
         const transformedUpdatedResults = updatedResults.map((r) => ({
            ...r,
            pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : {},
         }));
         res.json({ results: transformedUpdatedResults });
      } else {
         res.json({ results: transformedResults });
      }
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/fakultas/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      await prisma.tb_pagu_anggaran_fakultas.update({
         where: { id: parseInt(id) },
         data: {
            total_pagu: parseInt(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Pagu fakultas berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/prodi/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { total_pagu, user_modified } = req.body;

      await prisma.tb_pagu_anggaran_prodi.update({
         where: { id: parseInt(id) },
         data: {
            total_pagu: parseInt(total_pagu),
            modified: new Date(),
            user_modified,
         },
      });
      res.json({ status: true, message: "Pagu prodi berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/prodi", async (req, res) => {
   try {
      const tahun_anggaran = parseInt(req.query.tahun_anggaran) || 0;
      const results = await prisma.tb_prodi_master.findMany({
         include: {
            pagu_anggaran: {
               where: { tahun_anggaran },
            },
         },
      });

      // Transform pagu_anggaran from array to object (take first or null)
      const transformedResults = results.map((r) => ({
         ...r,
         pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : null,
      }));

      // Check for prodi with empty pagu_anggaran and insert new records
      const prodiToInsert = transformedResults.filter((r) => r.pagu_anggaran === null).map((r) => r.id);
      if (prodiToInsert.length > 0) {
         await prisma.tb_pagu_anggaran_prodi.createMany({
            data: prodiToInsert.map((id) => ({
               id_prodi: id,
               tahun_anggaran,
            })),
         });

         // Refetch the results to include the newly inserted records
         const updatedResults = await prisma.tb_prodi_master.findMany({
            include: {
               pagu_anggaran: {
                  where: { tahun_anggaran },
               },
            },
         });
         // Transform again
         const transformedUpdatedResults = updatedResults.map((r) => ({
            ...r,
            pagu_anggaran: r.pagu_anggaran.length > 0 ? r.pagu_anggaran[0] : {},
         }));
         res.json({ results: transformedUpdatedResults });
      } else {
         res.json({ results: transformedResults });
      }
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
