const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper function to log audit
const logAudit = async (user_modified, action_type, table_affected, ip_address, old_value = null, new_value = null) => {
   try {
      await prisma.tb_audit_logs.create({
         data: {
            user_modified,
            action_type,
            table_affected,
            old_value: old_value ? JSON.stringify(old_value) : null,
            new_value: new_value ? JSON.stringify(new_value) : null,
            ip_address,
            timestamp: new Date(),
         },
      });
   } catch (error) {
      console.error("Audit log error:", error);
   }
};

module.exports = {
   logAudit,
};
