import { FastifyPluginAsync } from "fastify";
import { idParamsSchema, paginationQuerySchema } from "../schemas/common.schema";
import { bulkCreateRabDetailSchema, createRabDetailSchema, updateRabDetailSchema } from "../schemas/rab-detail.schema";

const rabDetailRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   // GET - List RAB by usulan
   fastify.get(
      "/usulan/:id_usulan",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: {
               type: "object",
               required: ["id_usulan"],
               properties: {
                  id_usulan: { type: "integer" },
               },
            },
            querystring: paginationQuerySchema,
            tags: ["RAB Detail"],
            summary: "Get list RAB detail by usulan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id_usulan } = request.params as { id_usulan: number };
         const { page = 1, limit = 50 } = request.query as any;

         const skip = (page - 1) * limit;

         const [data, total] = await Promise.all([
            prisma.tb_rab_detail.findMany({
               where: { id_usulan },
               skip,
               take: limit,
               orderBy: { id: "asc" },
               include: {
                  tb_unit_satuan: true,
                  tb_rab_detail_perubahan: true,
               },
            }),
            prisma.tb_rab_detail.count({ where: { id_usulan } }),
         ]);

         // Calculate totals
         const totalBiaya = data.reduce((sum, item) => sum + Number(item.total_biaya || 0), 0);

         return reply.send({
            success: true,
            message: "Data RAB detail berhasil diambil",
            data,
            summary: {
               totalItems: total,
               totalBiaya,
            },
            meta: {
               page,
               limit,
               total,
               totalPages: Math.ceil(total / limit),
            },
         });
      },
   );

   // GET - Detail RAB by ID
   fastify.get(
      "/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: idParamsSchema,
            tags: ["RAB Detail"],
            summary: "Get detail RAB",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };

         const data = await prisma.tb_rab_detail.findUnique({
            where: { id },
            include: {
               tb_unit_satuan: true,
               tb_usulan_kegiatan: true,
               tb_rab_detail_perubahan: true,
               tb_realisasi: true,
            },
         });

         if (!data) {
            return reply.status(404).send({
               success: false,
               message: "RAB detail tidak ditemukan",
            });
         }

         return reply.send({
            success: true,
            message: "Detail RAB berhasil diambil",
            data,
         });
      },
   );

   // POST - Create RAB detail
   fastify.post(
      "/",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: createRabDetailSchema,
            tags: ["RAB Detail"],
            summary: "Create RAB detail baru",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         // Validate usulan exists and editable
         const usulan = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id: body.id_usulan },
         });

         if (!usulan) {
            return reply.status(400).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
               errors: [{ field: "id_usulan", message: "ID usulan tidak valid" }],
            });
         }

         if (!["draft", "revision"].includes(usulan.status_usulan || "")) {
            return reply.status(400).send({
               success: false,
               message: "Usulan tidak dapat diubah",
               errors: [{ field: "id_usulan", message: `Status ${usulan.status_usulan} tidak dapat diubah` }],
            });
         }

         // Validate satuan exists
         const satuan = await prisma.tb_unit_satuan.findUnique({
            where: { id: body.id_satuan },
         });

         if (!satuan) {
            return reply.status(400).send({
               success: false,
               message: "Satuan tidak ditemukan",
               errors: [{ field: "id_satuan", message: "ID satuan tidak valid" }],
            });
         }

         const totalBiaya = body.qty * body.harga_satuan;

         const data = await prisma.tb_rab_detail.create({
            data: {
               id_usulan: body.id_usulan,
               uraian_biaya: body.uraian_biaya,
               qty: Number(body.qty),
               id_satuan: body.id_satuan,
               harga_satuan: Number(body.harga_satuan),
               total_biaya: Number(totalBiaya),
               catatan: body.catatan,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
            include: {
               tb_unit_satuan: true,
            },
         });

         // Update total anggaran usulan
         await updateUsulanTotalAnggaran(prisma, body.id_usulan);

         return reply.status(201).send({
            success: true,
            message: "RAB detail berhasil dibuat",
            data,
         });
      },
   );

   // POST - Bulk create RAB detail
   fastify.post(
      "/bulk",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: bulkCreateRabDetailSchema,
            tags: ["RAB Detail"],
            summary: "Bulk create RAB detail",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         // Validate usulan
         const usulan = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id: body.id_usulan },
         });

         if (!usulan) {
            return reply.status(400).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
               errors: [{ field: "id_usulan", message: "ID usulan tidak valid" }],
            });
         }

         if (!["draft", "revision"].includes(usulan.status_usulan || "")) {
            return reply.status(400).send({
               success: false,
               message: "Usulan tidak dapat diubah",
            });
         }

         const items = body.items.map((item: any) => ({
            id_usulan: body.id_usulan,
            uraian_biaya: item.uraian_biaya,
            qty: Number(item.qty),
            id_satuan: item.id_satuan,
            harga_satuan: Number(item.harga_satuan),
            total_biaya: Number(item.qty * item.harga_satuan),
            catatan: item.catatan,
            user_modified: user.preferred_username,
            uploaded: new Date(),
            modified: new Date(),
         }));

         const result = await prisma.tb_rab_detail.createMany({
            data: items,
         });

         // Update total anggaran
         await updateUsulanTotalAnggaran(prisma, body.id_usulan);

         return reply.status(201).send({
            success: true,
            message: `${result.count} RAB detail berhasil dibuat`,
            data: { count: result.count },
         });
      },
   );

   // PUT - Update RAB detail
   fastify.put(
      "/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: idParamsSchema,
            body: updateRabDetailSchema,
            tags: ["RAB Detail"],
            summary: "Update RAB detail",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         const body = request.body as any;
         const user = request.user!;

         const existing = await prisma.tb_rab_detail.findUnique({
            where: { id },
            include: { tb_usulan_kegiatan: true },
         });

         if (!existing) {
            return reply.status(404).send({
               success: false,
               message: "RAB detail tidak ditemukan",
            });
         }

         if (!["draft", "revision"].includes(existing.tb_usulan_kegiatan?.status_usulan || "")) {
            return reply.status(400).send({
               success: false,
               message: "RAB tidak dapat diubah karena status usulan",
            });
         }

         const qty = body.qty === undefined ? Number(existing.qty) : body.qty;
         const hargaSatuan = body.harga_satuan === undefined ? Number(existing.harga_satuan) : body.harga_satuan;
         const totalBiaya = qty * hargaSatuan;

         const data = await prisma.tb_rab_detail.update({
            where: { id },
            data: {
               uraian_biaya: body.uraian_biaya,
               qty: body.qty === undefined ? undefined : Number(body.qty),
               id_satuan: body.id_satuan,
               harga_satuan: body.harga_satuan === undefined ? undefined : Number(body.harga_satuan),
               total_biaya: Number(totalBiaya),
               catatan: body.catatan,
               user_modified: user.preferred_username,
               modified: new Date(),
            },
            include: {
               tb_unit_satuan: true,
            },
         });

         // Update total anggaran
         if (existing.id_usulan) {
            await updateUsulanTotalAnggaran(prisma, existing.id_usulan);
         }

         return reply.send({
            success: true,
            message: "RAB detail berhasil diperbarui",
            data,
         });
      },
   );

   // DELETE - Hapus RAB detail
   fastify.delete(
      "/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: idParamsSchema,
            tags: ["RAB Detail"],
            summary: "Hapus RAB detail",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };

         const existing = await prisma.tb_rab_detail.findUnique({
            where: { id },
            include: { tb_usulan_kegiatan: true },
         });

         if (!existing) {
            return reply.status(404).send({
               success: false,
               message: "RAB detail tidak ditemukan",
            });
         }

         if (!["draft", "revision"].includes(existing.tb_usulan_kegiatan?.status_usulan || "")) {
            return reply.status(400).send({
               success: false,
               message: "RAB tidak dapat dihapus karena status usulan",
            });
         }

         await prisma.tb_rab_detail.delete({
            where: { id },
         });

         // Update total anggaran
         if (existing.id_usulan) {
            await updateUsulanTotalAnggaran(prisma, existing.id_usulan);
         }

         return reply.send({
            success: true,
            message: "RAB detail berhasil dihapus",
         });
      },
   );
};

// Helper function to update usulan total anggaran
async function updateUsulanTotalAnggaran(prisma: any, id_usulan: number) {
   const rabDetails = await prisma.tb_rab_detail.findMany({
      where: { id_usulan },
   });

   const totalAnggaran = rabDetails.reduce((sum: number, item: any) => {
      return sum + Number(item.total_biaya || 0);
   }, 0);

   await prisma.tb_usulan_kegiatan.update({
      where: { id: id_usulan },
      data: {
         total_anggaran: Number(totalAnggaran),
         modified: new Date(),
      },
   });
}

export default rabDetailRoutes;
