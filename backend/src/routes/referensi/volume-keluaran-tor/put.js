const { z } = require("zod");
const errorHandler = require("@/handle-error");
const { logAudit } = require("@/helpers");
const db = require("@/db");

const validation = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama jenis keluaran wajib diisi")),
});

const udpateData = async (req, res) => {
   try {
      const { id } = req.params;
      const { nama, keterangan, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.read.tb_mst_volume_keluaran_tor.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Data tidak ditemukan" });
      }

      const newData = await db.write.tb_mst_volume_keluaran_tor.update({
         where: { id: Number.parseInt(id) },
         data: {
            nama,
            keterangan,
            modified: new Date(),
            user_modified,
         },
      });

      await logAudit(user_modified, "UPDATE", "tb_mst_volume_keluaran_tor", req.ip, { ...oldData }, { ...newData });

      res.status(201).json({
         status: true,
         message: "Data berhasil diperbaharui",
         refetchQuery: [["/referensi/volume-keluaran-tor", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
};

module.exports = { udpateData };
