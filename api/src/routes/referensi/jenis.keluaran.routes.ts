import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../../lib/prisma";

export default async function jenisKeluaranTorRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
   fastify.get(
      "/jenis-keluaran-tor",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { limit = 25, offset = 0 } = request.query as {
            limit?: number;
            offset?: number;
         };

         const [results, total] = await Promise.all([
            prisma.tb_mst_jenis_keluaran_tor.findMany({
               orderBy: { id: "desc" },
               take: Number(limit),
               skip: Number(offset),
               select: {
                  id: true,
                  nama: true,
                  keterangan: true,
               },
            }),
            prisma.tb_mst_jenis_keluaran_tor.count(),
         ]);

         reply.send({ results, total });
      },
   );

   fastify.post<{
      Body: {
         user_modified?: string;
         keterangan?: string;
         nama?: string;
      };
   }>(
      "/jenis-keluaran-tor",
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
                     nama: "Nama jenis keluaran wajib diisi",
                  },
               },
            },
         },
      },
      async (request, reply) => {
         const { nama, keterangan, user_modified } = request.body;

         await prisma.tb_mst_jenis_keluaran_tor.create({
            data: {
               nama,
               keterangan,
               uploaded: new Date(),
               user_modified,
            },
         });

         reply.send({
            status: true,
            message: "Data berhasil ditambahkan",
            refetchQuery: [["/referensi/jenis-keluaran-tor", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.get<{
      Params: {
         id?: number;
      };
   }>(
      "/jenis-keluaran-tor/:id",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { id } = request.params;

         const results = await prisma.tb_mst_jenis_keluaran_tor.findUnique({
            where: { id: Number(id) },
         });

         reply.send({ results });
      },
   );

   fastify.put<{
      Params: { id?: number };
      Body: {
         user_modified?: string;
         keterangan?: string;
         nama?: string;
      };
   }>(
      "/jenis-keluaran-tor/:id",
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
                     nama: "Nama jenis keluaran wajib diisi",
                  },
               },
            },
         },
      },
      async (request, reply) => {
         const { id } = request.params;
         const { nama, keterangan, user_modified } = request.body;

         const oldData = await prisma.tb_mst_jenis_keluaran_tor.findUnique({
            where: { id: Number(id) },
         });

         if (!oldData) {
            return reply.send({ status: false, message: "Data tidak ditemukan" });
         }

         await prisma.tb_mst_jenis_keluaran_tor.update({
            where: { id: Number(id) },
            data: {
               nama,
               keterangan,
               modified: new Date(),
               user_modified,
            },
         });

         reply.send({
            status: true,
            message: "Data berhasil diperbaharui",
            refetchQuery: [["/referensi/jenis-keluaran-tor", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.delete<{
      Params: { id?: number };
      Body: {
         user_modified?: string;
      };
   }>(
      "/jenis-keluaran-tor/:id",
      {
         preHandler: [fastify.authenticate],
      },
      async (request, reply) => {
         const { id } = request.params;

         const oldData = await prisma.tb_mst_jenis_keluaran_tor.findUnique({
            where: { id: Number(id) },
         });

         if (!oldData) {
            return reply.send({ status: false, message: "Data tidak ditemukan" });
         }

         await prisma.tb_mst_jenis_keluaran_tor.delete({
            where: { id: Number(id) },
         });

         reply.send({
            status: true,
            message: "Data berhasil dihapus",
            refetchQuery: [["/referensi/jenis-keluaran-tor", { limit: "25", offset: "0" }]],
         });
      },
   );
}
