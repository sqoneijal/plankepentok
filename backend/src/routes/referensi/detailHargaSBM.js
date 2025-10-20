const express = require("express");
const { PrismaClient } = require("@prisma/client");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");
const { z } = require("zod");

const validation = z.object({
   id_standar_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Standar biaya wajib diisi")),
   tahun_anggaran: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tahun anggaran wajib diisi")),
   id_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Unit satuan wajib diisi")),
   harga_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Harga satuan wajib diisi")),
   tanggal_mulai_efektif: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tanggal mulai efektif wajib diisi")),
   tanggal_akhir_efektif: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Tanggal akhir efektif wajib diisi")),
   status_validasi: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
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
            { id_standar_biaya: { equals: Number.parseInt(search) || undefined } },
            { tahun_anggaran: { equals: Number.parseFloat(search) || undefined } },
            { status_validasi: { contains: search, mode: "insensitive" } },
         ].filter(Boolean),
      };
      const where = search ? query : {};

      const total = await prisma.tb_detail_harga_sbm.count({ where });
      const results = await prisma.tb_detail_harga_sbm.findMany({
         where,
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         include: {
            standar_biaya: {
               select: {
                  kode: true,
                  nama: true,
               },
            },
            unit_satuan: {
               select: {
                  deskripsi: true,
                  nama: true,
               },
            },
         },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const results = await prisma.tb_detail_harga_sbm.findUnique({
         where: { id: Number.parseInt(id) },
         include: {
            standar_biaya: true,
            unit_satuan: true,
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const {
         id_standar_biaya,
         tahun_anggaran,
         harga_satuan,
         id_satuan,
         tanggal_mulai_efektif,
         tanggal_akhir_efektif,
         status_validasi,
         user_modified,
      } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const duplicate = await prisma.tb_detail_harga_sbm.findFirst({
         where: {
            id_standar_biaya: Number.parseInt(id_standar_biaya),
            tahun_anggaran: Number.parseFloat(tahun_anggaran),
            id_satuan: Number.parseInt(id_satuan),
         },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { tahun_anggaran: "Kombinasi standar biaya, tahun anggaran, dan unit satuan sudah terdaftar" } });
      }

      const newData = await prisma.tb_detail_harga_sbm.create({
         data: {
            id_standar_biaya: Number.parseInt(id_standar_biaya),
            tahun_anggaran: Number.parseFloat(tahun_anggaran),
            harga_satuan: Number.parseFloat(harga_satuan.toString().replaceAll(".", "")),
            id_satuan: Number.parseInt(id_satuan),
            tanggal_mulai_efektif: new Date(tanggal_mulai_efektif),
            tanggal_akhir_efektif: new Date(tanggal_akhir_efektif),
            status_validasi,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_detail_harga_sbm", req.ip, null, { ...newData });

      res.status(201).json({ status: true, message: "Detail harga SBM berhasil ditambahkan" });
   } catch (error) {
      if (error.code === "P2002") {
         return res.status(400).json({ status: false, error: "Kombinasi ID SBM, tahun anggaran, dan ID satuan sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const {
         id_standar_biaya,
         tahun_anggaran,
         harga_satuan,
         id_satuan,
         tanggal_mulai_efektif,
         tanggal_akhir_efektif,
         status_validasi,
         user_modified,
      } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_detail_harga_sbm.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, errors: { tahun_anggaran: "Detail harga SBM tidak ditemukan" } });
      }

      const duplicate = await prisma.tb_detail_harga_sbm.findFirst({
         where: {
            id_standar_biaya: Number.parseInt(id_standar_biaya),
            tahun_anggaran: Number.parseFloat(tahun_anggaran),
            id_satuan: Number.parseInt(id_satuan),
            id: { not: Number.parseInt(id) },
         },
      });

      if (duplicate) {
         return res.json({ status: false, errors: { tahun_anggaran: "Kombinasi standar biaya, tahun anggaran, dan unit satuan sudah terdaftar" } });
      }

      const newData = await prisma.tb_detail_harga_sbm.update({
         where: { id: Number.parseInt(id) },
         data: {
            id_standar_biaya: Number.parseInt(id_standar_biaya),
            tahun_anggaran: Number.parseFloat(tahun_anggaran),
            harga_satuan: Number.parseFloat(harga_satuan.toString().replaceAll(".", "")),
            id_satuan: Number.parseInt(id_satuan),
            tanggal_mulai_efektif: new Date(tanggal_mulai_efektif),
            tanggal_akhir_efektif: new Date(tanggal_akhir_efektif),
            status_validasi,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_detail_harga_sbm", req.ip, { ...oldData }, { ...newData });

      res.json({ status: true, message: "Detail harga SBM berhasil diperbaharui" });
   } catch (error) {
      if (error.code === "P2025") {
         return res.status(404).json({ error: "Detail harga SBM tidak ditemukan" });
      }
      if (error.code === "P2002") {
         return res.status(400).json({ status: false, error: "Kombinasi ID SBM, tahun anggaran, dan ID satuan sudah ada" });
      }
      res.status(500).json({ error: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_detail_harga_sbm.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, errors: { tahun_anggaran: "Detail harga SBM tidak ditemukan" } });
      }

      await prisma.tb_detail_harga_sbm.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_detail_harga_sbm", req.ip, { ...oldData }, null);

      res.json({ status: true });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
