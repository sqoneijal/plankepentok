const { z } = require("zod");
const errorHandler = require("@/handle-error");
const { logAudit } = require("@/helpers");
const db = require("@/db");

const validation = z.object({
   nama: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Nama jenis keluaran wajib diisi")),
});

const createData = async (req, res) => {
   try {
      const { nama, keterangan, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const newData = await db.write.tb_mst_penerima_manfaat_tor.create({
         data: {
            nama,
            keterangan,
            uploaded: new Date(),
            user_modified,
         },
      });

      await logAudit(user_modified, "CREATE", "tb_mst_penerima_manfaat_tor", req.ip, null, { ...newData });

      res.status(201).json({
         status: true,
         message: "Data berhasil ditambahkan",
         refetchQuery: [["/referensi/penerima-manfaat-tor", { limit: "25", offset: "0" }]],
      });
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
};

module.exports = { createData };
