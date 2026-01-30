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

const volumeKeluaranTorRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/volume-keluaran-tor",
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
            prisma.tb_mst_volume_keluaran_tor.findMany({
               take: limit,
               skip: page,
               select: {
                  id: true,
                  nama: true,
                  keterangan: true,
               },
            }),
            prisma.tb_mst_volume_keluaran_tor.count(),
         ]);

         reply.send(createListResponse(data, page, limit, total));
      },
   );

   fastify.get(
      "/volume-keluaran-tor/:id",
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

         const data = await prisma.tb_mst_volume_keluaran_tor.findUnique({
            where: { id },
            select: {
               id: true,
               nama: true,
               keterangan: true,
            },
         });

         reply.send(createGetOneResponse(data));
      },
   );

   fastify.post(
      "/volume-keluaran-tor",
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
         const { nama, keterangan, user_modified } = request.body as any;

         await prisma.tb_mst_volume_keluaran_tor.create({
            data: {
               nama,
               keterangan,
               user_modified,
               uploaded: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Volume keluaran TOR berhasil dibuat",
            refetchQuery: [["/referensi/volume-keluaran-tor", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.put(
      "/volume-keluaran-tor/:id",
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
         const { nama, keterangan, user_modified } = request.body as any;

         await prisma.tb_mst_volume_keluaran_tor.update({
            where: { id },
            data: {
               nama,
               keterangan,
               user_modified,
               modified: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Volume keluaran TOR berhasil diperbaharui",
            refetchQuery: [["/referensi/volume-keluaran-tor", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.delete(
      "/volume-keluaran-tor/:id",
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

         await prisma.tb_mst_volume_keluaran_tor.delete({
            where: { id },
         });

         reply.send({
            success: true,
            message: "Volume keluaran TOR berhasil dihapus",
            refetchQuery: [["/referensi/volume-keluaran-tor", { limit: "25", offset: "0" }]],
         });
      },
   );
};

export default volumeKeluaranTorRoutes;
