import { FastifyPluginAsync } from "fastify";
import { errorResponseSchema, idParamsSchema, successResponseSchema } from "../../../schemas/common.schema";

const deleteRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.delete(
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

         await prisma.tb_detail_harga_sbm.delete({
            where: { id },
         });

         reply.send({
            success: true,
            message: "Detail harga SBM berhasil dihapus",
            refetchQuery: [["/referensi/detail-harga-sbm", { limit: "25", offset: "0" }]],
         });
      },
   );
};
export default deleteRoutes;
