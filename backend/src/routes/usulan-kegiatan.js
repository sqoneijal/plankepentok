const express = require("express");
const { z } = require("zod");
const { logAudit } = require("@/helpers.js");
const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");
const { Client } = require("ssh2");

const router = express.Router();
const prisma = require("@/db.js");

// Helper function to upload file via SFTP
const uploadFileViaSFTP = (conn, localPath, remotePath) => {
   return new Promise((resolve, reject) => {
      conn.sftp((err, sftp) => {
         if (err) {
            conn.end();
            return reject(err);
         }
         sftp.fastPut(localPath, remotePath, {}, (err) => {
            conn.end();
            if (err) reject(err);
            else resolve(remotePath);
         });
      });
   });
};

// Function to upload file to CDN via SFTP
const uploadToCDN = async (localPath, remoteFilename) => {
   const conn = new Client();
   return new Promise((resolve, reject) => {
      conn
         .on("ready", async () => {
            try {
               const remotePath = path.posix.join("/usr/share/nginx/cdn/plankepentok", remoteFilename);
               const result = await uploadFileViaSFTP(conn, localPath, remotePath);
               resolve(result);
            } catch (err) {
               reject(err);
            }
         })
         .on("error", (err) => {
            reject(err);
         })
         .connect({
            host: process.env.CDN_HOST,
            port: 22,
            username: process.env.CDN_USER,
            password: process.env.CDN_PASS,
         });
   });
};

// Helper function to validate file upload
const validateFileUpload = (req) => {
   if (!req.file) {
      return { valid: false, error: { file_dokumen: "File wajib diunggah." } };
   }

   if (!allowedMimeTypes.has(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return { valid: false, error: { file_dokumen: "Tipe file tidak diizinkan. Hanya PDF, DOCX, XLSX, PPTX, JPG, PNG yang diperbolehkan." } };
   }

   if (req.file.size > 100 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return { valid: false, error: { file_dokumen: "Ukuran file maksimal 100MB." } };
   }

   return { valid: true };
};

// Helper function to get document type from MIME type
const getTipeDokumen = (mimetype) => {
   const mimeTypeToTipe = {
      "application/pdf": "PDF",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
      "image/jpeg": "JPG",
      "image/png": "PNG",
   };
   return mimeTypeToTipe[mimetype] || "UNKNOWN";
};

// Helper function to handle file storage (CDN or local)
const handleFileStorage = async (req) => {
   const { filename } = req.file;
   let path_file;
   let cdn_url = null;

   if (process.env.CDN_HOST) {
      try {
         cdn_url = await uploadToCDN(req.file.path, filename);
         path_file = "https://cdn.ar-raniry.ac.id/plankepentok/" + filename;
         fs.unlinkSync(req.file.path);
      } catch (cdnError) {
         console.error("CDN upload failed:", cdnError);
         // Fallback to local storage
         const localDir = path.join(__dirname, "../../uploads/dokumen");
         if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
         }
         const localPath = path.join(localDir, filename);
         fs.renameSync(req.file.path, localPath);
         path_file = "/uploads/dokumen/" + filename;
      }
   } else {
      const localDir = path.join(__dirname, "../../uploads/dokumen");
      if (!fs.existsSync(localDir)) {
         fs.mkdirSync(localDir, { recursive: true });
      }
      const localPath = path.join(localDir, filename);
      fs.renameSync(req.file.path, localPath);
      path_file = "/uploads/dokumen/" + filename;
   }

   return { path_file, cdn_url };
};

// Helper function to update document file
const updateDocumentFile = async (req, oldData) => {
   if (!req.file) {
      return {
         tipe_dokumen: oldData.tipe_dokumen,
         file_dokumen: oldData.file_dokumen,
         path_file: oldData.path_file,
      };
   }

   const fileValidation = validateFileUpload(req);
   if (!fileValidation.valid) {
      throw new ValidationError(fileValidation.error);
   }

   const tipe_dokumen = getTipeDokumen(req.file.mimetype);
   const file_dokumen = req.file.filename;
   const { path_file } = await handleFileStorage(req);

   // Delete old file if it exists
   if (oldData.file_dokumen) {
      const oldFilePath = path.join(__dirname, "../../uploads/dokumen", oldData.file_dokumen);
      if (fs.existsSync(oldFilePath)) {
         fs.unlinkSync(oldFilePath);
      }
   }

   return { tipe_dokumen, file_dokumen, path_file };
};

