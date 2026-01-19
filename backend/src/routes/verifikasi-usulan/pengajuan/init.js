const express = require("express");
const db = require("@/db.js");
const errorHandler = require("@/handle-error.js");
const { logAudit } = require("@/helpers.js");
const { z } = require("zod");
const cors = require("cors");
const { getData, getDetail, getReferensiSBM } = require("./get.js");
const { klaim, setujui, verifikasiRencanaAnggaranBiaya } = require("./put.js");
const { perbaiki, tolak } = require("./post.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

const router = express.Router();

const handleStatusVerifikasi = async (data = {}, tx = db.write) => {
   const oldData = await tx.tb_verifikasi.findFirst({
      where: {
         id_referensi: Number.parseInt(data.id_referensi),
         table_referensi: data.table_referensi,
         id_pengguna: data.id_pengguna,
         id_usulan_kegiatan: data.id_usulan_kegiatan,
         tahap: Number.parseInt(data.tahap),
      },
   });

   const isUpdate = !!oldData;
   const newData = isUpdate
      ? await tx.tb_verifikasi.update({
           where: { id: oldData.id },
           data: {
              status: data.status,
              modified: new Date(),
              user_modified: data.user_modified,
              catatan: data.catatan,
           },
        })
      : await tx.tb_verifikasi.create({
           data: {
              id_pengguna: data.id_pengguna,
              id_usulan_kegiatan: data.id_usulan_kegiatan,
              id_referensi: data.id_referensi,
              table_referensi: data.table_referensi,
              status: data.status,
              uploaded: new Date(),
              user_modified: data.user_modified,
              catatan: data.catatan,
              tahap: data.tahap,
           },
        });

   await logAudit(data.user_modified, isUpdate ? "UPDATE" : "CREATE", "tb_verifikasi", data.ip, isUpdate ? { ...oldData } : null, { ...newData });

   return oldData;
};

const findVerifikator = (klaimVerifikasi, targetUsername) => {
   for (const item of klaimVerifikasi) {
      if (item.verikator_usulan?.pengguna?.username === targetUsername && item.status_klaim === "aktif") {
         return {
            id_pengguna: item.verikator_usulan.pengguna.id,
            id_klaim: item.id,
            tahap: Number.parseInt(item.verikator_usulan.tahap),
            id_verikator_usulan: Number.parseInt(item.verikator_usulan.id),
            id_jenis_usulan: Number.parseInt(item.verikator_usulan.id_jenis_usulan),
         };
      }
   }

   return null; // Jika tidak ditemukan
};

router.get("/", getData);
router.get("/referensi-sbm", getReferensiSBM);
router.get("/:id_usulan_kegiatan", getDetail);

router.post("/:id_usulan/tolak", tolak);
router.post("/:id_usulan/perbaiki", perbaiki);

router.put("/klaim", klaim);
router.put("/rab/:id", verifikasiRencanaAnggaranBiaya);
router.put("/setujui", setujui);

router.get("/:id_usulan/histori-penolakan", async (req, res) => {
   try {
      const { id_usulan } = req.params;

      const results = await db.read.tb_penolakan_usulan.findMany({
         where: { id_usulan_kegiatan: Number.parseInt(id_usulan) },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error?.message });
   }
});

router.get("/:id_usulan/histori-perbaikan", async (req, res) => {
   try {
      const { id_usulan } = req.params;

      const results = await db.read.tb_perbaikan_usulan.findMany({
         where: { id_usulan_kegiatan: Number.parseInt(id_usulan) },
         orderBy: { id: "desc" },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error?.message });
   }
});

router.put("/iku/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified, klaim_verifikasi } = req.body;

      const parsed = validationIKU.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.read.tb_relasi_usulan_iku.findUnique({
         where: { id: Number.parseInt(id) },
         select: {
            id_usulan: true,
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Relasi IKU tidak ditemukan" });
      }

      const verifikator = findVerifikator(klaim_verifikasi, user_modified);

      await handleStatusVerifikasi({
         ip: req.ip,
         id_pengguna: verifikator.id_pengguna,
         id_usulan_kegiatan: oldData.id_usulan,
         id_referensi: Number.parseInt(id),
         table_referensi: "tb_relasi_usulan_iku",
         status: approve,
         user_modified,
         catatan: catatan_perbaikan,
         tahap: verifikator.tahap,
      });

      return res.json({
         status: true,
         message: "Relasi IKU berhasil diperbaharui",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id_usulan}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.put("/dokumen/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified, klaim_verifikasi } = req.body;

      const parsed = validationDokumen.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.read.tb_dokumen_pendukung.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Dokumen tidak ditemukan" });
      }

      const verifikator = findVerifikator(klaim_verifikasi, user_modified);

      await handleStatusVerifikasi({
         ip: req.ip,
         id_pengguna: verifikator.id_pengguna,
         id_usulan_kegiatan: oldData.id_usulan,
         id_referensi: Number.parseInt(id),
         table_referensi: "tb_dokumen_pendukung",
         status: approve,
         user_modified,
         catatan: catatan_perbaikan,
         tahap: verifikator.tahap,
      });

      return res.status(201).json({
         status: true,
         message: "Dokumen berhasil diperbaharui",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id_usulan}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

module.exports = router;
