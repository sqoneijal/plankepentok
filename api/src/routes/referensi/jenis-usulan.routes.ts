import { FastifyPluginAsync } from "fastify";
import createGetOneResponse from "../../helpers/create.getOne.response";
import createListResponse from "../../helpers/create.list.response";
import { errorResponseSchema, idParamsSchema, listResponseSchema, paginationQuerySchema, successResponseSchema } from "../../schemas/common.schema";
import { createJenisUsulanSchema } from "../../schemas/referensi/jenis-usulan.schema";

const jenisUsulanRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/jenis-usulan",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            querystring: paginationQuerySchema,
            response: {
               200: listResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { page = 0, limit = 25 } = request.query as any;

         const [data, total] = await Promise.all([
            prisma.tb_jenis_usulan.findMany({
               take: limit,
               skip: page,
               select: {
                  id: true,
                  nama: true,
                  is_aktif: true,
               },
            }),
            prisma.tb_jenis_usulan.count(),
         ]);

         reply.send(createListResponse(data, page, limit, total));
      },
   );

   fastify.get(
      "/jenis-usulan/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            params: idParamsSchema,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };

         const data = await prisma.tb_jenis_usulan.findUnique({
            where: { id },
            select: {
               id: true,
               nama: true,
               is_aktif: true,
            },
         });

         reply.send(createGetOneResponse(data));
      },
   );

   fastify.post(
      "/jenis-usulan",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            body: createJenisUsulanSchema,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { nama, is_aktif, user_modified } = request.body as any;

         await prisma.tb_jenis_usulan.create({
            data: {
               nama,
               is_aktif,
               user_modified,
               uploaded: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Jenis keluaran TOR berhasil dibuat",
            refetchQuery: [["/referensi/jenis-usulan", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.put(
      "/jenis-usulan/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            params: idParamsSchema,
            body: createJenisUsulanSchema,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         const { nama, is_aktif, user_modified } = request.body as any;

         await prisma.tb_jenis_usulan.update({
            where: { id },
            data: {
               nama,
               is_aktif,
               user_modified,
               modified: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Jenis keluaran TOR berhasil diperbaharui",
            refetchQuery: [["/referensi/jenis-usulan", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.delete(
      "/jenis-usulan/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            params: idParamsSchema,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };

         await prisma.tb_jenis_usulan.delete({
            where: { id },
         });

         reply.send({
            success: true,
            message: "Jenis keluaran TOR berhasil dihapus",
            refetchQuery: [["/referensi/jenis-usulan", { limit: "25", offset: "0" }]],
         });
      },
   );
};

export default jenisUsulanRoutes;
