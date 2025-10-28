const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:username", async (req, res) => {
   try {
      const { username } = req.params;

      const results = await prisma.tb_pengguna.findUnique({
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

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
