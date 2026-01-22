import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../lib/prisma";

export default async function pengaturan(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
   fastify.get(
      "/pengaturan",
      {
         preHandler: [fastify.authenticate],
      },
      async (request) => {
         const { limit = 25, offset = 0 } = request.query as {
            limit?: number;
            offset?: number;
         };

         const total = await prisma.tb_pengaturan.count();
         const results = await prisma.tb_pengaturan.findMany({
            orderBy: { tahun_anggaran: "desc" },
            take: Number(limit),
            skip: Number(offset),
         });

         return { results, total };
      },
   );

   fastify.post<{
      Body: {
         tahun_anggaran: number;
         total_pagu: string;
         is_aktif: boolean;
         user_modified: string;
      };
   }>(
      "/pengaturan",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: {
               type: "object",
               required: ["tahun_anggaran", "total_pagu", "is_aktif"],
               properties: {
                  tahun_anggaran: {
                     type: "integer",
                     minimum: 2000,
                     errorMessage: {
                        type: "Tahun anggaran harus angka",
                        minimum: "Tahun anggaran minimal 2000",
                     },
                  },
                  total_pagu: {
                     type: "string",
                     pattern: "^[0-9.]+$",
                     minLength: 1,
                     errorMessage: {
                        pattern: "Total pagu hanya boleh angka dan titik",
                        minLength: "Total pagu wajib diisi",
                     },
                  },
                  is_aktif: {
                     type: "boolean",
                     errorMessage: {
                        type: "Status harus boolean",
                     },
                  },
               },
               errorMessage: {
                  required: {
                     tahun_anggaran: "Tahun anggaran wajib diisi",
                     total_pagu: "Total pagu wajib diisi",
                     is_aktif: "Status wajib diisi",
                  },
               },
            },
         },
      },
      async (request, reply) => {
         const { tahun_anggaran, total_pagu, is_aktif, user_modified } = request.body;

         /**
          * Convert total_pagu ke BigInt
          */
         const paguBigInt = BigInt(total_pagu.split(".").join(""));

         await prisma.tb_pengaturan.create({
            data: {
               tahun_anggaran,
               total_pagu: paguBigInt.toString(),
               is_aktif,
               user_modified,
            },
         });

         reply.send({
            status: true,
            message: "Data berhasil ditambahkan",
         });
      },
   );

   fastify.get<{
      Params: {
         id: string;
      };
   }>(
      "/pengaturan/:id",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { id } = request.params;

         const results = await prisma.tb_pengaturan.findUnique({
            where: { id: Number(id) },
         });

         reply.send({ status: true, results });
      },
   );

   fastify.put<{
      Params: { id: string };
      Body: {
         tahun_anggaran: number;
         total_pagu: string;
         is_aktif: boolean;
         user_modified: string;
      };
   }>(
      "/pengaturan/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: {
               type: "object",
               required: ["tahun_anggaran", "total_pagu", "is_aktif"],
               properties: {
                  tahun_anggaran: {
                     type: "integer",
                     minimum: 2000,
                     errorMessage: {
                        type: "Tahun anggaran harus angka",
                        minimum: "Tahun anggaran minimal 2000",
                     },
                  },
                  total_pagu: {
                     type: "string",
                     pattern: "^[0-9.]+$",
                     minLength: 1,
                     errorMessage: {
                        pattern: "Total pagu hanya boleh angka dan titik",
                        minLength: "Total pagu wajib diisi",
                     },
                  },
                  is_aktif: {
                     type: "boolean",
                     errorMessage: {
                        type: "Status harus boolean",
                     },
                  },
               },
               errorMessage: {
                  required: {
                     tahun_anggaran: "Tahun anggaran wajib diisi",
                     total_pagu: "Total pagu wajib diisi",
                     is_aktif: "Status wajib diisi",
                  },
               },
            },
         },
      },
      async (request, reply) => {
         const { tahun_anggaran, total_pagu, is_aktif, user_modified } = request.body;
         const { id } = request.params;

         /**
          * Convert total_pagu ke BigInt
          */
         const paguBigInt = BigInt(total_pagu.split(".").join(""));

         await prisma.tb_pengaturan.update({
            where: { id: Number(id) },
            data: {
               tahun_anggaran,
               total_pagu: paguBigInt.toString(),
               is_aktif,
               user_modified,
            },
         });

         reply.send({
            status: true,
            message: "Data berhasil diperbaharui",
         });
      },
   );
}