// Custom error class for validation
class ValidationError extends Error {
   constructor(errors) {
      super("Validation failed");
      this.errors = errors;
   }
}

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

const usulanSchema = z.object({
   kode: z.string().min(1, "Kode wajib diisi"),
   id_jenis_usulan: z.string().min(1, "Jenis usulan wajib diisi"),
   waktu_mulai: z.string().min(1, "Waktu mulai wajib diisi"),
   waktu_selesai: z.string().min(1, "Waktu selesai wajib diisi"),
   tempat_pelaksanaan: z.string().min(1, "Tempat pelaksanaan wajib diisi"),
   rencana_total_anggaran: z.string().min(1, "Tempat pelaksanaan wajib diisi"),
});

const rabSchema = z.object({
   uraian_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Uraian wajib diisi")),
   qty: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Jumlah wajib diisi")),
   id_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Unit satuan wajib dipilih")),
   harga_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Harga satuan wajib diisi")),
   total_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Total biaya wajib diisi")),
});

// Allowed MIME types for file uploads
const allowedMimeTypes = new Set([
   "application/pdf",
   "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
   "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
   "image/jpeg",
   "image/png",
]);

const validasiDokumen = z.object({
   nama_dokumen: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama dokumen wajib diisi")),
});

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

router.get("/daftar-jenis-usulan", async (req, res) => {
   try {
      const results = await prisma.tb_jenis_usulan.findMany({
         where: { is_aktif: true },
         select: {
            id: true,
            nama: true,
         },
      });

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.get("/referensi-sbm", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [
            { standar_biaya: { nama: { contains: search, mode: "insensitive" } } },
            { standar_biaya: { deskripsi: { contains: search, mode: "insensitive" } } },
            { unit_satuan: { nama: { contains: search, mode: "insensitive" } } },
            { unit_satuan: { deskripsi: { contains: search, mode: "insensitive" } } },
         ],
      };
      const where = search ? query : {};

      const total = await prisma.tb_detail_harga_sbm.count({ where: { status_validasi: "valid", ...where } });
      const results = await prisma.tb_detail_harga_sbm.findMany({
         orderBy: { uploaded: "asc" },
         where: { status_validasi: "valid", ...where },
         take: limit,
         skip: offset,
         select: {
            id: true,
            id_standar_biaya: true,
            tahun_anggaran: true,
            harga_satuan: true,
            id_satuan: true,
            tanggal_mulai_efektif: true,
            tanggal_akhir_efektif: true,
            status_validasi: true,
            standar_biaya_master: {
               select: {
                  id: true,
                  kode: true,
                  nama: true,
                  deskripsi: true,
               },
            },
            unit_satuan: {
               select: {
                  id: true,
                  nama: true,
                  deskripsi: true,
                  aktif: true,
               },
            },
         },
      });
      res.json({ results, total });
   } catch (error) {
      res.json({ status: false, message: error.message });
   }
});

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await prisma.tb_usulan_kegiatan.count();
      const results = await prisma.tb_usulan_kegiatan.findMany({
         take: limit,
         skip: offset,
         orderBy: { id: "desc" },
         select: {
            id: true,
            kode: true,
            waktu_mulai: true,
            waktu_selesai: true,
            total_anggaran: true,
            status_usulan: true,
            rencana_total_anggaran: true,
            jenis_usulan: {
               select: {
                  id: true,
                  nama: true,
               },
            },
         },
      });
      return res.json({ results, total });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.put("/usul", async (req, res) => {
   try {
      const { id_usulan, user_modified } = req.body;

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["diterima", "pengajuan"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat melakukan pengajuan" });
      }

      const checkVerifikator = await prisma.tb_verikator_usulan.findFirst({
         where: {
            id_jenis_usulan: oldData.id_jenis_usulan,
            tahap: 1,
         },
         select: {
            id: true,
         },
      });

      if (!checkVerifikator) {
         return res.json({
            status: false,
            message:
               "Anda belum dapat mengajukan usulan ini. Tim verifikator belum ditentukan, silahkan hubungi admin atau pihak terkait untuk info lebih lanjut",
         });
      }

      // Check if klaim already exists to simulate insert ignore
      const existingKlaim = await prisma.tb_klaim_verifikasi.findFirst({
         where: {
            id_usulan_kegiatan: oldData.id,
            id_verikator_usulan: checkVerifikator.id,
         },
      });

      if (!existingKlaim) {
         const newDataKlaim = await prisma.tb_klaim_verifikasi.create({
            data: {
               id_usulan_kegiatan: oldData.id,
               id_verikator_usulan: checkVerifikator.id,
               status_klaim: "pending",
            },
         });

         logAudit("system", "CREATE", "tb_klaim_verifikasi", req.ip, null, { ...newDataKlaim });
      }

      const newData = await prisma.tb_usulan_kegiatan.update({
         where: { id: Number.parseInt(id_usulan) },
         data: {
            modified: new Date(),
            user_modified,
            status_usulan: "pengajuan",
         },
      });

      await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });

      return res.json({ status: true, message: "Usulan kegiatan berhasil diperbaharui", checkVerifikator });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { kode, tempat_pelaksanaan, user_modified, pengguna } = req.body;

      if (!pengguna) {
         return res.json({ status: false, message: "Anda tidak mempunyai akses untuk melakukan penambahan usulan kegiatan" });
      }

      const newData = await prisma.tb_usulan_kegiatan.create({
         data: {
            kode,
            uploaded: new Date(),
            user_modified,
            tempat_pelaksanaan,
            operator_input: pengguna?.id,
         },
      });

      const newDataUnit = await prisma.tb_unit_pengusul.create({
         data: {
            id_usulan_kegiatan: newData.id,
            id_biro: pengguna.pengguna_role.id_biro,
            id_lembaga: pengguna.pengguna_role.id_lembaga,
            id_upt: pengguna.pengguna_role.id_upt,
            id_fakultas: pengguna.pengguna_role.id_fakultas,
            id_sub_unit: pengguna.pengguna_role.id_sub_unit,
         },
      });

      logAudit(user_modified, "CREATE", "tb_usulan_kegiatan", req.ip, null, { ...newData });
      logAudit(user_modified, "CREATE", "tb_unit_pengusul", req.ip, null, { ...newDataUnit });

      return res.status(201).json({ status: true, id_usulan_kegiatan: newData.id });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/:id", async (req, res) => {
   try {
      const { id } = req.params;

      const results = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id) },
         select: {
            id: true,
            kode: true,
            latar_belakang: true,
            tujuan: true,
            sasaran: true,
            waktu_mulai: true,
            waktu_selesai: true,
            tempat_pelaksanaan: true,
            operator_input: true,
            total_anggaran: true,
            status_usulan: true,
            tanggal_submit: true,
            rencana_total_anggaran: true,
            catatan_perbaikan: true,
            id_jenis_usulan: true,
            unit_pengusul: {
               select: {
                  biro_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  fakultas_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  lembaga_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  sub_unit: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
                  upt_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
               },
            },
            jenis_usulan: {
               select: {
                  id: true,
                  nama: true,
               },
            },
            pengguna: {
               select: {
                  id: true,
                  fullname: true,
               },
            },
         },
      });
      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.put("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const {
         latar_belakang,
         tujuan,
         sasaran,
         waktu_mulai,
         waktu_selesai,
         tempat_pelaksanaan,
         user_modified,
         rencana_total_anggaran,
         id_jenis_usulan,
      } = req.body;

      const parsed = usulanSchema.safeParse(req.body);

      if (!parsed.success) {
         const formattedErrors = {};
         for (const key in parsed.error.flatten().fieldErrors) {
            const val = parsed.error.flatten().fieldErrors[key];
            formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
         }

         return res.json({
            status: false,
            message: "Periksa kembali inputan anda.",
            errors: formattedErrors,
         });
      }

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id),
            status_usulan: {
               in: ["diterima", "pengajuan"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat melakukan perubahan usulan" });
      }

      const newData = await prisma.tb_usulan_kegiatan.update({
         where: { id: Number.parseInt(id) },
         data: {
            id_jenis_usulan: Number.parseInt(id_jenis_usulan),
            latar_belakang,
            tujuan,
            sasaran,
            waktu_mulai: waktu_mulai ? new Date(waktu_mulai) : undefined,
            waktu_selesai: waktu_selesai ? new Date(waktu_selesai) : undefined,
            tempat_pelaksanaan,
            tanggal_submit: new Date(),
            modified: new Date(),
            user_modified,
            rencana_total_anggaran: cleanRupiah(rencana_total_anggaran),
         },
      });

      logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });

      return res.json({
         status: true,
         message: "Usulan kegiatan berhasil diperbaharui.",
         refetchQuery: [["/usulan-kegiatan", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id),
            status_usulan: {
               in: ["diterima", "pengajuan"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat melakukan penghapusan pengajuan" });
      }

      await prisma.tb_usulan_kegiatan.delete({
         where: { id: Number.parseInt(id) },
      });

      await logAudit(user_modified, "DELETE", "tb_usulan_kegiatan", req.ip, null, null);

      return res.json({
         status: true,
         message: "Usulan kegiatan berhasil dihapus",
         refetchQuery: [["/usulan-kegiatan", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/:id/relasi-iku", async (req, res) => {
   try {
      const { id } = req.params;

      const total = await prisma.tb_relasi_usulan_iku.count({
         where: { id_usulan: Number.parseInt(id) },
      });

      const results = await prisma.tb_relasi_usulan_iku.findMany({
         where: { id_usulan: Number.parseInt(id) },
         orderBy: { iku_master: { kode: "asc" } },
         select: {
            id: true,
            iku_master: {
               select: {
                  id: true,
                  jenis: true,
                  kode: true,
                  deskripsi: true,
                  tahun_berlaku: true,
               },
            },
            usulan_kegiatan: {
               select: {
                  status_usulan: true,
                  verifikasi: {
                     where: {
                        table_referensi: "tb_relasi_usulan_iku",
                     },
                     select: {
                        id_referensi: true,
                        status: true,
                        catatan: true,
                     },
                  },
               },
            },
         },
      });

      return res.json({ results, total });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.post("/:id_usulan_kegiatan/relasi-iku", async (req, res) => {
   try {
      const { id_usulan_kegiatan } = req.params;
      const { id, user_modified } = req.body;

      // Check if the relation already exists
      const existing = await prisma.tb_relasi_usulan_iku.findFirst({
         where: {
            id_usulan: Number.parseInt(id_usulan_kegiatan),
            id_iku: Number.parseInt(id),
         },
      });

      if (existing) {
         return res.json({ status: false, message: "Relasi IKU sudah ada." });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id_usulan_kegiatan),
            status_usulan: {
               in: ["pengajuan", "diterima"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat memperbaharui atau menambahkan IKU baru" });
      }

      const newData = await prisma.tb_relasi_usulan_iku.create({
         data: {
            id_usulan: Number.parseInt(id_usulan_kegiatan),
            id_iku: Number.parseInt(id),
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_relasi_usulan_iku", req.ip, null, { ...newData });

      return res.json({
         status: true,
         message: "Relasi IKU berhasil ditambahkan.",
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`, {}]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.delete("/relasi-iku/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { id_usulan_kegiatan } = req.query;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_relasi_usulan_iku.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Relasi IKU tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(oldData.id_usulan),
            status_usulan: {
               in: ["diterima", "pengajuan"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat menghapus relasi IKU" });
      }

      await prisma.tb_relasi_usulan_iku.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_relasi_usulan_iku", req.ip, { ...oldData }, null);

      return res.json({
         status: true,
         message: "Relasi IKU berhasil dihapus.",
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`, {}]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.get("/rab/:id_usulan/:id", async (req, res) => {
   try {
      const { id_usulan, id } = req.params;

      const results = await prisma.tb_rab_detail.findUnique({
         where: { id_usulan: Number.parseInt(id_usulan), id: Number.parseInt(id) },
      });
      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/:id/rab", async (req, res) => {
   try {
      const { id } = req.params;

      const total = await prisma.tb_rab_detail.count({
         where: { id_usulan: Number.parseInt(id) },
      });

      const results = await prisma.tb_rab_detail.findMany({
         where: { id_usulan: Number.parseInt(id) },
         select: {
            id: true,
            uraian_biaya: true,
            qty: true,
            id_satuan: true,
            harga_satuan: true,
            total_biaya: true,
            catatan: true,
            unit_satuan: {
               select: {
                  id: true,
                  nama: true,
                  deskripsi: true,
               },
            },
            usulan_kegiatan: {
               select: {
                  status_usulan: true,
                  verifikasi: {
                     where: {
                        table_referensi: "tb_rab_detail",
                     },
                     select: {
                        id_referensi: true,
                        status: true,
                        catatan: true,
                     },
                  },
               },
            },
         },
      });

      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.post("/rab", async (req, res) => {
   try {
      const { id_usulan, uraian_biaya, qty, id_satuan, harga_satuan, total_biaya, catatan, user_modified } = req.body;

      const parsed = rabSchema.safeParse(req.body);

      if (!parsed.success) {
         const formattedErrors = {};
         for (const key in parsed.error.flatten().fieldErrors) {
            const val = parsed.error.flatten().fieldErrors[key];
            formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
         }

         return res.json({
            status: false,
            message: "Periksa kembali inputan anda.",
            errors: formattedErrors,
         });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["pengajuan", "diterima"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat memperbaharui atau menambahkan rencana anggaran baru" });
      }

      const newData = await prisma.tb_rab_detail.create({
         data: {
            id_usulan: Number.parseInt(id_usulan),
            uraian_biaya,
            qty: Number.parseInt(qty) || 1,
            id_satuan: Number.parseInt(id_satuan),
            harga_satuan: cleanRupiah(harga_satuan),
            total_biaya: cleanRupiah(total_biaya),
            catatan,
            uploaded: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "CREATE", "tb_rab_detail", req.ip, null, { ...newData });

      return res.status(201).json({
         status: true,
         message: "Rencana anggaran biaya berhasil ditambahkan.",
         id_usulan,
         refetchQuery: [[`/usulan-kegiatan/${id_usulan}/rab`, {}]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.put("/rab/:id_usulan/:id", async (req, res) => {
   try {
      const { id_usulan, id } = req.params;
      const { uraian_biaya, qty, id_satuan, harga_satuan, total_biaya, catatan, user_modified } = req.body;

      const parsed = rabSchema.safeParse(req.body);

      if (!parsed.success) {
         const formattedErrors = {};
         for (const key in parsed.error.flatten().fieldErrors) {
            const val = parsed.error.flatten().fieldErrors[key];
            formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
         }

         return res.json({
            status: false,
            message: "Periksa kembali inputan anda.",
            errors: formattedErrors,
         });
      }

      const oldData = await prisma.tb_rab_detail.findUnique({
         where: { id_usulan: Number.parseInt(id_usulan), id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Rencana anggaran biaya tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["diterima", "pengajuan"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat melakukan penambahan atau perubahan rencana anggaran biaya" });
      }

      const newData = await prisma.tb_rab_detail.update({
         where: { id_usulan: Number.parseInt(id_usulan), id: Number.parseInt(id) },
         data: {
            uraian_biaya,
            qty: Number.parseInt(qty) || 1,
            id_satuan: Number.parseInt(id_satuan),
            harga_satuan: cleanRupiah(harga_satuan),
            total_biaya: cleanRupiah(total_biaya),
            catatan,
            modified: new Date(),
            user_modified,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_rab_detail", req.ip, null, { ...newData });

      return res.status(201).json({
         status: true,
         message: "Rencana anggaran biaya berhasil diperbaharui",
         id_usulan,
         refetchQuery: [[`/usulan-kegiatan/${id_usulan}/rab`, {}]],
      });
   } catch (error) {
      return res.join({ status: false, message: error.message });
   }
});

router.delete("/rab/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;
      const { id_usulan_kegiatan } = req.query;

      const oldData = await prisma.tb_rab_detail.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Rencana anggaran biaya tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(oldData.id_usulan),
            status_usulan: {
               in: ["diterima", "pengajuan"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat melakukan penghapusan rencana anggaran biaya" });
      }

      await prisma.tb_rab_detail.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_rab_detail", req.ip, { ...oldData }, null);

      return res.json({
         status: true,
         message: "Rencana anggaran biaya berhasil dihapus",
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/rab`, {}]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/:id/dokumen", async (req, res) => {
   try {
      const { id } = req.params;
      const where = { id_usulan: Number.parseInt(id) };

      const total = await prisma.tb_dokumen_pendukung.count({ where });
      const results = await prisma.tb_dokumen_pendukung.findMany({
         where,
         select: {
            id: true,
            nama_dokumen: true,
            tipe_dokumen: true,
            path_file: true,
            file_dokumen: true,
            usulan_kegiatan: {
               select: {
                  status_usulan: true,
                  verifikasi: {
                     where: {
                        table_referensi: "tb_dokumen_pendukung",
                     },
                     select: {
                        id_referensi: true,
                        status: true,
                        catatan: true,
                     },
                  },
               },
            },
         },
      });

      return res.json({
         results,
         total,
         refetchQuery: [[`/usulan-kegiatan/${id}/dokumen`, {}]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.post("/:id_usulan_kegiatan/dokumen", upload.single("file_dokumen"), async (req, res) => {
   try {
      const { id_usulan_kegiatan } = req.params;
      const { nama_dokumen, user_modified } = req.body;

      const parsed = validasiDokumen.safeParse(req.body);

      if (!parsed.success) {
         const formattedErrors = {};
         for (const key in parsed.error.flatten().fieldErrors) {
            const val = parsed.error.flatten().fieldErrors[key];
            formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
         }

         return res.json({
            status: false,
            message: "Periksa kembali inputan anda.",
            errors: formattedErrors,
         });
      }

      const fileValidation = validateFileUpload(req);
      if (!fileValidation.valid) {
         return res.json({
            status: false,
            errors: fileValidation.error,
         });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id_usulan_kegiatan),
            status_usulan: {
               in: ["pengajuan", "diterima"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat memperbaharui atau menambahkan dokumen baru" });
      }

      const tipe_dokumen = getTipeDokumen(req.file.mimetype);
      const file_dokumen = req.file.filename;

      const { path_file } = await handleFileStorage(req);

      // Save to database
      const newData = await prisma.tb_dokumen_pendukung.create({
         data: {
            id_usulan: Number.parseInt(id_usulan_kegiatan),
            nama_dokumen: nama_dokumen.trim(),
            path_file,
            uploaded: new Date(),
            user_modified,
            tipe_dokumen,
            file_dokumen,
         },
      });

      logAudit(user_modified, "CREATE", "tb_dokumen_pendukung", req.ip, null, { ...newData });

      return res.status(201).json({
         status: true,
         message: "Dokumen berhasil diunggah.",
         id_dokumen: newData.id,
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.put("/:id_usulan_kegiatan/dokumen/:id", upload.single("file_dokumen"), async (req, res) => {
   try {
      const { id, id_usulan_kegiatan } = req.params;
      const { nama_dokumen, user_modified } = req.body;

      const parsed = validasiDokumen.safeParse(req.body);

      if (!parsed.success) {
         const formattedErrors = {};
         for (const key in parsed.error.flatten().fieldErrors) {
            const val = parsed.error.flatten().fieldErrors[key];
            formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
         }

         return res.json({
            status: false,
            message: "Periksa kembali inputan anda.",
            errors: formattedErrors,
         });
      }

      const oldData = await prisma.tb_dokumen_pendukung.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Dokumen tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(id_usulan_kegiatan),
            status_usulan: {
               in: ["pengajuan", "diterima"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat memperbaharui atau menambahkan dokumen baru" });
      }

      const fileUpdate = await updateDocumentFile(req, oldData);

      // Update database
      const newData = await prisma.tb_dokumen_pendukung.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama_dokumen: nama_dokumen.trim(),
            path_file: fileUpdate.path_file,
            modified: new Date(),
            user_modified,
            tipe_dokumen: fileUpdate.tipe_dokumen,
            file_dokumen: fileUpdate.file_dokumen,
         },
      });

      logAudit(user_modified, "UPDATE", "tb_dokumen_pendukung", req.ip, { ...oldData }, { ...newData });

      return res.status(200).json({
         status: true,
         message: "Dokumen berhasil diperbarui.",
         id_dokumen: newData.id,
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`, {}]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.delete("/dokumen/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;
      const { id_usulan_kegiatan } = req.query;

      const oldData = await prisma.tb_dokumen_pendukung.findUnique({
         where: {
            id: Number.parseInt(id),
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Dokumen pendukung tidak ditemukan" });
      }

      const checkStatusUsulan = await prisma.tb_usulan_kegiatan.findFirst({
         where: {
            id: Number.parseInt(oldData.id_usulan),
            status_usulan: {
               in: ["diterima", "pengajuan"],
            },
         },
      });

      if (checkStatusUsulan) {
         return res.json({ status: false, message: "Tidak dapat melakukan penghapusan dokumen" });
      }

      await prisma.tb_dokumen_pendukung.delete({
         where: {
            id: Number.parseInt(id),
         },
      });

      logAudit(user_modified, "DELETE", "tb_dokumen_pendukung", req.ip, { ...oldData }, null);

      return res.json({ status: true, refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`, {}]] });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

module.exports = router;
