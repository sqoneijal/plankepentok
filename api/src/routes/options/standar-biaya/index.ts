import { FastifyPluginAsync } from "fastify";
import createListResponse from "../../../helpers/create.list.response";
import { listResponseSchema } from "../../../schemas/common.schema";

const standarBiayaOptions: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/standar-biaya",
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
         const data = await prisma.tb_standar_biaya_master.findMany({
            orderBy: {
               kode: "asc",
            },
            select: {
               id: true,
               kode: true,
               nama: true,
               deskripsi: true,
            },
         });

         reply.send(createListResponse(data));
      },
   );
};

export default standarBiayaOptions;
