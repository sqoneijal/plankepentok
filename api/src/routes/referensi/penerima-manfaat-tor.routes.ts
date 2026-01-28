import { FastifyPluginAsync } from "fastify";
import createGetOneResponse from "../../helpers/create.getOne.response";
import createListResponse from "../../helpers/create.list.response";
import { errorResponseSchema, idParamsSchema, listResponseSchema, paginationQuerySchema, successResponseSchema } from "../../schemas/common.schema";
import { createJenisKeluaranTorSchema } from "../../schemas/referensi/jenis-keluaran-tor.schema";
import { createPenerimaManfaatTorSchema } from "../../schemas/referensi/penerima-manfaat-tor.schema";

const penerimaManfaatTorRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/penerima-manfaat-tor",
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
            prisma.tb_mst_penerima_manfaat_tor.findMany({
               take: limit,
               skip: page,
               select: {
                  id: true,
                  nama: true,
                  keterangan: true,
               },
            }),
            prisma.tb_mst_penerima_manfaat_tor.count(),
         ]);

         reply.send(createListResponse(data, page, limit, total));
      },
   );

   fastify.get(
      "/penerima-manfaat-tor/:id",
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

         const data = await prisma.tb_mst_penerima_manfaat_tor.findUnique({
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
      "/penerima-manfaat-tor",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            body: createPenerimaManfaatTorSchema,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { nama, keterangan, user_modified } = request.body as any;

         await prisma.tb_mst_penerima_manfaat_tor.create({
            data: {
               nama,
               keterangan,
               user_modified,
               uploaded: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Penerima manfaat TOR berhasil dibuat",
            refetchQuery: [["/referensi/penerima-manfaat-tor", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.put(
      "/penerima-manfaat-tor/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Referensi"],
            params: idParamsSchema,
            body: createJenisKeluaranTorSchema,
            response: {
               200: successResponseSchema,
               400: errorResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         const { nama, keterangan, user_modified } = request.body as any;

         await prisma.tb_mst_penerima_manfaat_tor.update({
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
            message: "Penerima manfaat TOR berhasil diperbaharui",
            refetchQuery: [["/referensi/penerima-manfaat-tor", { limit: "25", offset: "0" }]],
         });
      },
   );

   fastify.delete(
      "/penerima-manfaat-tor/:id",
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

         await prisma.tb_mst_penerima_manfaat_tor.delete({
            where: { id },
         });

         reply.send({
            success: true,
            message: "Penerima manfaat TOR berhasil dihapus",
            refetchQuery: [["/referensi/penerima-manfaat-tor", { limit: "25", offset: "0" }]],
         });
      },
   );
};

export default penerimaManfaatTorRoutes;
