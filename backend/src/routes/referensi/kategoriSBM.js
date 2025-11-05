const express = require("express");
const { PrismaClient } = require("@prisma/client");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");
const { z } = require("zod");

const validation = z.object({
   kode: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Kode kategori SBM wajib diisi")),
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama kategori SBM wajib diisi")),
});

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [
            { nama: { contains: search, mode: "insensitive" } },
            { deskripsi: { contains: search, mode: "insensitive" } },
            { kode: { contains: search, mode: "insensitive" } },
         ],
      };
      const where = search ? query : {};

      const total = await prisma.tb_kategori_sbm.count({ where });
      const results = await prisma.tb_kategori_sbm.findMany({
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
      const results = await prisma.tb_kategori_sbm.findUnique({
         where: { id: Number.parseInt(id) },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { kode, nama, deskripsi, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const duplicate = await prisma.tb_kategori_sbm.findUnique({
         where: { kode },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { kode: "Kode kategori SMB sudah terdaftar" } });
      }

      const newData = await prisma.tb_kategori_sbm.create({
         data: {
            kode,
            nama,
            deskripsi,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_kategori_sbm", req.ip, null, { ...newData });

      res.status(201).json({
         status: true,
         message: "Kategori SBM berhasil ditambahkan",
         refetchQuery: [["/referensi/kategori-sbm", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      if (error.code === "P2002") {
         return res.json({ status: false, error: "Kode kategori SBM sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { kode, nama, deskripsi, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const duplicate = await prisma.tb_kategori_sbm.findFirst({
         where: { kode, id: { not: Number.parseInt(id) } },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { kode: "Kode kategori SMB sudah terdaftar" } });
      }

      const oldData = await prisma.tb_kategori_sbm.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Kategori SBM tidak ditemukan" });
      }

      const newData = await prisma.tb_kategori_sbm.update({
         where: { id: Number.parseInt(id) },
         data: {
            kode,
            nama,
            deskripsi,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_kategori_sbm", req.ip, { ...oldData }, { ...newData });

      res.json({
         status: true,
         message: "Kategori SBM berhasil diperbaharui",
         refetchQuery: [
            ["/referensi/kategori-sbm", { limit: "25", offset: "0" }],
            [`/referensi/kategori-sbm/${id}`, {}],
         ],
      });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Kategori SBM tidak ditemukan" });
      }
      if (error.code === "P2002") {
         return res.json({ status: false, error: "Kode kategori SBM sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_kategori_sbm.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Kategori SBM tidak ditemukan" });
      }

      await prisma.tb_kategori_sbm.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_kategori_sbm", req.ip, { ...oldData }, null);

      res.json({ status: true, refetchQuery: [["/referensi/kategori-sbm", { limit: "25", offset: "0" }]] });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Kategori SBM tidak ditemukan" });
      }
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
