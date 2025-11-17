const db = require("@/db");
const { z } = require("zod");
const { logAudit, cleanRupiah } = require("@/helpers");
const path = require("node:path");
const fs = require("node:fs");
const { Client } = require("ssh2");

const rabSchema = z.object({
   uraian_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Uraian wajib diisi")),
   qty: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Jumlah wajib diisi")),
   id_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Unit satuan wajib dipilih")),
   harga_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Harga satuan wajib diisi")),
   total_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Total biaya wajib diisi")),
});

const validasiDokumen = z.object({
   nama_dokumen: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama dokumen wajib diisi")),
});

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

const allowedMimeTypes = new Set([
   "application/pdf",
   "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
   "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
   "image/jpeg",
   "image/png",
]);

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

const submitRelasiIKU = async (req, res) => {
   try {
      const { id_usulan_kegiatan } = req.params;
      const { id, user_modified } = req.body;

      // Check if the relation already exists
      const existing = await db.read.tb_relasi_usulan_iku.findFirst({
         where: {
            id_usulan: Number.parseInt(id_usulan_kegiatan),
            id_iku: Number.parseInt(id),
         },
      });

      if (existing) {
         return res.json({ status: false, message: "Relasi IKU sudah ada." });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      const newData = await db.write.tb_relasi_usulan_iku.create({
         data: {
            id_usulan: Number.parseInt(id_usulan_kegiatan),
            id_iku: Number.parseInt(id),
            uploaded: new Date(),
            user_modified,
         },
      });

      await logAudit(user_modified, "CREATE", "tb_relasi_usulan_iku", req.ip, null, { ...newData });

      return res.json({
         status: true,
         message: "Relasi IKU berhasil ditambahkan.",
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`, {}]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const submitRAB = async (req, res) => {
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

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      const newData = await db.write.tb_rab_detail.create({
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

      await logAudit(user_modified, "CREATE", "tb_rab_detail", req.ip, null, { ...newData });

      return res.status(201).json({
         status: true,
         message: "Rencana anggaran biaya berhasil ditambahkan.",
         id_usulan,
         refetchQuery: [[`/usulan-kegiatan/${id_usulan}/rab`, {}]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
};

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

const handleFileStorage = async (req) => {
   const { filename } = req.file;
   let path_file;
   let cdn_url = null;

   if (process.env.CDN_HOST) {
      try {
         cdn_url = await uploadToCDN(req.file.path, filename);
         path_file = `https://cdn.ar-raniry.ac.id/plankepentok/${filename}`;
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
         path_file = `/uploads/dokumen/${filename}`;
      }
   } else {
      const localDir = path.join(__dirname, "../../uploads/dokumen");
      if (!fs.existsSync(localDir)) {
         fs.mkdirSync(localDir, { recursive: true });
      }
      const localPath = path.join(localDir, filename);
      fs.renameSync(req.file.path, localPath);
      path_file = `/uploads/dokumen/${filename}`;
   }

   return { path_file, cdn_url };
};

const submitDokumen = async (req, res) => {
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
            message: "Periksa kembali inputan anda",
         });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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
      const newData = await db.write.tb_dokumen_pendukung.create({
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

      await logAudit(user_modified, "CREATE", "tb_dokumen_pendukung", req.ip, null, { ...newData });

      return res.status(201).json({
         status: true,
         message: "Dokumen berhasil diunggah.",
         id_dokumen: newData.id,
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const submitUsulanKegiatan = async (req, res) => {
   try {
      const { kode, tempat_pelaksanaan, user_modified, pengguna } = req.body;

      if (!pengguna) {
         return res.json({ status: false, message: "Anda tidak mempunyai akses untuk melakukan penambahan usulan kegiatan" });
      }

      const newData = await db.write.tb_usulan_kegiatan.create({
         data: {
            kode,
            uploaded: new Date(),
            user_modified,
            tempat_pelaksanaan,
            operator_input: pengguna?.id,
         },
      });

      const newDataUnit = await db.write.tb_unit_pengusul.create({
         data: {
            id_usulan_kegiatan: newData.id,
            id_biro: pengguna.pengguna_role.id_biro,
            id_lembaga: pengguna.pengguna_role.id_lembaga,
            id_upt: pengguna.pengguna_role.id_upt,
            id_fakultas: pengguna.pengguna_role.id_fakultas,
            id_sub_unit: pengguna.pengguna_role.id_sub_unit,
         },
      });

      await logAudit(user_modified, "CREATE", "tb_usulan_kegiatan", req.ip, null, { ...newData });
      await logAudit(user_modified, "CREATE", "tb_unit_pengusul", req.ip, null, { ...newDataUnit });

      return res.status(201).json({ status: true, id_usulan_kegiatan: newData.id });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

module.exports = {
   submitUsulanKegiatan,
   submitRelasiIKU,
   submitRAB,
   submitDokumen,
   validateFileUpload,
   handleFileStorage,
   validasiDokumen,
   getTipeDokumen,
};
