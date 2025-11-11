const express = require("express");

const router = express.Router();
const db = require("@/db.js");

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [
            { user_modified: { contains: search, mode: "insensitive" } },
            { action_type: { contains: search, mode: "insensitive" } },
            { table_affected: { contains: search, mode: "insensitive" } },
         ],
      };
      const where = search ? query : {};

      const total = await db.read.tb_audit_logs.count({ where });
      const results = await db.read.tb_audit_logs.findMany({
         where,
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
