const { z } = require("zod");
const db = require("@/db");
const { cleanRupiah, logAudit } = require("@/helpers");
const fs = require("node:fs");
const { validateFileUpload, handleFileStorage, validasiDokumen, getTipeDokumen } = require("./post");
const path = require("node:path");
const errorHandler = require("@/handle-error.js");
const { encode } = require("html-entities");

class ValidationError extends Error {
   constructor(errors) {
      super("Validation failed");
      this.errors = errors;
   }
}

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

const updateInformasiUsulanKegiatan = async (req, res) => {
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

      const oldData = await db.read.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      const newData = await db.write.tb_usulan_kegiatan.update({
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

      await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });

      return res.json({
         status: true,
         message: "Usulan kegiatan berhasil diperbaharui.",
         refetchQuery: [["/usulan-kegiatan", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const updateRABDetail = async (req, res) => {
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

      const oldData = await db.read.tb_rab_detail.findUnique({
         where: { id_usulan: Number.parseInt(id_usulan), id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Rencana anggaran biaya tidak ditemukan" });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      const newData = await db.write.tb_rab_detail.update({
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

      await logAudit(user_modified, "UPDATE", "tb_rab_detail", req.ip, null, { ...newData });

      return res.status(201).json({
         status: true,
         message: "Rencana anggaran biaya berhasil diperbaharui",
         id_usulan,
         refetchQuery: [[`/usulan-kegiatan/${id_usulan}/rab`, {}]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

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

const updateDokumen = async (req, res) => {
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

      const oldData = await db.read.tb_dokumen_pendukung.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Dokumen tidak ditemukan" });
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

      const fileUpdate = await updateDocumentFile(req, oldData);

      // Update database
      const newData = await db.write.tb_dokumen_pendukung.update({
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

      await logAudit(user_modified, "UPDATE", "tb_dokumen_pendukung", req.ip, { ...oldData }, { ...newData });

      return res.status(200).json({
         status: true,
         message: "Dokumen berhasil diperbarui.",
         id_dokumen: newData.id,
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`, {}]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const updateUsulKegiatan = async (req, res) => {
   try {
      const { id_usulan, user_modified } = req.body;

      const pengaturan = await db.read.tb_pengaturan.findFirst({
         where: { is_aktif: true },
         select: { id: true },
      });

      if (!pengaturan) {
         return res.json({ status: false, message: "Tidak dapat melakukan penambahkan usulan kegiatan, tidak ada tahun anggaran yang sedang aktif" });
      }

      const oldData = await db.read.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan) },
         select: {
            modified: true,
            user_modified: true,
            status_usulan: true,
            id_pengaturan: true,
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      const checkVerifikator = await db.read.tb_verikator_usulan.findFirst({
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

      const newData = await db.write.tb_usulan_kegiatan.update({
         where: { id: Number.parseInt(id_usulan) },
         data: {
            modified: new Date(),
            user_modified,
            status_usulan: "pengajuan",
            id_pengaturan: pengaturan.id,
         },
      });

      await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });

      return res.json({
         status: true,
         message: "Usulan kegiatan berhasil diperbaharui",
         checkVerifikator,
         refetchQuery: [
            [`/usulan-kegiatan/${id_usulan}`, {}],
            ["/verifikasi-usulan/pengajuan", { limit: "25", offset: "0" }],
         ],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const validationTOR = z.object({
   penyelenggara: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Penyelenggara wajib diisi")),
   program: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Program wajib diisi")),
   kegiatan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Kegiatan wajib diisi")),
   ikk: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Indikator kinerja kegiatan wajib diisi")),
   jenis_keluaran: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Jenis keluaran wajib diisi")),
   volume_keluaran: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Volume keluaran wajib diisi")),
   satuan_ukuran_keluaran: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Satuan ukuran keluaran wajib diisi")),
   penerima_manfaat: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Penerima manfaat wajib diisi")),
});

const updateTOR = async (req, res) => {
   try {
      const { id_usulan_kegiatan } = req.params;
      const {
         user_modified,
         penyelenggara,
         program,
         kegiatan,
         ikk,
         satuan_ukuran_keluaran,
         jenis_keluaran,
         dasar_hukum,
         gambaran_umum,
         alasan_kegiatan,
         uraian_kegiatan,
         batasan_kegiatan,
         maksud_kegiatan,
         tujuan_kegiatan,
         indikator_keluaran,
         keluaran,
         metode_pelaksanaan,
         tahapan_kegiatan,
         tempat_pelaksanaan,
         pelaksana_kegiatan,
         penanggung_jawab,
         jadwal_kegiatan,
         biaya,
         volume_keluaran,
         penerima_manfaat,
      } = req.body;

      const parsed = validationTOR.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.read.tb_tor.findUnique({
         where: {
            id_usulan_kegiatan: Number.parseInt(id_usulan_kegiatan),
         },
      });

      if (oldData) {
         // Update existing TOR
         const updatedData = await db.write.tb_tor.update({
            where: { id: oldData.id },
            data: {
               penyelenggara,
               program,
               kegiatan,
               ikk,
               satuan_ukuran_keluaran,
               dasar_hukum: encode(dasar_hukum),
               gambaran_umum: encode(gambaran_umum),
               alasan_kegiatan: encode(alasan_kegiatan),
               uraian_kegiatan: encode(uraian_kegiatan),
               batasan_kegiatan: encode(batasan_kegiatan),
               maksud_kegiatan: encode(maksud_kegiatan),
               tujuan_kegiatan: encode(tujuan_kegiatan),
               indikator_keluaran: encode(indikator_keluaran),
               keluaran: encode(keluaran),
               metode_pelaksanaan: encode(metode_pelaksanaan),
               tahapan_kegiatan: encode(tahapan_kegiatan),
               tempat_pelaksanaan: encode(tempat_pelaksanaan),
               pelaksana_kegiatan: encode(pelaksana_kegiatan),
               penanggung_jawab: encode(penanggung_jawab),
               jadwal_kegiatan: encode(jadwal_kegiatan),
               biaya: encode(biaya),
               modified: new Date(),
               user_modified,
            },
         });

         await logAudit(user_modified, "UPDATE", "tb_tor", req.ip, { ...oldData }, { ...updatedData });

         // Delete old related data
         await db.write.tb_jenis_keluaran_tor.deleteMany({
            where: { id_tor: oldData.id },
         });
         await db.write.tb_volume_keluaran_tor.deleteMany({
            where: { id_tor: oldData.id },
         });
         await db.write.tb_penerima_manfaat_tor.deleteMany({
            where: { id_tor: oldData.id },
         });

         // Insert new related data
         const dataJenisKeluaran = jenis_keluaran.split(",").map((id) => ({
            id_tor: oldData.id,
            id_mst_jenis_keluaran_tor: Number.parseInt(id.trim()),
         }));

         await db.write.tb_jenis_keluaran_tor.createMany({
            data: dataJenisKeluaran,
            skipDuplicates: true,
         });

         const dataVolumeKeluaran = volume_keluaran.split(",").map((id) => ({
            id_tor: oldData.id,
            id_mst_volume_keluaran_tor: Number.parseInt(id.trim()),
         }));

         await db.write.tb_volume_keluaran_tor.createMany({
            data: dataVolumeKeluaran,
            skipDuplicates: true,
         });

         const dataPenerimaManfaat = penerima_manfaat.split(",").map((id) => ({
            id_tor: oldData.id,
            id_mst_penerima_manfaat_tor: Number.parseInt(id.trim()),
         }));

         await db.write.tb_penerima_manfaat_tor.createMany({
            data: dataPenerimaManfaat,
            skipDuplicates: true,
         });

         res.json({
            status: true,
            message: "TOR berhasil diperbarui.",
         });
      } else {
         const newData = await db.write.tb_tor.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan_kegiatan),
               penyelenggara,
               program,
               kegiatan,
               ikk,
               satuan_ukuran_keluaran,
               dasar_hukum: encode(dasar_hukum),
               gambaran_umum: encode(gambaran_umum),
               alasan_kegiatan: encode(alasan_kegiatan),
               uraian_kegiatan: encode(uraian_kegiatan),
               batasan_kegiatan: encode(batasan_kegiatan),
               maksud_kegiatan: encode(maksud_kegiatan),
               tujuan_kegiatan: encode(tujuan_kegiatan),
               indikator_keluaran: encode(indikator_keluaran),
               keluaran: encode(keluaran),
               metode_pelaksanaan: encode(metode_pelaksanaan),
               tahapan_kegiatan: encode(tahapan_kegiatan),
               tempat_pelaksanaan: encode(tempat_pelaksanaan),
               pelaksana_kegiatan: encode(pelaksana_kegiatan),
               penanggung_jawab: encode(penanggung_jawab),
               jadwal_kegiatan: encode(jadwal_kegiatan),
               biaya: encode(biaya),
               uploaded: new Date(),
               user_modified,
            },
         });

         await logAudit(user_modified, "CREATE", "tb_tor", req.ip, null, { ...newData });

         const dataJenisKeluaran = jenis_keluaran.split(",").map((id) => ({
            id_tor: newData.id,
            id_mst_jenis_keluaran_tor: Number.parseInt(id.trim()),
         }));

         await db.write.tb_jenis_keluaran_tor.createMany({
            data: dataJenisKeluaran,
            skipDuplicates: true,
         });

         const dataVolumeKeluaran = volume_keluaran.split(",").map((id) => ({
            id_tor: newData.id,
            id_mst_volume_keluaran_tor: Number.parseInt(id.trim()),
         }));

         await db.write.tb_volume_keluaran_tor.createMany({
            data: dataVolumeKeluaran,
            skipDuplicates: true,
         });

         const dataPenerimaManfaat = penerima_manfaat.split(",").map((id) => ({
            id_tor: newData.id,
            id_mst_penerima_manfaat_tor: Number.parseInt(id.trim()),
         }));

         await db.write.tb_penerima_manfaat_tor.createMany({
            data: dataPenerimaManfaat,
            skipDuplicates: true,
         });

         res.json({
            status: true,
            message: "TOR berhasil dibuat.",
         });
      }
   } catch (error) {
      res.status(500).json({ status: false, error: error.message });
   }
};

module.exports = { updateUsulKegiatan, updateInformasiUsulanKegiatan, updateRABDetail, updateDokumen, updateTOR };
