const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const { logAudit } = require("../../helpers.js");
const errorHandler = require("../../handle-error.js");

const router = express.Router();
const prisma = new PrismaClient();

const fakultasSchema = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama fakultas wajib diisi")),
});

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = { nama: { contains: search, mode: "insensitive" } };
      const where = search ? query : {};

      const total = await prisma.tb_fakultas_master.count({ where });
      const results = await prisma.tb_fakultas_master.findMany({
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

      const results = await prisma.tb_fakultas_master.findUnique({
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

      const parsed = fakultasSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const newData = await prisma.tb_fakultas_master.create({
         data: {
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_fakultas_master", req.ip, null, { ...newData });

      res.status(201).json({
         status: true,
         message: "Fakultas berhasil ditambahkan",
         refetchQuery: [["/unit-kerja/fakultas", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, user_modified } = req.body;

      const parsed = fakultasSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_fakultas_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Fakultas tidak ditemukan" });
      }

      const newData = await prisma.tb_fakultas_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_fakultas_master", req.ip, { ...oldData }, { ...newData });

      res.json({
         status: true,
         message: "Fakultas berhasil diperbaharui",
         refetchQuery: [
            ["/unit-kerja/fakultas", { limit: "25", offset: "0" }],
            [`/unit-kerja/fakultas/${id}`, {}],
         ],
      });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Fakultas tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_fakultas_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Fakultas tidak ditemukan" });
      }

      await prisma.tb_fakultas_master.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_fakultas_master", req.ip, { ...oldData }, null);

      res.json({
         status: true,
         refetchQuery: [["/unit-kerja/fakultas", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Fakultas tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
