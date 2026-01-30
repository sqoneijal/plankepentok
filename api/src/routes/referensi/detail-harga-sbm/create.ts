import { FastifyPluginAsync } from "fastify";
import { errorResponseSchema, successResponseSchema } from "../../../schemas/common.schema";
import { create } from "./schema";

const createRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.post(
      "/detail-harga-sbm",
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

         await prisma.tb_detail_harga_sbm.create({
            data: {
               id_standar_biaya,
               tahun_anggaran,
               harga_satuan,
               id_satuan,
               tanggal_mulai_efektif: new Date(tanggal_mulai_efektif),
               tanggal_akhir_efektif: new Date(tanggal_akhir_efektif),
               status_validasi,
               user_modified,
               uploaded: new Date(),
            },
         });

         reply.send({
            success: true,
            message: "Detail harga SBM berhasil dibuat",
            refetchQuery: [["/referensi/detail-harga-sbm", { limit: "25", offset: "0" }]],
         });
      },
   );
};
export default createRoutes;
