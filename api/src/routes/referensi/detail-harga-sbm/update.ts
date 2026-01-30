import { FastifyPluginAsync } from "fastify";
import { errorResponseSchema, idParamsSchema, successResponseSchema } from "../../../schemas/common.schema";
import { update } from "./schema";

const updateRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.put(
      "/detail-harga-sbm/:id",
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
         const {
            id_standar_biaya,
            tahun_anggaran,
            harga_satuan,
            id_satuan,
            tanggal_mulai_efektif,
            tanggal_akhir_efektif,
            status_validasi,
            user_modified,
         } = request.body as any;

         await prisma.tb_detail_harga_sbm.update({
            where: { id },
            data: {
               id_standar_biaya,
               tahun_anggaran,
               harga_satuan,
               id_satuan,
               tanggal_mulai_efektif: new Date(tanggal_mulai_efektif),
               tanggal_akhir_efektif: new Date(tanggal_akhir_efektif),
               status_validasi,
               user_modified,
               modified: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Detail harga SBM berhasil diperbaharui",
            refetchQuery: [["/referensi/detail-harga-sbm", { limit: "25", offset: "0" }]],
         });
      },
   );
};
export default updateRoutes;
