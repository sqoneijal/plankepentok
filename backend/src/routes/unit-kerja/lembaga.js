const express = require("express");
const { z } = require("zod");
const errorHandler = require("@/handle-error.js");
const { logAudit } = require("@/helpers.js");

const router = express.Router();
const db = require("@/db.js");

const lembagaSchema = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama lembaga wajib diisi")),
});

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = { nama: { contains: search, mode: "insensitive" } };
      const where = search ? query : {};

      const total = await db.read.tb_lembaga_master.count({ where });
      const results = await db.read.tb_lembaga_master.findMany({
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

      const results = await db.read.tb_lembaga_master.findUnique({
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

      const parsed = lembagaSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const newData = await db.write.tb_lembaga_master.create({
         data: {
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_lembaga_master", req.ip, null, { ...newData });

      res.status(201).json({
         status: true,
         message: "Lembaga berhasil ditambahkan",
         refetchQuery: [["/unit-kerja/lembaga", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, user_modified } = req.body;

      const parsed = lembagaSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.read.tb_lembaga_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Lembaga tidak ditemukan" });
      }

      const newData = await db.write.tb_lembaga_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_lembaga_master", req.ip, { ...oldData }, { ...newData });

      res.json({
         status: true,
         message: "Lembaga berhasil diperbaharui",
         refetchQuery: [
            ["/unit-kerja/lembaga", { limit: "25", offset: "0" }],
            [`/unit-kerja/lembaga/${id}`, {}],
         ],
      });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Lembaga tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await db.read.tb_lembaga_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Lembaga tidak ditemukan" });
      }

      await db.write.tb_lembaga_master.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_lembaga_master", req.ip, { ...oldData }, null);

      res.json({
         status: true,
         refetchQuery: [["/unit-kerja/lembaga", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Lembaga tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
