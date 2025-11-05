const express = require("express");
const { z } = require("zod");
const errorHandler = require("@/handle-error.js");
const { logAudit } = require("@/helpers.js");

const validation = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama unit satuan wajib diisi")),
   aktif: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status unit satuan wajib diisi")),
});

const router = express.Router();
const prisma = require("@/db.js");

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [{ nama: { contains: search, mode: "insensitive" } }, { deskripsi: { contains: search, mode: "insensitive" } }],
      };
      const where = search ? query : {};

      const total = await prisma.tb_unit_satuan.count({ where });
      const results = await prisma.tb_unit_satuan.findMany({
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
      const results = await prisma.tb_unit_satuan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { nama, deskripsi, aktif, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const newData = await prisma.tb_unit_satuan.create({
         data: {
            nama,
            deskripsi,
            aktif: aktif === "true",
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_unit_satuan", req.ip, null, { ...newData });

      res.status(201).json({
         status: true,
         message: "Unit satuan berhasil ditambahkan",
         refetchQuery: [["/referensi/unit-satuan", { limit: "25", offset: "0", search: "" }]],
      });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, deskripsi, aktif, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_unit_satuan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Unit satuan tidak ditemukan" });
      }

      const newData = await prisma.tb_unit_satuan.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            deskripsi,
            aktif: aktif === "true",
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_unit_satuan", req.ip, { ...oldData }, { ...newData });

      res.json({
         status: true,
         message: "Unit satuan berhasil diperbaharui",
         refetchQuery: [
            ["/referensi/unit-satuan", { limit: "25", offset: "0", search: "" }],
            [`/referensi/unit-satuan/${id}`, {}],
         ],
      });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Unit satuan tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_unit_satuan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Unit satuan tidak ditemukan" });
      }

      await prisma.tb_unit_satuan.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_unit_satuan", req.ip, { ...oldData }, null);

      res.json({ status: true, refetchQuery: [["/referensi/unit-satuan", { limit: "25", offset: "0", search: "" }]] });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Unit satuan tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
