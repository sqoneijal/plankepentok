const db = require("@/db");

const getData = async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await db.read.tb_mst_volume_keluaran_tor.count();
      const results = await db.read.tb_mst_volume_keluaran_tor.findMany({
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         select: {
            id: true,
            nama: true,
            keterangan: true,
         },
      });

      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ status: false, error: error.message });
   }
};

const getDetail = async (req, res) => {
   try {
      const { id } = req.params;

      const results = await db.read.tb_mst_volume_keluaran_tor.findUnique({
         where: { id: Number.parseInt(id) },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ status: false, error: error.message });
   }
};

module.exports = { getData, getDetail };
