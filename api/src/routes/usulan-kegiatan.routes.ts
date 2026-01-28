import { FastifyPluginAsync } from "fastify";
import { idParamsSchema } from "../schemas/common.schema";
import { createUsulanKegiatanSchema, filterUsulanSchema, updateUsulanKegiatanSchema } from "../schemas/usulan-kegiatan.schema";

const usulanKegiatanRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   // Generate kode usulan
   const generateKodeUsulan = async (tahun: number): Promise<string> => {
      const count = await prisma.tb_usulan_kegiatan.count({
         where: {
            tb_pengaturan: {
               tahun_anggaran: Number(tahun),
            },
         },
      });
      const sequence = String(count + 1).padStart(5, "0");
      return `USL-${tahun}-${sequence}`;
   };

   // GET - List usulan kegiatan dengan pagination & filter
   fastify.get(
      "/",
      {
         preHandler: [fastify.authenticate],
         schema: {
            querystring: filterUsulanSchema,
            tags: ["Usulan Kegiatan"],
            summary: "Get list usulan kegiatan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const {
            page = 1,
            limit = 10,
            search,
            status_usulan,
            id_jenis_usulan,
            tahun_anggaran,
            sortBy = "uploaded",
            sortOrder = "desc",
         } = request.query as any;

         const skip = (page - 1) * limit;

         const where: any = {};

         if (search) {
            where.OR = [
               { kode: { contains: search, mode: "insensitive" } },
               { tujuan: { contains: search, mode: "insensitive" } },
               { sasaran: { contains: search, mode: "insensitive" } },
            ];
         }

         if (status_usulan) {
            where.status_usulan = status_usulan;
         }

         if (id_jenis_usulan) {
            where.id_jenis_usulan = id_jenis_usulan;
         }

         if (tahun_anggaran) {
            where.tb_pengaturan = {
               tahun_anggaran: Number(tahun_anggaran),
            };
         }

         const [data, total] = await Promise.all([
            prisma.tb_usulan_kegiatan.findMany({
               where,
               skip,
               take: limit,
               orderBy: { [sortBy]: sortOrder },
               include: {
                  tb_jenis_usulan: true,
                  tb_pengaturan: true,
                  tb_pengguna: {
                     select: { id: true, fullname: true, username: true },
                  },
                  tb_unit_pengusul: {
                     include: {
                        tb_biro_master: true,
                        tb_fakultas_master: true,
                        tb_lembaga_master: true,
                        tb_upt_master: true,
                        tb_sub_unit: true,
                     },
                  },
                  tb_anggaran_disetujui: true,
                  _count: {
                     select: {
                        tb_rab_detail: true,
                        tb_dokumen_pendukung: true,
                     },
                  },
               },
            }),
            prisma.tb_usulan_kegiatan.count({ where }),
         ]);

         return reply.send({
            success: true,
            message: "Data usulan kegiatan berhasil diambil",
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

   // GET - Detail usulan kegiatan by ID
   fastify.get(
      "/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: idParamsSchema,
            tags: ["Usulan Kegiatan"],
            summary: "Get detail usulan kegiatan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };

         const data = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id },
            include: {
               tb_jenis_usulan: true,
               tb_pengaturan: true,
               tb_pengguna: {
                  select: { id: true, fullname: true, username: true },
               },
               tb_unit_pengusul: {
                  include: {
                     tb_biro_master: true,
                     tb_fakultas_master: true,
                     tb_lembaga_master: true,
                     tb_upt_master: true,
                     tb_sub_unit: true,
                  },
               },
               tb_rab_detail: {
                  include: {
                     tb_unit_satuan: true,
                     tb_rab_detail_perubahan: true,
                  },
               },
               tb_dokumen_pendukung: true,
               tb_relasi_usulan_iku: {
                  include: { tb_iku_master: true },
               },
               tb_tor: {
                  include: {
                     tb_jenis_keluaran_tor: {
                        include: { tb_mst_jenis_keluaran_tor: true },
                     },
                     tb_penerima_manfaat_tor: {
                        include: { tb_mst_penerima_manfaat_tor: true },
                     },
                     tb_volume_keluaran_tor: {
                        include: { tb_mst_volume_keluaran_tor: true },
                     },
                  },
               },
               tb_anggaran_disetujui: true,
               tb_verifikasi: {
                  include: { tb_pengguna: true },
                  orderBy: { tahap: "asc" },
               },
               tb_log_verifikasi: {
                  include: { tb_pengguna: true },
                  orderBy: { waktu: "desc" },
               },
               tb_perbaikan_usulan: {
                  orderBy: { uploaded: "desc" },
               },
               tb_penolakan_usulan: {
                  orderBy: { uploaded: "desc" },
               },
            },
         });

         if (!data) {
            return reply.status(404).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
            });
         }

         return reply.send({
            success: true,
            message: "Detail usulan kegiatan berhasil diambil",
            data,
         });
      },
   );

   // POST - Create usulan kegiatan baru
   fastify.post(
      "/",
      {
         preHandler: [fastify.authenticate],
         schema: {
            body: createUsulanKegiatanSchema,
            tags: ["Usulan Kegiatan"],
            summary: "Create usulan kegiatan baru",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const body = request.body as any;
         const user = request.user!;

         // Get pengaturan untuk tahun anggaran
         const pengaturan = await prisma.tb_pengaturan.findUnique({
            where: { id: body.id_pengaturan },
         });

         if (!pengaturan) {
            return reply.status(400).send({
               success: false,
               message: "Pengaturan tahun anggaran tidak ditemukan",
               errors: [{ field: "id_pengaturan", message: "ID pengaturan tidak valid" }],
            });
         }

         if (!pengaturan.is_aktif) {
            return reply.status(400).send({
               success: false,
               message: "Tahun anggaran tidak aktif",
               errors: [{ field: "id_pengaturan", message: "Tahun anggaran sudah ditutup" }],
            });
         }

         // Get atau create pengguna
         let pengguna = await prisma.tb_pengguna.findFirst({
            where: { username: user.preferred_username },
         });

         pengguna ??= await prisma.tb_pengguna.create({
            data: {
               username: user.preferred_username,
               fullname: user.name,
            },
         });

         // Generate kode
         const kode = await generateKodeUsulan(Number(pengaturan.tahun_anggaran));

         // Create usulan kegiatan
         const data = await prisma.tb_usulan_kegiatan.create({
            data: {
               kode,
               latar_belakang: body.latar_belakang,
               tujuan: body.tujuan,
               sasaran: body.sasaran,
               waktu_mulai: body.waktu_mulai ? new Date(body.waktu_mulai) : null,
               waktu_selesai: body.waktu_selesai ? new Date(body.waktu_selesai) : null,
               tempat_pelaksanaan: body.tempat_pelaksanaan,
               id_jenis_usulan: body.id_jenis_usulan,
               id_pengaturan: body.id_pengaturan,
               rencana_total_anggaran: body.rencana_total_anggaran ? Number(body.rencana_total_anggaran) : null,
               operator_input: pengguna.id,
               status_usulan: "draft",
               user_modified: user.preferred_username,
               uploaded: new Date(),
               modified: new Date(),
               // Create unit pengusul jika ada
               ...(body.unit_pengusul && {
                  tb_unit_pengusul: {
                     create: {
                        id_biro: body.unit_pengusul.id_biro,
                        id_lembaga: body.unit_pengusul.id_lembaga,
                        id_upt: body.unit_pengusul.id_upt,
                        id_fakultas: body.unit_pengusul.id_fakultas,
                        id_sub_unit: body.unit_pengusul.id_sub_unit,
                     },
                  },
               }),
            },
            include: {
               tb_jenis_usulan: true,
               tb_pengaturan: true,
               tb_unit_pengusul: true,
            },
         });

         return reply.status(201).send({
            success: true,
            message: "Usulan kegiatan berhasil dibuat",
            data,
         });
      },
   );

   // PUT - Update usulan kegiatan
   fastify.put(
      "/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: idParamsSchema,
            body: updateUsulanKegiatanSchema,
            tags: ["Usulan Kegiatan"],
            summary: "Update usulan kegiatan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         const body = request.body as any;
         const user = request.user!;

         // Check if exists and editable
         const existing = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id },
         });

         if (!existing) {
            return reply.status(404).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
            });
         }

         if (!["draft", "revision"].includes(existing.status_usulan || "")) {
            return reply.status(400).send({
               success: false,
               message: "Usulan kegiatan tidak dapat diubah",
               errors: [
                  {
                     field: "status_usulan",
                     message: `Status ${existing.status_usulan} tidak dapat diubah`,
                  },
               ],
            });
         }

         const data = await prisma.tb_usulan_kegiatan.update({
            where: { id },
            data: {
               latar_belakang: body.latar_belakang,
               tujuan: body.tujuan,
               sasaran: body.sasaran,
               waktu_mulai: body.waktu_mulai ? new Date(body.waktu_mulai) : undefined,
               waktu_selesai: body.waktu_selesai ? new Date(body.waktu_selesai) : undefined,
               tempat_pelaksanaan: body.tempat_pelaksanaan,
               rencana_total_anggaran: body.rencana_total_anggaran ? Number(body.rencana_total_anggaran) : undefined,
               user_modified: user.preferred_username,
               modified: new Date(),
            },
            include: {
               tb_jenis_usulan: true,
               tb_pengaturan: true,
               tb_unit_pengusul: true,
            },
         });

         return reply.send({
            success: true,
            message: "Usulan kegiatan berhasil diperbarui",
            data,
         });
      },
   );

   // POST - Submit usulan kegiatan
   fastify.post(
      "/:id/submit",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: idParamsSchema,
            tags: ["Usulan Kegiatan"],
            summary: "Submit usulan kegiatan untuk diverifikasi",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };
         const user = request.user!;

         const existing = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id },
            include: {
               tb_rab_detail: true,
               tb_tor: true,
            },
         });

         if (!existing) {
            return reply.status(404).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
            });
         }

         if (!["draft", "revision"].includes(existing.status_usulan || "")) {
            return reply.status(400).send({
               success: false,
               message: "Usulan kegiatan tidak dapat disubmit",
               errors: [
                  {
                     field: "status_usulan",
                     message: `Status ${existing.status_usulan} tidak dapat disubmit`,
                  },
               ],
            });
         }

         // Validasi kelengkapan
         const errors: any[] = [];

         if (!existing.latar_belakang) {
            errors.push({ field: "latar_belakang", message: "Latar belakang wajib diisi" });
         }
         if (!existing.tujuan) {
            errors.push({ field: "tujuan", message: "Tujuan wajib diisi" });
         }
         if (existing.tb_rab_detail.length === 0) {
            errors.push({ field: "rab_detail", message: "RAB detail wajib diisi minimal 1 item" });
         }
         if (!existing.tb_tor) {
            errors.push({ field: "tor", message: "TOR wajib diisi" });
         }

         if (errors.length > 0) {
            return reply.status(400).send({
               success: false,
               message: "Usulan kegiatan belum lengkap",
               errors,
            });
         }

         // Hitung total anggaran dari RAB
         const totalAnggaran = existing.tb_rab_detail.reduce((sum, item) => {
            return sum + Number(item.total_biaya || 0);
         }, 0);

         const data = await prisma.tb_usulan_kegiatan.update({
            where: { id },
            data: {
               status_usulan: "submitted",
               tanggal_submit: new Date(),
               total_anggaran: Number(totalAnggaran),
               tahap_verifikasi: Number(1),
               user_modified: user.preferred_username,
               modified: new Date(),
            },
         });

         // Log verifikasi
         await prisma.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: id,
               tahap: Number(0),
               aksi: "submit",
               catatan: "Usulan disubmit untuk verifikasi",
               waktu: new Date(),
            },
         });

         return reply.send({
            success: true,
            message: "Usulan kegiatan berhasil disubmit",
            data,
         });
      },
   );

   // DELETE - Hapus usulan kegiatan
   fastify.delete(
      "/:id",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: idParamsSchema,
            tags: ["Usulan Kegiatan"],
            summary: "Hapus usulan kegiatan",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params as { id: number };

         const existing = await prisma.tb_usulan_kegiatan.findUnique({
            where: { id },
         });

         if (!existing) {
            return reply.status(404).send({
               success: false,
               message: "Usulan kegiatan tidak ditemukan",
            });
         }

         if (existing.status_usulan !== "draft") {
            return reply.status(400).send({
               success: false,
               message: "Hanya usulan dengan status draft yang dapat dihapus",
            });
         }

         await prisma.tb_usulan_kegiatan.delete({
            where: { id },
         });

         return reply.send({
            success: true,
            message: "Usulan kegiatan berhasil dihapus",
         });
      },
   );
};

export default usulanKegiatanRoutes;
