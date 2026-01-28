import { FastifyPluginAsync } from "fastify";
import { paginationQuerySchema } from "../schemas/common.schema";
import { approveUsulanSchema, rejectUsulanSchema, revisionUsulanSchema } from "../schemas/verifikasi.schema";

const verifikasiRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   // GET - List usulan untuk diverifikasi
   fastify.get(
      "/queue",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["verifikator", "admin"])],
         schema: {
            querystring: {
               type: "object",
               properties: {
                  ...paginationQuerySchema.properties,
                  tahap: { type: "integer", minimum: 1 },
                  id_jenis_usulan: { type: "integer" },
               },
            },
            tags: ["Verifikasi"],
            summary: "Get queue usulan untuk verifikasi",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { page = 1, limit = 10, tahap, id_jenis_usulan } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = {
            status_usulan: "submitted",
         };

         if (tahap) {
            where.tahap_verifikasi = Number(tahap);
         }

         if (id_jenis_usulan) {
            where.id_jenis_usulan = id_jenis_usulan;
         }

         const [data, total] = await Promise.all([
            prisma.tb_usulan_kegiatan.findMany({
               where,
               skip,
               take: limit,
               orderBy: { tanggal_submit: "asc" },
               include: {
                  tb_jenis_usulan: true,
                  tb_pengaturan: true,
                  tb_unit_pengusul: {
                     include: {
                        tb_biro_master: true,
                        tb_fakultas_master: true,
                        tb_lembaga_master: true,
                        tb_upt_master: true,
                     },
                  },
                  tb_pengguna: {
                     select: { fullname: true },
                  },
               },
            }),
            prisma.tb_usulan_kegiatan.count({ where }),
         ]);

         return reply.send({
            success: true,
            message: "Queue verifikasi berhasil diambil",
            data,
            meta: {
               page,
               limit,
               total,
               totalPages: Math.ceil(total / limit),
            },
         });
      },
   );

   // POST - Approve usulan
   fastify.post(
      "/approve",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["verifikator", "admin"])],
         schema: {
            body: approveUsulanSchema,
            tags: ["Verifikasi"],
            summary: "Approve usulan kegiatan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const usulan = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id: body.id_usulan_kegiatan },
            include: { tb_jenis_usulan: true },
         });

         if (!usulan) {
            return reply.status(404).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
            });
         }

         if (usulan.status_usulan !== "submitted") {
            return reply.status(400).send({
               success: false,
               message: "Usulan tidak dalam status submitted",
            });
         }

         // Get verifikator
         const pengguna = await prisma.tb_pengguna.findFirst({
            where: { username: user.preferred_username },
         });

         // Create verifikasi record
         await prisma.tb_verifikasi.create({
            data: {
               id_pengguna: pengguna?.id,
               id_usulan_kegiatan: body.id_usulan_kegiatan,
               status: "approved",
               catatan: body.catatan,
               tahap: usulan.tahap_verifikasi,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         // Create log
         await prisma.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: body.id_usulan_kegiatan,
               tahap: usulan.tahap_verifikasi,
               verifikator_id: pengguna?.id,
               aksi: "approve",
               catatan: body.catatan || "Usulan disetujui",
               waktu: new Date(),
            },
         });

         // Update usulan status
         const updatedUsulan = await prisma.tb_usulan_kegiatan.update({
            where: { id: body.id_usulan_kegiatan },
            data: {
               status_usulan: "approved",
               user_modified: user.preferred_username,
               modified: new Date(),
            },
         });

         // Create anggaran disetujui
         if (body.jumlah_disetujui !== undefined) {
            await prisma.tb_anggaran_disetujui.upsert({
               where: { id_usulan: body.id_usulan_kegiatan },
               update: {
                  jumlah: Number(body.jumlah_disetujui),
               },
               create: {
                  id_usulan: body.id_usulan_kegiatan,
                  jumlah: Number(body.jumlah_disetujui),
               },
            });
         }

         return reply.send({
            success: true,
            message: "Usulan berhasil disetujui",
            data: updatedUsulan,
         });
      },
   );

   // POST - Reject usulan
   fastify.post(
      "/reject",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["verifikator", "admin"])],
         schema: {
            body: rejectUsulanSchema,
            tags: ["Verifikasi"],
            summary: "Reject usulan kegiatan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const usulan = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id: body.id_usulan_kegiatan },
         });

         if (!usulan) {
            return reply.status(404).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
            });
         }

         if (usulan.status_usulan !== "submitted") {
            return reply.status(400).send({
               success: false,
               message: "Usulan tidak dalam status submitted",
            });
         }

         const pengguna = await prisma.tb_pengguna.findFirst({
            where: { username: user.preferred_username },
         });

         // Create penolakan record
         await prisma.tb_penolakan_usulan.create({
            data: {
               id_usulan_kegiatan: body.id_usulan_kegiatan,
               catatan: body.catatan,
               user_modified: user.preferred_username,
               uploaded: new Date(),
            },
         });

         // Create verifikasi record
         await prisma.tb_verifikasi.create({
            data: {
               id_pengguna: pengguna?.id,
               id_usulan_kegiatan: body.id_usulan_kegiatan,
               status: "rejected",
               catatan: body.catatan,
               tahap: usulan.tahap_verifikasi,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         // Create log
         await prisma.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: body.id_usulan_kegiatan,
               tahap: usulan.tahap_verifikasi,
               verifikator_id: pengguna?.id,
               aksi: "reject",
               catatan: body.catatan,
               waktu: new Date(),
            },
         });

         // Update status
         const updatedUsulan = await prisma.tb_usulan_kegiatan.update({
            where: { id: body.id_usulan_kegiatan },
            data: {
               status_usulan: "rejected",
               user_modified: user.preferred_username,
               modified: new Date(),
            },
         });

         return reply.send({
            success: true,
            message: "Usulan berhasil ditolak",
            data: updatedUsulan,
         });
      },
   );

   // POST - Request revision
   fastify.post(
      "/revision",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["verifikator", "admin"])],
         schema: {
            body: revisionUsulanSchema,
            tags: ["Verifikasi"],
            summary: "Request perbaikan usulan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const usulan = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id: body.id_usulan_kegiatan },
         });

         if (!usulan) {
            return reply.status(404).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
            });
         }

         if (usulan.status_usulan !== "submitted") {
            return reply.status(400).send({
               success: false,
               message: "Usulan tidak dalam status submitted",
            });
         }

         const pengguna = await prisma.tb_pengguna.findFirst({
            where: { username: user.preferred_username },
         });

         // Create perbaikan record
         await prisma.tb_perbaikan_usulan.create({
            data: {
               id_usulan_kegiatan: body.id_usulan_kegiatan,
               catatan: body.catatan,
               user_modified: user.preferred_username,
               uploaded: new Date(),
            },
         });

         // Create log
         await prisma.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: body.id_usulan_kegiatan,
               tahap: usulan.tahap_verifikasi,
               verifikator_id: pengguna?.id,
               aksi: "revision",
               catatan: body.catatan,
               waktu: new Date(),
            },
         });

         // Update status
         const updatedUsulan = await prisma.tb_usulan_kegiatan.update({
            where: { id: body.id_usulan_kegiatan },
            data: {
               status_usulan: "revision",
               catatan_perbaikan: body.catatan,
               user_modified: user.preferred_username,
               modified: new Date(),
            },
         });

         return reply.send({
            success: true,
            message: "Usulan dikembalikan untuk perbaikan",
            data: updatedUsulan,
         });
      },
   );

   // GET - Log verifikasi by usulan
   fastify.get(
      "/logs/:id_usulan",
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
            tags: ["Verifikasi"],
            summary: "Get log verifikasi by usulan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id_usulan } = request.params as { id_usulan: number };

         const data = await prisma.tb_log_verifikasi.findMany({
            where: { id_usulan_kegiatan: id_usulan },
            include: {
               tb_pengguna: {
                  select: { id: true, fullname: true, username: true },
               },
            },
            orderBy: { waktu: "desc" },
         });

         return reply.send({
            success: true,
            message: "Log verifikasi berhasil diambil",
            data,
         });
      },
   );
};

export default verifikasiRoutes;
