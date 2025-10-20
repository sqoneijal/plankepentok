const express = require("express");
const { PrismaClient } = require("@prisma/client");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");
const { z } = require("zod");

const validation = z.object({
   kode: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Kode standar biaya wajib diisi")),
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama standar biaya wajib diisi")),
   id_kategori: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Kategori wajib diisi")),
   id_unit_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Unit satuan wajib diisi")),
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
            { kode: { contains: search, mode: "insensitive" } },
            { nama: { contains: search, mode: "insensitive" } },
            { deskripsi: { contains: search, mode: "insensitive" } },
         ],
      };
      const where = search ? query : {};

      const total = await prisma.tb_standar_biaya_master.count({ where });
      const results = await prisma.tb_standar_biaya_master.findMany({
         where,
         include: {
            kategori_sbm: true,
            unit_satuan: true,
         },
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
      const results = await prisma.tb_standar_biaya_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { kode, nama, deskripsi, id_kategori, id_unit_satuan, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const duplicate = await prisma.tb_standar_biaya_master.findUnique({
         where: { kode },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { kode: "Kode standar biaya sudah terdaftar" } });
      }

      const newData = await prisma.tb_standar_biaya_master.create({
         data: {
            kode,
            nama,
            deskripsi,
            id_kategori: Number.parseInt(id_kategori),
            id_unit_satuan: Number.parseInt(id_unit_satuan),
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_standar_biaya_master", req.ip, null, { ...newData });

      res.status(201).json({ status: true, message: "Standar biaya berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { kode, nama, deskripsi, id_kategori, id_unit_satuan, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const duplicate = await prisma.tb_standar_biaya_master.findFirst({
         where: { kode, id: { not: Number.parseInt(id) } },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { kode: "Kode standar biaya sudah terdaftar" } });
      }

      const oldData = await prisma.tb_standar_biaya_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Standa biaya tidak ditemukan" });
      }

      const newData = await prisma.tb_standar_biaya_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            kode,
            nama,
            deskripsi,
            id_kategori: Number.parseInt(id_kategori),
            id_unit_satuan: Number.parseInt(id_unit_satuan),
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_standar_biaya_master", req.ip, { ...oldData }, { ...newData });

      res.json({ status: true, message: "Standar biaya berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_standar_biaya_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Standar biaya tidak ditemukan" });
      }

      await prisma.tb_standar_biaya_master.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_standar_biaya_master", req.ip, { ...oldData }, null);

      res.json({ status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
