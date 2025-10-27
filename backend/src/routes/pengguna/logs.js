const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await prisma.tb_audit_logs.count();
      const results = await prisma.tb_audit_logs.findMany({
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
      });

      // Convert BigInt fields to strings for JSON serialization
      const serializedResults = results.map((log) => ({
         ...log,
         id: log.id.toString(),
      }));

      return res.json({ results: serializedResults, total });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

module.exports = router;
