const express = require("express");
const { PrismaClient } = require("@prisma/client");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");
const { z } = require("zod");

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

const validationPenolakan = z.object({
   catatan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Asalan penolakan wajib diisi")),
});

const validationPerbaikan = z.object({
   catatan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Asalan perbaikan wajib diisi")),
});

const validationIKU = z
   .object({
      approve: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
      catatan_perbaikan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
   })
   .refine(
      (data) => {
         if (data.approve === "tidak_sesuai") {
            return data.catatan_perbaikan && data.catatan_perbaikan.trim() !== "";
         }
         return true;
      },
      {
         message: "Catatan perbaikan wajib diisi",
         path: ["catatan_perbaikan"],
      }
   );

const validationDokumen = z
   .object({
      approve: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
      catatan_perbaikan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
   })
   .refine(
      (data) => {
         if (data.approve === "tidak_sesuai") {
            return data.catatan_perbaikan && data.catatan_perbaikan.trim() !== "";
         }
         return true;
      },
      {
         message: "Catatan perbaikan wajib diisi",
         path: ["catatan_perbaikan"],
      }
   );

const validationRAB = z
   .object({
      approve: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
      catatan_perbaikan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
      new_qty: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
      new_harga_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
      new_total_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
   })
   .refine(
      (data) => {
         if (["ubah", "tidak_valid", "perbaiki"].includes(data.approve)) {
            return data.catatan_perbaikan && data.catatan_perbaikan.trim() !== "";
         }
         return true;
      },
      {
         message: "Catatan perbaikan wajib diisi",
         path: ["catatan_perbaikan"],
      }
   )
   .refine(
      (data) => {
         if (data.approve === "ubah") {
            return data.new_qty && data.new_qty.trim() !== "";
         }
         return true;
      },
      {
         message: "Qty baru wajib diisi",
         path: ["new_qty"],
      }
   )
   .refine(
      (data) => {
         if (data.approve === "ubah") {
            return data.new_harga_satuan && data.new_harga_satuan.trim() !== "";
         }
         return true;
      },
      {
         message: "Harga satuan baru wajib diisi",
         path: ["new_harga_satuan"],
      }
   )
   .refine(
      (data) => {
         if (data.approve === "ubah") {
            return data.new_total_biaya && data.new_total_biaya.trim() !== "";
         }
         return true;
      },
      {
         message: "Total biaya baru wajib diisi",
         path: ["new_total_biaya"],
      }
   );

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
   try {
      const where = { status_usulan: "pengajuan" };

      const total = await prisma.tb_usulan_kegiatan.count({ where });
      const results = await prisma.tb_usulan_kegiatan.findMany({
         where,
         select: {
            id: true,
            kode: true,
            nama: true,
            waktu_mulai: true,
            waktu_selesai: true,
            rencana_total_anggaran: true,
            total_anggaran: true,
            status_usulan: true,
         },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/referensi-sbm", async (req, res) => {
   try {
      const results = await prisma.tb_detail_harga_sbm.findMany({
         where: { status_validasi: "valid" },
         select: {
            id: true,
            harga_satuan: true,
            tanggal_mulai_efektif: true,
            tanggal_akhir_efektif: true,
            status_validasi: true,
            standar_biaya: {
               select: {
                  kode: true,
                  nama: true,
               },
            },
            unit_satuan: {
               select: {
                  nama: true,
                  deskripsi: true,
                  aktif: true,
               },
            },
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const where = { id: Number.parseInt(id) };

      const results = await prisma.tb_usulan_kegiatan.findUnique({
         where,
         select: {
            id: true,
            kode: true,
            nama: true,
            latar_belakang: true,
            tujuan: true,
            sasaran: true,
            waktu_mulai: true,
            waktu_selesai: true,
            tempat_pelaksanaan: true,
            id_unit_pengusul: true,
            operator_input: true,
            total_anggaran: true,
            status_usulan: true,
            tanggal_submit: true,
            rencana_total_anggaran: true,
            catatan_perbaikan: true,
            dokumen_pendukung: {
               orderBy: { uploaded: "asc" },
               select: {
                  id: true,
                  nama_dokumen: true,
                  tipe_dokumen: true,
                  path_file: true,
                  uploaded: true,
                  modified: true,
                  user_modified: true,
                  file_dokumen: true,
                  approve: true,
                  catatan_perbaikan: true,
               },
            },
            rab_detail: {
               orderBy: { uploaded: "asc" },
               select: {
                  id: true,
                  uraian_biaya: true,
                  qty: true,
                  harga_satuan: true,
                  total_biaya: true,
                  catatan: true,
                  approve: true,
                  catatan_perbaikan: true,
                  unit_satuan: {
                     select: {
                        id: true,
                        nama: true,
                        deskripsi: true,
                     },
                  },
                  rab_detail_perubahan: {
                     select: {
                        id: true,
                        qty: true,
                        harga_satuan: true,
                        total_biaya: true,
                     },
                  },
               },
            },
            relasi_usulan_iku: {
               orderBy: { id: "desc" },
               select: {
                  id: true,
                  approve: true,
                  catatan_perbaikan: true,
                  iku_master: {
                     select: {
                        id: true,
                        jenis: true,
                        kode: true,
                        deskripsi: true,
                        tahun_berlaku: true,
                     },
                  },
               },
            },
         },
      });
      res.json({ results });
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
});

router.put("/iku/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified } = req.body;

      const parsed = validationIKU.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_relasi_usulan_iku.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Relasi IKU tidak ditemukan" });
      }

      const newData = await prisma.tb_relasi_usulan_iku.update({
         where: { id: Number.parseInt(id) },
         data: {
            approve,
            catatan_perbaikan,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_relasi_usulan_iku", req.ip, { ...oldData }, { ...newData });

      res.status(201).json({ status: true, message: "Relasi IKU berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/rab/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified, new_qty, new_harga_satuan, new_total_biaya } = req.body;

      const parsed = validationRAB.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_rab_detail.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Rencana anggaran biaya tidak ditemukan" });
      }

      const newData = await prisma.tb_rab_detail.update({
         where: { id: Number.parseInt(id) },
         data: {
            approve: approve === "ubah" ? "valid" : approve,
            catatan_perbaikan,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_rab_detail", req.ip, { ...oldData }, { ...newData });

      if (approve === "ubah") {
         const oldDataPerubahan = await prisma.tb_rab_detail_perubahan.findUnique({
            where: { id_rab_detail: Number.parseInt(id) },
         });

         if (oldDataPerubahan) {
            const newDataPerubahan = await prisma.tb_rab_detail_perubahan.update({
               where: { id_rab_detail: Number.parseInt(id) },
               data: {
                  qty: new_qty,
                  harga_satuan: cleanRupiah(new_harga_satuan),
                  total_biaya: cleanRupiah(new_total_biaya),
                  uploaded: new Date(),
                  user_modified,
               },
            });

            logAudit(user_modified, "UPDATE", "tb_rab_detail_perubahan", req.ip, { ...oldDataPerubahan }, { ...newDataPerubahan });
         } else {
            const newDataPerubahan = await prisma.tb_rab_detail_perubahan.create({
               data: {
                  id_rab_detail: Number.parseInt(id),
                  qty: new_qty,
                  harga_satuan: cleanRupiah(new_harga_satuan),
                  total_biaya: cleanRupiah(new_total_biaya),
                  modified: new Date(),
                  user_modified,
               },
            });

            logAudit(user_modified, "CREATE", "tb_rab_detail_perubahan", req.ip, null, { ...newDataPerubahan });
         }
      }

      res.status(201).json({ status: true, message: "Rencana anggaran biaya berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.put("/dokumen/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified } = req.body;

      const parsed = validationDokumen.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_dokumen_pendukung.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Dokumen tidak ditemukan" });
      }

      const newData = await prisma.tb_dokumen_pendukung.update({
         where: { id: Number.parseInt(id) },
         data: {
            approve,
            catatan_perbaikan,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_dokumen_pendukung", req.ip, { ...oldData }, { ...newData });

      res.status(201).json({ status: true, message: "Dokumen berhasil diperbaharui" });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/:id_usulan/tolak", async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { user_modified, catatan } = req.body;

      const parsed = validationPenolakan.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const newDataPenolakan = await prisma.tb_penolakan_usulan.create({
         data: {
            id_usulan_kegiatan: Number.parseInt(id_usulan),
            catatan,
            uploaded: new Date(),
            user_modified,
         },
      });

      const newData = await prisma.tb_usulan_kegiatan.update({
         where: { id: Number.parseInt(id_usulan) },
         data: {
            catatan_perbaikan: catatan,
            status_usulan: "ditolak",
            modified: new Date(),
         },
      });

      logAudit(user_modified, "CREATE", "tb_penolakan_usulan", req.ip, null, { ...newDataPenolakan });
      logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });

      return res.json({ status: true, message: "Data berhasil disimpan" });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.post("/:id_usulan/perbaiki", async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { user_modified, catatan } = req.body;

      const parsed = validationPerbaikan.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const newDataPerbaikan = await prisma.tb_perbaikan_usulan.create({
         data: {
            id_usulan_kegiatan: Number.parseInt(id_usulan),
            catatan,
            uploaded: new Date(),
            user_modified,
         },
      });

      const newData = await prisma.tb_usulan_kegiatan.update({
         where: { id: Number.parseInt(id_usulan) },
         data: {
            catatan_perbaikan: catatan,
            status_usulan: "perbaiki",
            modified: new Date(),
         },
      });

      logAudit(user_modified, "CREATE", "tb_perbaikan_usulan", req.ip, null, { ...newDataPerbaikan });
      logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });

      return res.json({ status: true, message: "Data berhasil disimpan" });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.get("/:id_usulan/histori-penolakan", async (req, res) => {
   try {
      const { id_usulan } = req.params;

      const results = await prisma.tb_penolakan_usulan.findMany({
         where: { id_usulan_kegiatan: Number.parseInt(id_usulan) },
         orderBy: { id: "desc" },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error?.message });
   }
});

router.get("/:id_usulan/histori-perbaikan", async (req, res) => {
   try {
      const { id_usulan } = req.params;

      const results = await prisma.tb_perbaikan_usulan.findMany({
         where: { id_usulan_kegiatan: Number.parseInt(id_usulan) },
         orderBy: { id: "desc" },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error?.message });
   }
});

router.put("/setujui", async (req, res) => {
   try {
      const { id_usulan, user_modified } = req.body;

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const newData = await prisma.tb_usulan_kegiatan.update({
         where: { id: Number.parseInt(id_usulan) },
         data: {
            status_usulan: "diterima",
            user_modified,
            modified: new Date(),
         },
      });

      logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });

      return res.json({ status: true, message: "Status usulan berhasil diperbaharui" });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

module.exports = router;
