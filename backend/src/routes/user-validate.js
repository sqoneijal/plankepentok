const express = require("express");
const db = require("@/db.js");

const router = express.Router();

router.get("/:username", async (req, res) => {
   try {
      const { username } = req.params;

      const results = await db.read.tb_pengguna.findMany({
         where: { username },
         select: {
            id: true,
            username: true,
            level_unit: true,
            roles: true,
            pengguna_role: {
               select: {
                  id_biro: true,
                  id_lembaga: true,
                  id_upt: true,
                  id_fakultas: true,
                  id_sub_unit: true,
               },
            },
         },
      });

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
});

module.exports = router;
