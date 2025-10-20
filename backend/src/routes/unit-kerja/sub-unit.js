const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");

const router = express.Router();
const prisma = new PrismaClient();

const subUnitSchema = z.object({
   id_parent: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama UPT wajib diisi")),
});

router.get("/options", async (req, res) => {
   try {
      const biroData = await prisma.tb_biro_master.findMany();
      const lembagaData = await prisma.tb_lembaga_master.findMany();
      const uptData = await prisma.tb_upt_master.findMany();
      const fakultasData = await prisma.tb_fakultas_master.findMany();

      const results = [];
      for (const row of biroData) {
         results.push({
            id: row.id,
            nama: row.nama,
            level: "biro",
         });
      }

      for (const row of lembagaData) {
         results.push({
            id: row.id,
            nama: row.nama,
            level: "lembaga",
         });
      }

      for (const row of uptData) {
         results.push({
            id: row.id,
            nama: row.nama,
            level: "upt",
         });
      }

      for (const row of fakultasData) {
         results.push({
            id: row.id,
            nama: row.nama,
            level: "fakultas",
         });
      }

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = { nama: { contains: search, mode: "insensitive" } };
      const where = search ? query : {};

      const total = await prisma.tb_sub_unit.count({ where });
      const results = await prisma.tb_sub_unit.findMany({
         where,
         orderBy: { id: "desc" },
         include: {
            biro: {
               select: { id: true, nama: true },
            },
            fakultas: {
               select: { id: true, nama: true },
            },
            lembaga: {
               select: { id: true, nama: true },
            },
            upt: {
               select: { id: true, nama: true },
            },
         },
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

      const results = await prisma.tb_sub_unit.findUnique({
         where: { id: Number.parseInt(id) },
         include: {
            biro: true,
            fakultas: true,
            lembaga: true,
            upt: true,
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { id_parent, nama, user_modified } = req.body;

      const parsed = subUnitSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const extract = id_parent.split("-");
      const id_relation = Number.parseInt(extract[0]);
      const level = extract[1];

      const newData = await prisma.tb_sub_unit.create({
         data: {
            level,
            id_biro: level === "biro" ? id_relation : null,
            id_lembaga: level === "lembaga" ? id_relation : null,
            id_upt: level === "upt" ? id_relation : null,
            id_fakultas: level === "fakultas" ? id_relation : null,
            nama,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_sub_unit", req.ip, null, { ...newData });

      res.status(201).json({ status: true, message: "Sub unit berhasil ditambahkan" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id_parent, nama, user_modified } = req.body;
      const { id } = req.params;

      const parsed = subUnitSchema.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_sub_unit.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Sub unit tidak ditemukan" });
      }

      const extract = id_parent.split("-");
      const id_relation = Number.parseInt(extract[0]);
      const level = extract[1];

      const newData = await prisma.tb_sub_unit.update({
         where: { id: Number.parseInt(id) },
         data: {
            level,
            id_biro: level === "biro" ? id_relation : null,
            id_lembaga: level === "lembaga" ? id_relation : null,
            id_upt: level === "upt" ? id_relation : null,
            id_fakultas: level === "fakultas" ? id_relation : null,
            nama,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_sub_unit", req.ip, { ...oldData }, { ...newData });

      res.status(201).json({ status: true, message: "Sub unit berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_sub_unit.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Sub unit tidak ditemukan" });
      }

      await prisma.tb_sub_unit.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_sub_unit", req.ip, { ...oldData }, null);

      res.json({ status: true, message: "Sub unit berhasil dihapus" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Submit unit tidak ditemukan" });
      }

      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
