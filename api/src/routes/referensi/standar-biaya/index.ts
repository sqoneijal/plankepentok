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

const standarBiayaRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/standar-biaya",
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
            prisma.tb_standar_biaya_master.findMany({
               take: limit,
               skip: page,
               select: {
                  id: true,
                  kode: true,
                  nama: true,
                  deskripsi: true,
                  kategori_sbm: {
                     select: {
                        id: true,
                        kode: true,
                        nama: true,
                        deskripsi: true,
                     },
                  },
                  unit_satuan: {
                     select: {
                        id: true,
                        nama: true,
                        deskripsi: true,
                        aktif: true,
                     },
                  },
               },
            }),
            prisma.tb_standar_biaya_master.count(),
         ]);

         reply.send(createListResponse(data, page, limit, total));
      },
   );

   fastify.get(
      "/standar-biaya/:id",
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

         const data = await prisma.tb_standar_biaya_master.findUnique({
            where: { id },
            select: {
               id: true,
               kode: true,
               nama: true,
               deskripsi: true,
               id_kategori: true,
               id_unit_satuan: true,
            },
         });

         reply.send(createGetOneResponse(data));
      },
   );

   fastify.post(
      "/standar-biaya",
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
         const { nama, kode, deskripsi, id_kategori, id_unit_satuan, user_modified } = request.body as any;

         await prisma.tb_standar_biaya_master.create({
            data: {
               kode,
               nama,
               deskripsi,
               id_kategori,
               id_unit_satuan,
               user_modified,
               uploaded: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Standar biaya berhasil dibuat",
            refetchQuery: [["/referensi/standar-biaya", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.put(
      "/standar-biaya/:id",
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
         const { nama, kode, user_modified, deskripsi, id_kategori, id_unit_satuan } = request.body as any;

         await prisma.tb_standar_biaya_master.update({
            where: { id },
            data: {
               kode,
               nama,
               deskripsi,
               id_kategori,
               id_unit_satuan,
               user_modified,
               modified: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Standar biaya berhasil diperbaharui",
            refetchQuery: [["/referensi/standar-biaya", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.delete(
      "/standar-biaya/:id",
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

         await prisma.tb_standar_biaya_master.delete({
            where: { id },
         });

         reply.send({
            success: true,
            message: "Standar biaya berhasil dihapus",
            refetchQuery: [["/referensi/standar-biaya", { limit: "25", offset: "0" }]],
         });
      },
   );
};

export default standarBiayaRoutes;
