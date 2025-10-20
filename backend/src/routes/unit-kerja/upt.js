const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");

const router = express.Router();
const prisma = new PrismaClient();

const uptSchema = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama UPT wajib diisi")),
});

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = { nama: { contains: search, mode: "insensitive" } };
      const where = search ? query : {};

      const total = await prisma.tb_upt_master.count({ where });
      const results = await prisma.tb_upt_master.findMany({
         where,
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const results = await prisma.tb_upt_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { nama, user_modified } = req.body;

      const parsed = uptSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const newData = await prisma.tb_upt_master.create({
         data: {
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_upt_master", req.ip, null, { ...newData });

      res.status(201).json({ status: true, message: "UPT berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, user_modified } = req.body;

      const parsed = uptSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_upt_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "UPT tidak ditemukan" });
      }

      const newData = await prisma.tb_upt_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_upt_master", req.ip, { ...oldData }, { ...newData });

      res.json({ status: true, message: "UPT berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "UPT tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_upt_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "UPT tidak ditemukan" });
      }

      await prisma.tb_upt_master.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_upt_master", req.ip, { ...oldData }, null);

      res.json({ status: true, message: "UPT berhasil dihapus" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "UPT tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
