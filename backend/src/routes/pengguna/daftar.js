const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const errorHandler = require("../../handle-error.js");
const { logAudit } = require("../../helpers.js");

const validation = z
   .object({
      id_roles: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Role wajib diisi")),
      id_parent: z.preprocess((val) => (val == null ? "" : String(val)), z.string()),
      username: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Operator wajib diisi")),
   })
   .refine(
      (data) => {
         if (data.id_roles === "3") {
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
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await prisma.tb_pengguna.count();
      const results = await prisma.tb_pengguna.findMany({
         orderBy: { id: "desc" },
         take: limit,
         skip: offset,
         select: {
            id: true,
            username: true,
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
      const results = await prisma.tb_roles.findMany();

      return res.json({ results });
   } catch (error) {
      return res.json({ error: error.message });
   }
});

router.get("/unit-kerja", async (req, res) => {
   try {
      const biro = await prisma.tb_biro_master.findMany({
         select: {
            id: true,
            nama: true,
            sub_unit: {
               select: { id: true, nama: true },
            },
         },
      });

      const lembaga = await prisma.tb_lembaga_master.findMany({
         select: {
            id: true,
            nama: true,
            sub_unit: {
               select: { id: true, nama: true },
            },
         },
      });

      const upt = await prisma.tb_upt_master.findMany({
         select: {
            id: true,
            nama: true,
            sub_unit: {
               select: { id: true, nama: true },
            },
         },
      });

      const fakultas = await prisma.tb_fakultas_master.findMany({
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
      return res.json({ error: error.message });
   }
});

router.post("/", async (req, res) => {
   try {
      const { username, id_parent, id_roles, user_modified } = req.body;

      const parsed = validation.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const checkDuplicate = await prisma.tb_pengguna.findUnique({
         where: { username },
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

      const split_id_parent = id_parent ? id_parent.split("-") : [];
      let idParent = Number.parseInt(split_id_parent?.[0]) || null;
      const levelUnit = split_id_parent?.[1] || null;

      // Validate id_parent existence based on level_unit to allow null if not exists
      if (idParent && levelUnit) {
         let exists;
         switch (levelUnit) {
            case "biro":
               exists = await prisma.tb_biro_master.findUnique({ where: { id: idParent } });
               break;
            case "lembaga":
               exists = await prisma.tb_lembaga_master.findUnique({ where: { id: idParent } });
               break;
            case "upt":
               exists = await prisma.tb_upt_master.findUnique({ where: { id: idParent } });
               break;
            case "fakultas":
               exists = await prisma.tb_fakultas_master.findUnique({ where: { id: idParent } });
               break;
            case "sub_unit":
               exists = await prisma.tb_sub_unit.findUnique({ where: { id: idParent } });
               break;
            default:
               exists = false;
         }

         if (!exists) {
            idParent = null;
         }
      }

      let id_biro = null;
      let id_lembaga = null;
      let id_upt = null;
      let id_fakultas = null;
      let id_sub_unit = null;

      if (levelUnit && idParent) {
         switch (levelUnit) {
            case "biro":
               id_biro = idParent;
               break;
            case "lembaga":
               id_lembaga = idParent;
               break;
            case "upt":
               id_upt = idParent;
               break;
            case "fakultas":
               id_fakultas = idParent;
               break;
            case "sub_unit":
               id_sub_unit = idParent;
               break;
         }
      }

      const newData = await prisma.tb_pengguna.create({
         data: {
            username,
            level_unit: levelUnit,
            id_roles: Number.parseInt(id_roles),
         },
      });

      if (Number.parseInt(id_roles) === 3) {
         const newDataPenggunaRole = await prisma.tb_pengguna_role.create({
            data: {
               id_pengguna: newData.id,
               id_biro,
               id_lembaga,
               id_upt,
               id_fakultas,
               id_sub_unit,
            },
         });

         logAudit(user_modified, "CREATE", "tb_pengguna_role", req.ip, null, { ...newDataPenggunaRole });
      }

      logAudit(user_modified, "CREATE", "tb_pengguna", req.ip, null, { ...newData });

      return res.json({ status: true, message: "Pengguna berhasil disimpan", split_id_parent, length: split_id_parent.length });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { user_modified } = req.body;

      const oldData = await prisma.tb_pengguna.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Pengguna tidak ditemukan" });
      }

      const oldDataRole = await prisma.tb_pengguna_role.findUnique({
         where: { id_pengguna: Number.parseInt(id) },
      });

      if (oldDataRole) {
         logAudit(user_modified, "DELETE", "tb_pengguna_role", req.ip, { ...oldDataRole }, null);
      }

      await prisma.tb_pengguna.delete({
         where: { id: Number.parseInt(id) },
      });

      logAudit(user_modified, "DELETE", "tb_pengguna", req.ip, { ...oldData }, null);

      return res.json({ status: true, message: "Pengguna berhasil dihapus" });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

module.exports = router;
