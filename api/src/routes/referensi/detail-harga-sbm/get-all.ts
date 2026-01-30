import { FastifyPluginAsync } from "fastify";
import createListResponse from "../../../helpers/create.list.response";
import { errorResponseSchema, listResponseSchema, paginationQuerySchema } from "../../../schemas/common.schema";

const getAllRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get(
      "/detail-harga-sbm",
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
            prisma.tb_detail_harga_sbm.findMany({
               take: limit,
               skip: page,
               select: {
                  id: true,
                  tahun_anggaran: true,
                  harga_satuan: true,
                  tanggal_mulai_efektif: true,
                  tanggal_akhir_efektif: true,
                  status_validasi: true,
                  standar_biaya_master: {
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
                        aktif: true,
                        deskripsi: true,
                     },
                  },
               },
            }),
            prisma.tb_detail_harga_sbm.count(),
         ]);

         reply.send(createListResponse(data, page, limit, total));
      },
   );
};
export default getAllRoutes;
