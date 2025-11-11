const db = require("@/db.js");
const { logAudit } = require("@/helpers.js");
const errorHandler = require("@/handle-error.js");
const { z } = require("zod");

const validationPerbaikan = z.object({
   catatan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Asalan perbaikan wajib diisi")),
});

const validationPenolakan = z.object({
   catatan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Asalan penolakan wajib diisi")),
});

const perbaiki = async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { user_modified, catatan, klaim_verifikasi } = req.body;

      const parsed = validationPerbaikan.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.read.tb_usulan_kegiatan.findUnique({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["pengajuan", "ditolak", "perbaiki"],
            },
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      await db.write.$transaction(async (tx) => {
         const newDataLog = await tx.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               tahap: Number.parseInt(klaim_verifikasi.tahap),
               verifikator_id: Number.parseInt(klaim_verifikasi.id),
               aksi: "perbaiki",
               catatan,
               waktu: new Date(),
            },
         });

         await logAudit(user_modified, "CREATE", "tb_log_verifikasi", req.ip, null, { ...newDataLog });

         const newDataPerbaikan = await tx.tb_perbaikan_usulan.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               catatan,
               uploaded: new Date(),
               user_modified,
            },
         });

         await logAudit(user_modified, "CREATE", "tb_perbaikan_usulan", req.ip, null, { ...newDataPerbaikan });

         const newData = await tx.tb_usulan_kegiatan.update({
            where: { id: Number.parseInt(id_usulan) },
            data: {
               catatan_perbaikan: catatan,
               status_usulan: "perbaiki",
               modified: new Date(),
            },
         });

         await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });
      });

      return res.json({
         status: true,
         message: "Data berhasil disimpan",
         refetchQuery: [
            [`/verifikasi-usulan/pengajuan/${oldData.id}`, { username: user_modified }],
            ["/usulan-kegiatan", { limit: "25", offset: "0" }],
         ],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const tolak = async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { user_modified, catatan, klaim_verifikasi } = req.body;

      const parsed = validationPenolakan.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.read.tb_usulan_kegiatan.findUnique({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["pengajuan", "ditolak", "perbaiki"],
            },
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      await db.write.$transaction(async (tx) => {
         const newDataLog = await tx.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               tahap: Number.parseInt(klaim_verifikasi.tahap),
               verifikator_id: Number.parseInt(klaim_verifikasi.id_pengguna),
               aksi: "ditolak",
               catatan,
               waktu: new Date(),
            },
         });

         await logAudit(user_modified, "CREATE", "tb_log_verifikasi", req.ip, null, { ...newDataLog });

         const newDataPenolakan = await tx.tb_penolakan_usulan.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               catatan,
               uploaded: new Date(),
               user_modified,
            },
         });

         await logAudit(user_modified, "CREATE", "tb_penolakan_usulan", req.ip, null, { ...newDataPenolakan });

         const newData = await tx.tb_usulan_kegiatan.update({
            where: { id: Number.parseInt(id_usulan) },
            data: {
               catatan_perbaikan: catatan,
               status_usulan: "ditolak",
               modified: new Date(),
            },
         });

         await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });
      });

      return res.json({
         status: true,
         message: "Data berhasil disimpan",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

module.exports = { perbaiki, tolak };
