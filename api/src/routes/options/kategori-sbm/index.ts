import { FastifyPluginAsync } from "fastify";
import createListResponse from "../../../helpers/create.list.response";
import { listResponseSchema } from "../../../schemas/common.schema";

const kategoriSBMOptions: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/kategori-sbm",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Options"],
            response: {
               200: listResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const data = await prisma.tb_kategori_sbm.findMany({
            orderBy: {
               kode: "asc",
            },
            select: {
               id: true,
               nama: true,
               kode: true,
               deskripsi: true,
            },
         });

         reply.send(createListResponse(data));
      },
   );

   fastify.get(
      "/unit-satuan",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["Options"],
            response: {
               200: listResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const data = await prisma.tb_unit_satuan.findMany({
            orderBy: {
               nama: "asc",
            },
            where: { aktif: "AKTIF" },
            select: {
               id: true,
               nama: true,
               deskripsi: true,
            },
         });

         reply.send(createListResponse(data));
      },
   );
};

export default kategoriSBMOptions;
