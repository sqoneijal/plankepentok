import { FastifyPluginAsync } from "fastify";
import createGetOneResponse from "../../../helpers/create.getOne.response";
import { formatDateFields } from "../../../helpers/formatDateFields";
import { errorResponseSchema, idParamsSchema, successResponseSchema } from "../../../schemas/common.schema";

const getOneRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/detail-harga-sbm/:id",
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

         const data = await prisma.tb_detail_harga_sbm.findUnique({
            where: { id },
            select: {
               id: true,
               id_standar_biaya: true,
               tahun_anggaran: true,
               harga_satuan: true,
               id_satuan: true,
               tanggal_mulai_efektif: true,
               tanggal_akhir_efektif: true,
               status_validasi: true,
            },
         });

         const formattedData = data ? formatDateFields(data) : null;

         reply.send(createGetOneResponse(formattedData));
      },
   );
};
export default getOneRoutes;
