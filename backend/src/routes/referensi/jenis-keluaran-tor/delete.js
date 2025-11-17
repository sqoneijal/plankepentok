const { logAudit } = require("@/helpers");
const db = require("@/db");

const deleteData = async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await db.read.tb_mst_jenis_keluaran_tor.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Data tidak ditemukan" });
      }

      await db.write.tb_mst_jenis_keluaran_tor.delete({
         where: { id: Number.parseInt(id) },
      });

      await logAudit(user_modified, "DELETE", "tb_mst_jenis_keluaran_tor", req.ip, { ...oldData }, null);

      res.status(201).json({
         status: true,
         message: "Data berhasil dihapus",
         refetchQuery: [["/referensi/jenis-keluaran-tor", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
};

module.exports = { deleteData };
