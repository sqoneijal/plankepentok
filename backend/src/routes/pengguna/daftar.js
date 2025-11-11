const express = require("express");
const { z } = require("zod");
const errorHandler = require("@/handle-error.js");
const { logAudit } = require("@/helpers.js");

const ROLE_OPERATOR = "3"; // Constant for operator role ID

const validation = z
   .object({
      id_roles: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Role wajib diisi")),
      id_parent: z.preprocess((val) => (val == null ? "" : String(val)), z.string()),
      username: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Operator wajib diisi")),
   })
   .refine(
      (data) => {
         if (data.id_roles === ROLE_OPERATOR) {
            return data.id_parent.length > 0;
         }
         return true;
      },
      {
         message: "Unit kerja wajib diisi",
         path: ["id_parent"],
      }
   );

const router = express.Router();
const db = require("@/db.js");

// Helper function to parse id_parent
const parseIdParent = (id_parent) => {
   const split_id_parent = id_parent ? id_parent.split("-") : [];
   const idParent = Number.parseInt(split_id_parent?.[0]) || null;
   const levelUnit = split_id_parent?.[1] || null;
   return { idParent, levelUnit, split_id_parent };
};

// Helper function to validate unit existence
const validateUnitExistence = async (idParent, levelUnit) => {
   if (!idParent || !levelUnit) return null;

   let exists;
   switch (levelUnit) {
      case "biro":
         exists = await db.read.tb_biro_master.findUnique({ where: { id: idParent } });
         break;
      case "lembaga":
         exists = await db.read.tb_lembaga_master.findUnique({ where: { id: idParent } });
         break;
      case "upt":
         exists = await db.read.tb_upt_master.findUnique({ where: { id: idParent } });
         break;
      case "fakultas":
         exists = await db.read.tb_fakultas_master.findUnique({ where: { id: idParent } });
         break;
      case "sub_unit":
         exists = await db.read.tb_sub_unit.findUnique({ where: { id: idParent } });
         break;
      default:
         exists = false;
   }

   return exists ? idParent : null;
};

// Helper function to create unit IDs object
const createUnitIds = (levelUnit, idParent) => {
   const unitIds = {
      id_biro: null,
      id_lembaga: null,
      id_upt: null,
      id_fakultas: null,
      id_sub_unit: null,
   };

   if (levelUnit && idParent) {
      switch (levelUnit) {
         case "biro":
            unitIds.id_biro = idParent;
            break;
         case "lembaga":
            unitIds.id_lembaga = idParent;
            break;
         case "upt":
            unitIds.id_upt = idParent;
            break;
         case "fakultas":
            unitIds.id_fakultas = idParent;
            break;
         case "sub_unit":
            unitIds.id_sub_unit = idParent;
            break;
      }
   }

   return unitIds;
};

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [{ username: { contains: search, mode: "insensitive" } }, { fullname: { contains: search, mode: "insensitive" } }],
      };
      const where = search ? query : {};

      const total = await db.read.tb_pengguna.count({ where });
      const results = await db.read.tb_pengguna.findMany({
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         where,
         select: {
            id: true,
            username: true,
            fullname: true,
            level_unit: true,
            roles: true,
            pengguna_role: {
               select: {
                  id: true,
                  biro_master: {
                     select: { id: true, nama: true },
                  },
                  fakultas_master: {
                     select: { id: true, nama: true },
                  },
                  lembaga_master: {
                     select: { id: true, nama: true },
                  },
                  sub_unit: {
                     select: { id: true, nama: true },
                  },
                  upt_master: {
                     select: { id: true, nama: true },
                  },
               },
            },
         },
      });

      return res.json({ results, total });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/roles", async (req, res) => {
   try {
      const results = await db.read.tb_roles.findMany();

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.get("/unit-kerja", async (req, res) => {
   try {
      const biro = await db.read.tb_biro_master.findMany({
         select: {
            id: true,
            nama: true,
            sub_unit: {
               select: { id: true, nama: true },
            },
         },
      });

      const lembaga = await db.read.tb_lembaga_master.findMany({
         select: {
            id: true,
            nama: true,
            sub_unit: {
               select: { id: true, nama: true },
            },
         },
      });

      const upt = await db.read.tb_upt_master.findMany({
         select: {
            id: true,
            nama: true,
            sub_unit: {
               select: { id: true, nama: true },
            },
         },
      });

      const fakultas = await db.read.tb_fakultas_master.findMany({
         select: {
            id: true,
            nama: true,
            sub_unit: {
               select: { id: true, nama: true },
            },
         },
      });

      const results = [
         ...biro.map((b) => ({ ...b, level: "biro" })),
         ...lembaga.map((b) => ({ ...b, level: "lembaga" })),
         ...upt.map((b) => ({ ...b, level: "upt" })),
         ...fakultas.map((b) => ({ ...b, level: "fakultas" })),
      ];

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { username, fullname, id_parent, id_roles, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const checkDuplicate = await db.read.tb_pengguna.findUnique({
         where: {
            username_id_roles: {
               username,
               id_roles: Number.parseInt(id_roles),
            },
         },
      });

      if (checkDuplicate) {
         return res.json({
            status: false,
            message: "Periksa kembali inputan anda",
            errors: {
               username: "Operator sudah terdaftar",
            },
         });
      }

      const { idParent, levelUnit, split_id_parent } = parseIdParent(id_parent);
      const validatedIdParent = await validateUnitExistence(idParent, levelUnit);
      const unitIds = createUnitIds(levelUnit, validatedIdParent);

      const newData = await db.write.tb_pengguna.create({
         data: {
            username,
            level_unit: levelUnit,
            id_roles: Number.parseInt(id_roles),
            fullname,
         },
      });

      await logAudit(user_modified, "CREATE", "tb_pengguna", req.ip, null, { ...newData });

      if (Number.parseInt(id_roles) === Number.parseInt(ROLE_OPERATOR)) {
         const newDataPenggunaRole = await db.write.tb_pengguna_role.create({
            data: {
               id_pengguna: newData.id,
               ...unitIds,
            },
         });

         await logAudit(user_modified, "CREATE", "tb_pengguna_role", req.ip, null, { ...newDataPenggunaRole });
      }

      return res.json({
         status: true,
         message: "Pengguna berhasil disimpan",
         split_id_parent,
         length: split_id_parent.length,
         refetchQuery: [
            ["/pengguna/daftar", { limit: "25", offset: "0", search: "" }],
            [`/user-validate/${user_modified}`, {}],
         ],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await db.read.tb_pengguna.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Pengguna tidak ditemukan" });
      }

      const oldDataRole = await db.read.tb_pengguna_role.findUnique({
         where: { id_pengguna: Number.parseInt(id) },
      });

      if (oldDataRole) {
         logAudit(user_modified, "DELETE", "tb_pengguna_role", req.ip, { ...oldDataRole }, null);
      }

      await db.write.tb_pengguna.delete({
         where: { id: Number.parseInt(id) },
      });

      await logAudit(user_modified, "DELETE", "tb_pengguna", req.ip, { ...oldData }, null);

      return res.json({
         status: true,
         message: "Pengguna berhasil dihapus",
         refetchQuery: [
            ["/pengguna/daftar", { limit: "25", offset: "0", search: "" }],
            [`/user-validate/${user_modified}`, {}],
         ],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

module.exports = router;
