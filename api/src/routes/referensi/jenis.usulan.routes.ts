import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../../lib/prisma";

export default async function jenisUsulanRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
   fastify.get(
      "/jenis-usulan",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { limit = 25, offset = 0 } = request.query as {
            limit?: number;
            offset?: number;
         };

         const [results, total] = await Promise.all([
            prisma.tb_jenis_usulan.findMany({
               orderBy: { id: "desc" },
               take: Number(limit),
               skip: Number(offset),
               select: {
                  id: true,
                  nama: true,
                  is_aktif: true,
               },
            }),
            prisma.tb_jenis_usulan.count(),
         ]);

         reply.send({ results, total });
      },
   );

   fastify.post<{
      Body: {
         user_modified?: string;
         nama?: string;
         is_aktif?: string;
      };
   }>(
      "/jenis-usulan",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: {
               type: "object",
               required: ["nama"],
               properties: {
                  nama: {
                     type: "string",
                  },
               },
               errorMessage: {
                  required: {
                     nama: "Nama jenis wajib diisi",
                  },
               },
            },
         },
      },
      async (request, reply) => {
         const { nama, is_aktif, user_modified } = request.body;

         await prisma.tb_jenis_usulan.create({
            data: {
               nama,
               is_aktif: is_aktif === "true",
               uploaded: new Date(),
               user_modified,
            },
         });

         reply.send({
            status: true,
            message: "Data berhasil ditambahkan",
            refetchQuery: [["/referensi/jenis-usulan", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.get<{
      Params: {
         id?: number;
      };
   }>(
      "/jenis-usulan/:id",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { id } = request.params;

         const results = await prisma.tb_jenis_usulan.findUnique({
            where: { id: Number(id) },
         });

         reply.send({ results });
      },
   );

   fastify.put<{
      Params: { id?: number };
      Body: {
         user_modified?: string;
         is_aktif?: string;
         nama?: string;
      };
   }>(
      "/jenis-usulan/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: {
               type: "object",
               required: ["nama"],
               properties: {
                  nama: {
                     type: "string",
                  },
               },
               errorMessage: {
                  required: {
                     nama: "Nama jenis wajib diisi",
                  },
               },
            },
         },
      },
      async (request, reply) => {
         const { id } = request.params;
         const { nama, is_aktif, user_modified } = request.body;

         const oldData = await prisma.tb_jenis_usulan.findUnique({
            where: { id: Number(id) },
         });

         if (!oldData) {
            return reply.send({ status: false, message: "Data tidak ditemukan" });
         }

         await prisma.tb_jenis_usulan.update({
            where: { id: Number(id) },
            data: {
               nama,
               is_aktif: is_aktif === "true",
               modified: new Date(),
               user_modified,
            },
         });

         reply.send({
            status: true,
            message: "Data berhasil diperbaharui",
            refetchQuery: [["/referensi/jenis-usulan", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.delete<{
      Params: { id?: number };
      Body: {
         user_modified?: string;
      };
   }>(
      "/jenis-usulan/:id",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { id } = request.params;

         const oldData = await prisma.tb_jenis_usulan.findUnique({
            where: { id: Number(id) },
         });

         if (!oldData) {
            return reply.send({ status: false, message: "Data tidak ditemukan" });
         }

         await prisma.tb_jenis_usulan.delete({
            where: { id: Number(id) },
         });

         reply.send({
            status: true,
            message: "Data berhasil dihapus",
            refetchQuery: [["/referensi/jenis-usulan", { limit: "25", offset: "0" }]],
         });
      },
   );
}
