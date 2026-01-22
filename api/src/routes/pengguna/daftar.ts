import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../../lib/prisma";

export default async function daftarPenggunaRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
   fastify.get("/pengguna/daftar", async (request) => {
      const {
         limit = 25,
         offset = 0,
         search = "",
      } = request.query as {
         limit?: number;
         offset?: number;
         search?: string;
      };

      const query = {
         OR: [{ username: { contains: search, mode: "insensitive" } }, { fullname: { contains: search, mode: "insensitive" } }],
      };
      const where = search ? query : {};

      const [results, total] = await Promise.all([
         prisma.tb_pengguna.findMany({
            orderBy: { id: "desc" },
            take: Number(limit),
            skip: Number(offset),
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
         }),
         prisma.tb_pengguna.count({ where }),
      ]);

      return { results, total };
   });

   fastify.get("/pengguna/daftar/roles", async (request, reply) => {
      const results = await prisma.tb_roles.findMany();

      return reply.send({ results });
   });

   fastify.get("/pengguna/daftar/unit-kerja", async (request, reply) => {
      const [biro, lembaga, upt, fakultas] = await Promise.all([
         prisma.tb_biro_master.findMany({
            select: {
               id: true,
               nama: true,
               sub_unit: {
                  select: { id: true, nama: true },
               },
            },
         }),
         prisma.tb_lembaga_master.findMany({
            select: {
               id: true,
               nama: true,
               sub_unit: {
                  select: { id: true, nama: true },
               },
            },
         }),
         prisma.tb_upt_master.findMany({
            select: {
               id: true,
               nama: true,
               sub_unit: {
                  select: { id: true, nama: true },
               },
            },
         }),
         prisma.tb_fakultas_master.findMany({
            select: {
               id: true,
               nama: true,
               sub_unit: {
                  select: { id: true, nama: true },
               },
            },
         }),
      ]);

      const results = [
         ...biro.map((b) => ({ ...b, level: "biro" })),
         ...lembaga.map((b) => ({ ...b, level: "lembaga" })),
         ...upt.map((b) => ({ ...b, level: "upt" })),
         ...fakultas.map((b) => ({ ...b, level: "fakultas" })),
      ];

      return reply.send({ results });
   });

   fastify.post<{
      Body: {
         user_modified?: string;
         fullname?: string;
         id_parent?: string;
         id_roles?: string;
         username?: string;
      };
   }>(
      "/pengguna/daftar",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: {
               type: "object",
               required: ["id_roles", "username"],
               properties: {
                  id_roles: {
                     type: "string",
                  },
                  username: {
                     type: "string",
                  },
               },
               errorMessage: {
                  required: {
                     id_roles: "Role wajib dipilih",
                     username: "Operator wajib dipilih",
                  },
               },
            },
         },
      },
      async (request, reply) => {
         const { username, fullname, id_parent, id_roles, user_modified } = request.body;

         const checkDuplicate = await prisma.tb_pengguna.findUnique({
            where: {
               username_id_roles: {
                  username: String(username),
                  id_roles: Number(id_roles),
               },
            },
         });

         if (checkDuplicate) {
            return reply.send({
               status: false,
               message: "Validasi gagal",
               errors: {
                  username: "Operator sudah terdaftar",
               },
            });
         }

         const parseIdParent = (id_parent: string) => {
            const split_id_parent = id_parent ? id_parent.split("-") : [];
            const idParent = Number.parseInt(split_id_parent?.[0]) || null;
            const levelUnit = split_id_parent?.[1] || null;
            return { idParent, levelUnit, split_id_parent };
         };

         const validateUnitExistence = async (idParent: number, levelUnit: string) => {
            if (!idParent || !levelUnit) return null;

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

            return exists ? idParent : null;
         };

         const createUnitIds = (levelUnit: string, idParent: any) => {
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

         const { idParent, levelUnit, split_id_parent } = parseIdParent(String(id_parent));
         const validatedIdParent = await validateUnitExistence(Number(idParent), String(levelUnit));
         const unitIds = createUnitIds(String(levelUnit), validatedIdParent);

         const ROLE_OPERATOR = "3";

         const newData = await prisma.tb_pengguna.create({
            data: {
               username,
               level_unit: levelUnit,
               id_roles: Number(id_roles),
               fullname,
            },
         });

         if (Number(id_roles) === Number(ROLE_OPERATOR)) {
            await prisma.tb_pengguna_role.create({
               data: {
                  id_pengguna: newData.id,
                  ...unitIds,
               },
            });
         }

         return reply.send({
            status: true,
            message: "Pengguna berhasil ditambahkan",
            split_id_parent,
            length: split_id_parent.length,
            refetchQuery: [
               ["/pengguna/daftar", { limit: "25", offset: "0", search: "" }],
               [`/user-validate/${user_modified}`, {}],
            ],
         });
      },
   );

   fastify.delete<{
      Params: {
         id?: number;
      };
      Body: {
         user_modified?: string;
      };
   }>(
      "/pengguna/daftar/:id",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { id } = request.params;
         const { user_modified } = request.body;

         const oldData = await prisma.tb_pengguna.findUnique({
            where: { id: Number(id) },
         });

         if (!oldData) {
            return reply.send({ status: false, message: "Pengguna tidak ditemukan" });
         }

         await prisma.tb_pengguna_role.findUnique({
            where: { id_pengguna: Number(id) },
         });

         await prisma.tb_pengguna.delete({
            where: { id: Number(id) },
         });

         reply.send({
            status: true,
            message: "Pengguna berhasil dihapus",
            refetchQuery: [
               ["/pengguna/daftar", { limit: "25", offset: "0", search: "" }],
               [`/user-validate/${user_modified}`, {}],
            ],
         });
      },
   );
}
