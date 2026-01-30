import { FastifyPluginAsync } from "fastify";
import createGetOneResponse from "../../../helpers/create.getOne.response";
import createListResponse from "../../../helpers/create.list.response";
import {
   errorResponseSchema,
   idParamsSchema,
   listResponseSchema,
   paginationQuerySchema,
   successResponseSchema,
} from "../../../schemas/common.schema";
import { create, update } from "./schema";

const unitSatuanRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/unit-satuan",
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
            prisma.tb_unit_satuan.findMany({
               take: limit,
               skip: page,
               select: {
                  id: true,
                  nama: true,
                  aktif: true,
                  deskripsi: true,
               },
            }),
            prisma.tb_unit_satuan.count(),
         ]);

         reply.send(createListResponse(data, page, limit, total));
      },
   );

   fastify.get(
      "/unit-satuan/:id",
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

         const data = await prisma.tb_unit_satuan.findUnique({
            where: { id },
            select: {
               id: true,
               nama: true,
               aktif: true,
            },
         });

         reply.send(createGetOneResponse(data));
      },
   );

   fastify.post(
      "/unit-satuan",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            body: create,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { nama, aktif, user_modified, deskripsi } = request.body as any;

         await prisma.tb_unit_satuan.create({
            data: {
               nama,
               aktif,
               user_modified,
               deskripsi,
               uploaded: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Unit satuan berhasil dibuat",
            refetchQuery: [["/referensi/unit-satuan", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.put(
      "/unit-satuan/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            params: idParamsSchema,
            body: update,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         const { nama, aktif, deskripsi, user_modified } = request.body as any;

         await prisma.tb_unit_satuan.update({
            where: { id },
            data: {
               nama,
               aktif,
               user_modified,
               deskripsi,
               modified: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Unit satuan berhasil diperbaharui",
            refetchQuery: [["/referensi/unit-satuan", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.delete(
      "/unit-satuan/:id",
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

         await prisma.tb_unit_satuan.delete({
            where: { id },
         });

         reply.send({
            success: true,
            message: "Unit satuan berhasil dihapus",
            refetchQuery: [["/referensi/unit-satuan", { limit: "25", offset: "0" }]],
         });
      },
   );
};

export default unitSatuanRoutes;
