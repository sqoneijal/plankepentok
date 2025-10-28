const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { logAudit } = require("../helpers.js");
const errorHandler = require("../handle-error.js");
const { z } = require("zod");

const validation = z.object({
   id_jenis_usulan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Jenis usulan wajib diisi")),
   verifikator: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Verifikator wajib diisi")),
   tahap: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tahap wajib diisi")),
});

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await prisma.tb_verikator_usulan.count();
      const results = await prisma.tb_verikator_usulan.findMany({
         take: limit,
         skip: offset,
         select: {
            id: true,
            tahap: true,
            jenis_usulan: {
               select: {
                  id: true,
                  nama: true,
                  is_aktif: true,
               },
            },
            pengguna: {
               select: {
                  id: true,
                  fullname: true,
               },
            },
         },
      });

      return res.json({ results, total });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.get("/daftar-jenis-usulan", async (req, res) => {
   try {
      const results = await prisma.tb_jenis_usulan.findMany({
         where: { is_aktif: true },
         select: {
            id: true,
            nama: true,
         },
      });

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { id_jenis_usulan, user_modified, tahap, detail_verifikator, verifikator } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const pengguna = await prisma.tb_pengguna.findUnique({
         where: { username: verifikator },
      });

      let IdPengguna;

      if (pengguna) {
         IdPengguna = pengguna.id;
      } else {
         const createPengguna = await prisma.tb_pengguna.create({
            data: {
               username: verifikator,
               fullname: detail_verifikator?.nama,
            },
         });

         IdPengguna = createPengguna.id;

         logAudit("system", "CREATE", "tb_pengguna", req.ip, null, { ...createPengguna });
      }

      const newData = await prisma.tb_verikator_usulan.create({
         data: {
            id_jenis_usulan: Number.parseInt(id_jenis_usulan),
            id_pengguna: IdPengguna,
            uploaded: new Date(),
            user_modified,
            tahap: Number.parseInt(tahap),
         },
      });

      logAudit(user_modified, "CREATE", "tb_verikator_usulan", req.ip, null, { ...newData });

      return res.json({ status: true, message: "Verifikator berhasil ditambahkan" });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_verikator_usulan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Verifikator tidak ditemukan" });
      }

      await prisma.tb_verikator_usulan.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_verikator_usulan", req.ip, { ...oldData }, null);

      return res.json({ status: true, message: "Verifikator berhasil dihapus" });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

module.exports = router;
