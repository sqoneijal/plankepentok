import { FastifyPluginAsync } from "fastify";
import createGetOneResponse from "../../../helpers/create.getOne.response";
import createListResponse from "../../../helpers/create.list.response";
import createSubmitResponse from "../../../helpers/create.submit.response";
import {
   errorResponseSchema,
   idParamsSchema,
   listResponseSchema,
   paginationQuerySchema,
   successResponseSchema,
} from "../../../schemas/common.schema";
import { create, update } from "./schema";

const kategoriSBMRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/kategori-sbm",
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
            prisma.tb_kategori_sbm.findMany({
               take: limit,
               skip: page,
               select: {
                  id: true,
                  nama: true,
                  deskripsi: true,
                  kode: true,
               },
            }),
            prisma.tb_kategori_sbm.count(),
         ]);

         reply.send(createListResponse(data, page, limit, total));
      },
   );

   fastify.get(
      "/kategori-sbm/:id",
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

         const data = await prisma.tb_kategori_sbm.findUnique({
            where: { id },
            select: {
               id: true,
               nama: true,
               kode: true,
               deskripsi: true,
            },
         });

         reply.send(createGetOneResponse(data));
      },
   );

   fastify.post(
      "/kategori-sbm",
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
         const { nama, kode, user_modified, deskripsi } = request.body as any;

         await prisma.tb_kategori_sbm.create({
            data: {
               nama,
               kode,
               user_modified,
               deskripsi,
               uploaded: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Kategori SBM berhasil dibuat",
            refetchQuery: [["/referensi/kategori-sbm", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.put(
      "/kategori-sbm/:id",
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
         const { nama, kode, deskripsi, user_modified } = request.body as any;

         try {
            await prisma.tb_kategori_sbm.update({
               where: { id },
               data: {
                  nama,
                  kode,
                  user_modified,
                  deskripsi,
                  modified: new Date(),
               },
            });

            reply.send({
               success: true,
               message: "Kategori SBM berhasil diperbaharui",
               refetchQuery: [["/referensi/kategori-sbm", { limit: "25", offset: "0" }]],
            });
         } catch (err: any) {
            if (err.code === "P2002") {
               return reply.status(400).send(
                  createSubmitResponse(false, "Validasi Gagal", {
                     kode: "Kode kategori sudah digunakan",
                  }),
               );
            }

            throw err;
         }
      },
   );

   fastify.delete(
      "/kategori-sbm/:id",
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

         await prisma.tb_kategori_sbm.delete({
            where: { id },
         });

         reply.send({
            success: true,
            message: "Kategori SBM berhasil dihapus",
            refetchQuery: [["/referensi/kategori-sbm", { limit: "25", offset: "0" }]],
         });
      },
   );
};

export default kategoriSBMRoutes;
