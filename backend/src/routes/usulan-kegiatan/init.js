const express = require("express");
const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      if (process.env.CDN_HOST) {
         // Use temp directory for CDN uploads
         const tempDir = path.join(__dirname, "../../temp");
         if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
         }
         cb(null, tempDir);
         return;
      }

      const uploadDir = path.join(__dirname, "../../uploads/dokumen");
      if (!fs.existsSync(uploadDir)) {
         fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
   },
   filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + path.extname(file.originalname));
   },
});

const upload = multer({
   storage,
   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const {
   getData,
   getDetail,
   getDaftarJenisUsulan,
   getRelasiIKU,
   getDaftarRabDetail,
   getDaftarDokumenPendukung,
   getDaftarReferensiSBM,
   getDetailRABDetail,
   getDetailTOR,
} = require("./get");
const { updateInformasiUsulanKegiatan, updateRABDetail, updateDokumen, updateUsulKegiatan, updateTOR } = require("./put");
const { submitRelasiIKU, submitRAB, submitDokumen, submitUsulanKegiatan } = require("./post");
const { deleteRelasiIKU, deleteRABDetail, deleteDokumen, deleteUsulanKegiatan } = require("./delete");

router.get("/daftar-jenis-usulan", getDaftarJenisUsulan);
router.get("/referensi-sbm", getDaftarReferensiSBM);
router.get("/", getData);
router.get("/:id", getDetail);
router.get("/:id/relasi-iku", getRelasiIKU);
router.get("/:id/rab", getDaftarRabDetail);
router.get("/:id/dokumen", getDaftarDokumenPendukung);
router.get("/rab/:id_usulan/:id", getDetailRABDetail);
router.get("/tor/:id_usulan_kegiatan", getDetailTOR);

router.put("/usul", updateUsulKegiatan);
router.put("/:id", updateInformasiUsulanKegiatan);
router.put("/rab/:id_usulan/:id", updateRABDetail);
router.put("/tor/:id_usulan_kegiatan", updateTOR);
router.put("/:id_usulan_kegiatan/dokumen/:id", upload.single("file_dokumen"), updateDokumen);

router.post("/:id_usulan_kegiatan/relasi-iku", submitRelasiIKU);
router.post("/rab", submitRAB);
router.post("/:id_usulan_kegiatan/dokumen", upload.single("file_dokumen"), submitDokumen);
router.post("/", submitUsulanKegiatan);

router.delete("/relasi-iku/:id", deleteRelasiIKU);
router.delete("/rab/:id", deleteRABDetail);
router.delete("/dokumen/:id", deleteDokumen);
router.delete("/:id", deleteUsulanKegiatan);

module.exports = router;
