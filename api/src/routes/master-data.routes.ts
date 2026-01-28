// src/routes/master-data.routes.ts
import { FastifyPluginAsync } from "fastify";
import { idParamsSchema, paginationQuerySchema } from "../schemas/common.schema";
import {
   createBiroSchema,
   createFakultasSchema,
   createIkuSchema,
   createJenisUsulanSchema,
   createLembagaSchema,
   createPengaturanSchema,
   createUnitSatuanSchema,
   createUptSchema,
} from "../schemas/master-data.schema";

const masterDataRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   // ===================== BIRO =====================
   fastify.get(
      "/biro",
      {
         preHandler: [fastify.authenticate],
         schema: {
            querystring: paginationQuerySchema,
            tags: ["Master Data - Biro"],
         },
      },
      async (request, reply) => {
         const { page = 1, limit = 50, search } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = {};
         if (search) {
            where.nama = { contains: search, mode: "insensitive" };
         }

         const [data, total] = await Promise.all([
            prisma.tb_biro_master.findMany({ where, skip, take: limit, orderBy: { nama: "asc" } }),
            prisma.tb_biro_master.count({ where }),
         ]);

         return reply.send({
            success: true,
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
         });
      },
   );

   fastify.post(
      "/biro",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createBiroSchema, tags: ["Master Data - Biro"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_biro_master.create({
            data: {
               nama: body.nama,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "Biro berhasil dibuat", data });
      },
   );

   fastify.put(
      "/biro/:id",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { params: idParamsSchema, body: createBiroSchema, tags: ["Master Data - Biro"] },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_biro_master.update({
            where: { id },
            data: {
               nama: body.nama,
               user_modified: user.preferred_username,
               modified: new Date(),
            },
         });

         return reply.send({ success: true, message: "Biro berhasil diperbarui", data });
      },
   );

   fastify.delete(
      "/biro/:id",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { params: idParamsSchema, tags: ["Master Data - Biro"] },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         await prisma.tb_biro_master.delete({ where: { id } });
         return reply.send({ success: true, message: "Biro berhasil dihapus" });
      },
   );

   // ===================== FAKULTAS =====================
   fastify.get(
      "/fakultas",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - Fakultas"] },
      },
      async (request, reply) => {
         const { page = 1, limit = 50, search } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = {};
         if (search) {
            where.nama = { contains: search, mode: "insensitive" };
         }

         const [data, total] = await Promise.all([
            prisma.tb_fakultas_master.findMany({
               where,
               skip,
               take: limit,
               orderBy: { nama: "asc" },
               include: { prodi_master: true },
            }),
            prisma.tb_fakultas_master.count({ where }),
         ]);

         return reply.send({
            success: true,
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
         });
      },
   );

   fastify.post(
      "/fakultas",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createFakultasSchema, tags: ["Master Data - Fakultas"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_fakultas_master.create({
            data: {
               nama: body.nama,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "Fakultas berhasil dibuat", data });
      },
   );

   // ===================== LEMBAGA =====================
   fastify.get(
      "/lembaga",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - Lembaga"] },
      },
      async (request, reply) => {
         const { page = 1, limit = 50, search } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = {};
         if (search) {
            where.nama = { contains: search, mode: "insensitive" };
         }

         const [data, total] = await Promise.all([
            prisma.tb_lembaga_master.findMany({ where, skip, take: limit, orderBy: { nama: "asc" } }),
            prisma.tb_lembaga_master.count({ where }),
         ]);

         return reply.send({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      },
   );

   fastify.post(
      "/lembaga",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createLembagaSchema, tags: ["Master Data - Lembaga"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_lembaga_master.create({
            data: {
               nama: body.nama,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "Lembaga berhasil dibuat", data });
      },
   );

   // ===================== UPT =====================
   fastify.get(
      "/upt",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - UPT"] },
      },
      async (request, reply) => {
         const { page = 1, limit = 50, search } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = {};
         if (search) {
            where.nama = { contains: search, mode: "insensitive" };
         }

         const [data, total] = await Promise.all([
            prisma.tb_upt_master.findMany({ where, skip, take: limit, orderBy: { nama: "asc" } }),
            prisma.tb_upt_master.count({ where }),
         ]);

         return reply.send({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      },
   );

   fastify.post(
      "/upt",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createUptSchema, tags: ["Master Data - UPT"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_upt_master.create({
            data: {
               nama: body.nama,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "UPT berhasil dibuat", data });
      },
   );

   // ===================== UNIT SATUAN =====================
   fastify.get(
      "/unit-satuan",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - Unit Satuan"] },
      },
      async (request, reply) => {
         const { page = 1, limit = 100, search } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = { aktif: true };
         if (search) {
            where.nama = { contains: search, mode: "insensitive" };
         }

         const [data, total] = await Promise.all([
            prisma.tb_unit_satuan.findMany({ where, skip, take: limit, orderBy: { nama: "asc" } }),
            prisma.tb_unit_satuan.count({ where }),
         ]);

         return reply.send({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      },
   );

   fastify.post(
      "/unit-satuan",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createUnitSatuanSchema, tags: ["Master Data - Unit Satuan"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_unit_satuan.create({
            data: {
               nama: body.nama,
               deskripsi: body.deskripsi,
               aktif: body.aktif ?? true,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "Unit satuan berhasil dibuat", data });
      },
   );

   // ===================== JENIS USULAN =====================
   fastify.get(
      "/jenis-usulan",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - Jenis Usulan"] },
      },
      async (request, reply) => {
         const { page = 1, limit = 50 } = request.query as any;
         const skip = (page - 1) * limit;

         const where = { is_aktif: true };

         const [data, total] = await Promise.all([
            prisma.tb_jenis_usulan.findMany({ where, skip, take: limit, orderBy: { nama: "asc" } }),
            prisma.tb_jenis_usulan.count({ where }),
         ]);

         return reply.send({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      },
   );

   fastify.post(
      "/jenis-usulan",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createJenisUsulanSchema, tags: ["Master Data - Jenis Usulan"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_jenis_usulan.create({
            data: {
               nama: body.nama,
               is_aktif: body.is_aktif ?? true,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "Jenis usulan berhasil dibuat", data });
      },
   );

   // ===================== PENGATURAN =====================
   fastify.get(
      "/pengaturan",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - Pengaturan"] },
      },
      async (request, reply) => {
         const data = await prisma.tb_pengaturan.findMany({
            orderBy: { tahun_anggaran: "desc" },
         });

         return reply.send({ success: true, data });
      },
   );

   fastify.get(
      "/pengaturan/aktif",
      {
         preHandler: [fastify.authenticate],
         schema: { tags: ["Master Data - Pengaturan"] },
      },
      async (request, reply) => {
         const data = await prisma.tb_pengaturan.findFirst({
            where: { is_aktif: true },
            orderBy: { tahun_anggaran: "desc" },
         });

         return reply.send({ success: true, data });
      },
   );

   fastify.post(
      "/pengaturan",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createPengaturanSchema, tags: ["Master Data - Pengaturan"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         // Check if tahun already exists
         const existing = await prisma.tb_pengaturan.findUnique({
            where: { tahun_anggaran: Number(body.tahun_anggaran) },
         });

         if (existing) {
            return reply.status(400).send({
               success: false,
               message: "Tahun anggaran sudah ada",
               errors: [{ field: "tahun_anggaran", message: "Tahun anggaran sudah terdaftar" }],
            });
         }

         const data = await prisma.tb_pengaturan.create({
            data: {
               tahun_anggaran: Number(body.tahun_anggaran),
               total_pagu: body.total_pagu ? Number(body.total_pagu) : Number(0),
               is_aktif: body.is_aktif ?? true,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "Pengaturan berhasil dibuat", data });
      },
   );

   // ===================== IKU =====================
   fastify.get(
      "/iku",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - IKU"] },
      },
      async (request, reply) => {
         const { page = 1, limit = 50, search } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = {};
         if (search) {
            where.OR = [{ kode: { contains: search, mode: "insensitive" } }, { deskripsi: { contains: search, mode: "insensitive" } }];
         }

         const [data, total] = await Promise.all([
            prisma.tb_iku_master.findMany({ where, skip, take: limit, orderBy: { kode: "asc" } }),
            prisma.tb_iku_master.count({ where }),
         ]);

         return reply.send({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      },
   );

   fastify.post(
      "/iku",
      {
         preHandler: [fastify.authenticate, fastify.requireRoles(["admin"])],
         schema: { body: createIkuSchema, tags: ["Master Data - IKU"] },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         const data = await prisma.tb_iku_master.create({
            data: {
               jenis: body.jenis,
               kode: body.kode,
               deskripsi: body.deskripsi,
               tahun_berlaku: body.tahun_berlaku ? Number(body.tahun_berlaku) : null,
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
            },
         });

         return reply.status(201).send({ success: true, message: "IKU berhasil dibuat", data });
      },
   );

   // ===================== KATEGORI SBM =====================
   fastify.get(
      "/kategori-sbm",
      {
         preHandler: [fastify.authenticate],
         schema: { querystring: paginationQuerySchema, tags: ["Master Data - Kategori SBM"] },
      },
      async (request, reply) => {
         const { page = 1, limit = 50 } = request.query as any;
         const skip = (page - 1) * limit;

         const [data, total] = await Promise.all([
            prisma.tb_kategori_sbm.findMany({ skip, take: limit, orderBy: { kode: "asc" } }),
            prisma.tb_kategori_sbm.count(),
         ]);

         return reply.send({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      },
   );

   // ===================== STANDAR BIAYA =====================
   fastify.get(
      "/standar-biaya",
      {
         preHandler: [fastify.authenticate],
         schema: {
            querystring: {
               type: "object",
               properties: {
                  ...paginationQuerySchema.properties,
                  id_kategori: { type: "integer" },
                  tahun_anggaran: { type: "integer" },
               },
            },
            tags: ["Master Data - Standar Biaya"],
         },
      },
      async (request, reply) => {
         const { page = 1, limit = 50, search, id_kategori, tahun_anggaran } = request.query as any;
         const skip = (page - 1) * limit;

         const where: any = {};
         if (search) {
            where.OR = [{ kode: { contains: search, mode: "insensitive" } }, { nama: { contains: search, mode: "insensitive" } }];
         }
         if (id_kategori) {
            where.id_kategori = id_kategori;
         }

         const [data, total] = await Promise.all([
            prisma.tb_standar_biaya_master.findMany({
               where,
               skip,
               take: limit,
               orderBy: { kode: "asc" },
               include: {
                  tb_kategori_sbm: true,
                  tb_unit_satuan: true,
                  tb_detail_harga_sbm: tahun_anggaran
                     ? {
                          where: { tahun_anggaran: Number(tahun_anggaran) },
                       }
                     : true,
               },
            }),
            prisma.tb_standar_biaya_master.count({ where }),
         ]);

         return reply.send({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      },
   );
};

export default masterDataRoutes;
