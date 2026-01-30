import { FastifyPluginAsync } from "fastify";
import createListResponse from "../../../helpers/create.list.response";
import { listResponseSchema } from "../../../schemas/common.schema";

const tahunAnggaranOptions: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/tahun-anggaran",
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
         const data = await prisma.tb_pengaturan.findMany({
            orderBy: {
               tahun_anggaran: "desc",
            },
            select: {
               id: true,
               tahun_anggaran: true,
               total_pagu: true,
               realisasi: true,
               is_aktif: true,
            },
         });

         reply.send(createListResponse(data));
      },
   );
};

export default tahunAnggaranOptions;
