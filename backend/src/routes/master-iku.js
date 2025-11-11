const express = require("express");
const errorHandler = require("../handle-error.js");
const { logAudit } = require("../helpers.js");
const { z } = require("zod");

const validation = z.object({
   jenis: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Jenis IKU wajib diisi")),
   kode: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Kode IKU wajib diisi")),
   tahun_berlaku: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tahun berlaku wajib diisi")),
   deskripsi: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Deskripsi wajib diisi")),
});

const router = express.Router();
const db = require("@/db.js");

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";
      const tahun_berlaku = req.query.tahun_berlaku ? Number.parseInt(req.query.tahun_berlaku) : null;

      const where = {};
      if (search) {
         where.OR = [
            { jenis: { contains: search, mode: "insensitive" } },
            { kode: { contains: search, mode: "insensitive" } },
            { deskripsi: { contains: search, mode: "insensitive" } },
         ];
      }
      if (tahun_berlaku !== null) {
         where.tahun_berlaku = tahun_berlaku;
      }

      const total = await db.read.tb_iku_master.count({ where });
      const results = await db.read.tb_iku_master.findMany({
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

      const results = await db.read.tb_iku_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { jenis, kode, deskripsi, tahun_berlaku, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const duplicate = await db.read.tb_iku_master.findUnique({
         where: { kode },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { kode: "Kode IKU sudah terdaftar" } });
      }

      const newData = await db.write.tb_iku_master.create({
         data: {
            jenis,
            kode,
            deskripsi,
            tahun_berlaku,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_iku_master", req.ip, null, { ...newData });

      res.status(201).json({
         status: true,
         message: "IKU master berhasil ditambahkan",
         refetchQuery: [["/master-iku", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { jenis, kode, deskripsi, tahun_berlaku, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const duplicate = await db.read.tb_iku_master.findFirst({
         where: { kode, id: { not: Number.parseInt(id) } },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { kode: "Kode IKU sudah terdaftar" } });
      }

      const oldData = await db.read.tb_iku_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "IKU master tidak ditemukan" });
      }

      const newData = await db.write.tb_iku_master.update({
         where: { id: Number.parseInt(id) },
         data: {
            jenis,
            kode,
            deskripsi,
            tahun_berlaku,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_iku_master", req.ip, { ...oldData }, { ...newData });

      res.status(201).json({
         status: true,
         message: "IKU master berhasil ditambahkan",
         refetchQuery: [
            ["/master-iku", { limit: "25", offset: "0" }],
            [`/master-iku/${id}`, {}],
         ],
      });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await db.read.tb_iku_master.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "IKU master tidak ditemukan" });
      }

      await db.write.tb_iku_master.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_iku_master", req.ip, { ...oldData }, null);

      res.status(201).json({ status: true, refetchQuery: [["/master-iku", { limit: "25", offset: "0" }]] });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
