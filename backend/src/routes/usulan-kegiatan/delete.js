const db = require("@/db");
const { logAudit } = require("@/helpers");

const deleteRelasiIKU = async (req, res) => {
   try {
      const { id } = req.params;
      const { id_usulan_kegiatan } = req.query;
      const { user_modified } = req.body;

      const oldData = await db.read.tb_relasi_usulan_iku.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Relasi IKU tidak ditemukan" });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      await db.write.tb_relasi_usulan_iku.delete({
         where: { id: Number.parseInt(id) },
      });

      await logAudit(user_modified, "DELETE", "tb_relasi_usulan_iku", req.ip, { ...oldData }, null);

      return res.json({
         status: true,
         message: "Relasi IKU berhasil dihapus.",
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`, {}]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const deleteRABDetail = async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;
      const { id_usulan_kegiatan } = req.query;

      const oldData = await db.read.tb_rab_detail.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Rencana anggaran biaya tidak ditemukan" });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      await db.write.tb_rab_detail.delete({
         where: { id: Number.parseInt(id) },
      });

      await logAudit(user_modified, "DELETE", "tb_rab_detail", req.ip, { ...oldData }, null);

      return res.json({
         status: true,
         message: "Rencana anggaran biaya berhasil dihapus",
         refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/rab`, {}]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
};

const deleteDokumen = async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;
      const { id_usulan_kegiatan } = req.query;

      const oldData = await db.read.tb_dokumen_pendukung.findUnique({
         where: {
            id: Number.parseInt(id),
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Dokumen pendukung tidak ditemukan" });
      }

      const checkStatusUsulan = await db.read.tb_usulan_kegiatan.findFirst({
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

      await db.write.tb_dokumen_pendukung.delete({
         where: {
            id: Number.parseInt(id),
         },
      });

      await logAudit(user_modified, "DELETE", "tb_dokumen_pendukung", req.ip, { ...oldData }, null);

      return res.json({ status: true, refetchQuery: [[`/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`, {}]] });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const deleteUsulanKegiatan = async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

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
         return res.json({ status: false, message: "Tidak dapat melakukan penghapusan pengajuan" });
      }

      // Delete related records first to avoid foreign key constraint violations
      await db.write.tb_anggaran_disetujui.deleteMany({
         where: { id_usulan: Number.parseInt(id) },
      });

      await db.write.tb_unit_pengusul.deleteMany({
         where: { id_usulan_kegiatan: Number.parseInt(id) },
      });

      await db.write.tb_relasi_usulan_iku.deleteMany({
         where: { id_usulan: Number.parseInt(id) },
      });

      await db.write.tb_rab_detail.deleteMany({
         where: { id_usulan: Number.parseInt(id) },
      });

      await db.write.tb_dokumen_pendukung.deleteMany({
         where: { id_usulan: Number.parseInt(id) },
      });

      await db.write.tb_klaim_verifikasi.deleteMany({
         where: { id_usulan_kegiatan: Number.parseInt(id) },
      });

      await db.write.tb_verifikasi.deleteMany({
         where: { id_usulan_kegiatan: Number.parseInt(id) },
      });

      await db.write.tb_usulan_kegiatan.delete({
         where: { id: Number.parseInt(id) },
      });

      await logAudit(user_modified, "DELETE", "tb_usulan_kegiatan", req.ip, { ...checkStatusUsulan }, null);

      return res.json({
         status: true,
         message: "Usulan kegiatan berhasil dihapus",
         refetchQuery: [["/usulan-kegiatan", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

module.exports = { deleteRelasiIKU, deleteRABDetail, deleteDokumen, deleteUsulanKegiatan };
