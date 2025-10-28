const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");

const validation = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama jenis wajib diisi")),
   is_aktif: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
});

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await prisma.tb_jenis_usulan.count();
      const results = await prisma.tb_jenis_usulan.findMany({
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         select: {
            id: true,
            nama: true,
            is_aktif: true,
         },
      });

      return res.json({ results, total });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const results = await prisma.tb_jenis_usulan.findUnique({
         where: { id: Number.parseInt(id) },
         select: {
            id: true,
            nama: true,
            is_aktif: true,
         },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { nama, is_aktif, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const newData = await prisma.tb_jenis_usulan.create({
         data: {
            nama,
            is_aktif: is_aktif === "true",
            user_modified,
            uploaded: new Date(),
         },
      });

      logAudit(user_modified, "CREATE", "tb_jenis_usulan", req.ip, null, { ...newData });

      return res.status(201).json({ status: true, message: "Jenis usulan berhasil ditambahkan" });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, is_aktif, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_jenis_usulan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Jenis usulan tidak ditemukan" });
      }

      const newData = await prisma.tb_jenis_usulan.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            is_aktif: is_aktif === "true",
            user_modified,
            modified: new Date(),
         },
      });

      logAudit(user_modified, "UPDATE", "tb_jenis_usulan", req.ip, { ...oldData }, { ...newData });

      return res.json({ status: true, message: "Jenis usulan berhasil diperbaharui" });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_jenis_usulan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Jenis usulan tidak ditemukan" });
      }

      await prisma.tb_jenis_usulan.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_jenis_usulan", req.ip, { ...oldData }, null);

      return res.json({ status: true, message: "Jenis usulan berhasil dihapus" });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

module.exports = router;
