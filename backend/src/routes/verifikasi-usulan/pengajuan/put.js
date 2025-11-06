const db = require("@/db.js");
const { logAudit } = require("@/helpers.js");
const { z } = require("zod");
const errorHandler = require("@/handle-error.js");

const validationRAB = z
   .object({
      approve: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
      catatan_perbaikan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
      new_qty: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
      new_harga_satuan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
      new_total_biaya: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
   })
   .refine(
      (data) => {
         if (["ubah", "tidak_valid", "perbaiki"].includes(data.approve)) {
            return data.catatan_perbaikan && data.catatan_perbaikan.trim() !== "";
         }
         return true;
      },
      {
         message: "Catatan perbaikan wajib diisi",
         path: ["catatan_perbaikan"],
      }
   )
   .refine(
      (data) => {
         if (data.approve === "ubah") {
            return data.new_qty && data.new_qty.trim() !== "";
         }
         return true;
      },
      {
         message: "Qty baru wajib diisi",
         path: ["new_qty"],
      }
   )
   .refine(
      (data) => {
         if (data.approve === "ubah") {
            return data.new_harga_satuan && data.new_harga_satuan.trim() !== "";
         }
         return true;
      },
      {
         message: "Harga satuan baru wajib diisi",
         path: ["new_harga_satuan"],
      }
   )
   .refine(
      (data) => {
         if (data.approve === "ubah") {
            return data.new_total_biaya && data.new_total_biaya.trim() !== "";
         }
         return true;
      },
      {
         message: "Total biaya baru wajib diisi",
         path: ["new_total_biaya"],
      }
   );

const hitungAnggaranDisetujui = async (id_usulan_kegiatan, user_modified, ip, tx = prisma) => {
   const verifikasi = await tx.tb_verifikasi.findMany({
      where: {
         id_usulan_kegiatan: Number.parseInt(id_usulan_kegiatan),
         status: "valid",
         table_referensi: "tb_rab_detail",
      },
      select: {
         id_referensi: true,
      },
   });

   const rabDetail = await tx.tb_rab_detail.findMany({
      where: { id: { in: verifikasi.map((v) => v.id_referensi) } },
      select: {
         id: true,
         total_biaya: true,
      },
   });

   const rabPerubahan = await tx.tb_rab_detail_perubahan.findMany({
      where: { id_rab_detail: { in: verifikasi.map((v) => v.id_referensi) } },
      select: {
         id_rab_detail: true,
         total_biaya: true,
      },
   });

   // Create a map of perubahan by id_rab_detail
   const perubahanMap = new Map();
   for (const perubahan of rabPerubahan) {
      perubahanMap.set(perubahan.id_rab_detail, perubahan.total_biaya);
   }

   // Replace total_biaya in rabDetail if perubahan exists
   const updatedRabDetail = rabDetail.map((detail) => ({
      ...detail,
      total_biaya: perubahanMap.has(detail.id) ? perubahanMap.get(detail.id) : detail.total_biaya,
   }));

   let total_biaya = 0;
   for (const biaya of updatedRabDetail) {
      total_biaya += cleanRupiah(biaya.total_biaya);
   }

   const oldData = await tx.tb_anggaran_disetujui.findUnique({
      where: { id_usulan: Number.parseInt(id_usulan_kegiatan) },
   });

   const newData = await tx.tb_anggaran_disetujui.update({
      where: { id: oldData.id },
      data: { jumlah: total_biaya },
   });

   await logAudit(user_modified, "UPDATE", "tb_anggaran_disetujui", ip, { ...oldData }, { ...newData });
};

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

const handleStatusVerifikasi = async (data = {}, tx = prisma) => {
   const oldData = await tx.tb_verifikasi.findFirst({
      where: {
         id_referensi: Number.parseInt(data.id_referensi),
         table_referensi: data.table_referensi,
         id_pengguna: data.id_pengguna,
         id_usulan_kegiatan: data.id_usulan_kegiatan,
         tahap: Number.parseInt(data.tahap),
      },
   });

   const isUpdate = !!oldData;
   const newData = isUpdate
      ? await tx.tb_verifikasi.update({
           where: { id: oldData.id },
           data: {
              status: data.status,
              modified: new Date(),
              user_modified: data.user_modified,
              catatan: data.catatan,
           },
        })
      : await tx.tb_verifikasi.create({
           data: {
              id_pengguna: data.id_pengguna,
              id_usulan_kegiatan: data.id_usulan_kegiatan,
              id_referensi: data.id_referensi,
              table_referensi: data.table_referensi,
              status: data.status,
              uploaded: new Date(),
              user_modified: data.user_modified,
              catatan: data.catatan,
              tahap: data.tahap,
           },
        });

   await logAudit(data.user_modified, isUpdate ? "UPDATE" : "CREATE", "tb_verifikasi", data.ip, isUpdate ? { ...oldData } : null, { ...newData });

   return oldData;
};

const klaim = async (req, res) => {
   try {
      const { id_usulan_kegiatan, user_modified } = req.body;

      let usulanKegiatan = {};

      await db.$transaction(async (tx) => {
         usulanKegiatan = await tx.tb_usulan_kegiatan.findUnique({
            where: { id: Number.parseInt(id_usulan_kegiatan) },
            select: {
               id: true,
               id_jenis_usulan: true,
               tahap_verifikasi: true,
            },
         });

         if (!usulanKegiatan) {
            return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
         }

         const tahap_verifikasi = Number.parseInt(usulanKegiatan.tahap_verifikasi);

         const pengguna = await tx.tb_pengguna.findUnique({
            where: {
               username_id_roles: {
                  username: user_modified,
                  id_roles: 4,
               },
            },
            select: {
               verikator_usulan: {
                  where: { id_jenis_usulan: usulanKegiatan.id_jenis_usulan },
                  select: {
                     id: true,
                     id_jenis_usulan: true,
                     tahap: true,
                  },
               },
            },
         });

         if (tahap_verifikasi === null) {
            const newDataUsulanKegiatan = await tx.tb_usulan_kegiatan.update({
               where: { id: usulanKegiatan.id },
               data: {
                  tahap_verifikasi: Number.parseInt(pengguna.verikator_usulan.find((e) => Number.parseInt(e.tahap) === 1)?.tahap),
               },
            });

            await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...usulanKegiatan }, { ...newDataUsulanKegiatan });
         }

         const tahapanVerifikator = pengguna.verikator_usulan.find((e) => Number.parseInt(e.tahap) === tahap_verifikasi);

         const newDataKlaimVerifikasi = await tx.tb_klaim_verifikasi.create({
            data: {
               id_usulan_kegiatan: usulanKegiatan.id,
               id_verikator_usulan: Number.parseInt(
                  tahapanVerifikator ? tahapanVerifikator.id : pengguna.verikator_usulan.find((e) => Number.parseInt(e.tahap) === 1)?.id
               ),
               waktu_klaim: new Date(),
               status_klaim: "aktif",
            },
         });

         await logAudit(user_modified, "CREATE", "tb_klaim_verifikasi", req.ip, null, { ...newDataKlaimVerifikasi });
      });

      res.json({
         status: true,
         redirect: `/verifikasi-usulan/pengajuan/${usulanKegiatan.id}`,
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${usulanKegiatan.id}`, {}]],
      });
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
};

const findVerifikator = (klaimVerifikasi, targetUsername) => {
   for (const item of klaimVerifikasi) {
      if (item.verikator_usulan?.pengguna?.username === targetUsername && item.status_klaim === "aktif") {
         return {
            id_pengguna: item.verikator_usulan.pengguna.id,
            id_klaim: item.id,
            tahap: Number.parseInt(item.verikator_usulan.tahap),
            id_verikator_usulan: Number.parseInt(item.verikator_usulan.id),
            id_jenis_usulan: Number.parseInt(item.verikator_usulan.id_jenis_usulan),
         };
      }
   }

   return null; // Jika tidak ditemukan
};

const setujui = async (req, res) => {
   try {
      const { id_usulan, user_modified, klaim_verifikasi } = req.body;

      const oldData = await db.tb_usulan_kegiatan.findUnique({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["pengajuan", "ditolak", "perbaiki"],
            },
         },
         select: {
            id: true,
            status_usulan: true,
            user_modified: true,
            modified: true,
            tahap_verifikasi: true,
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const verifikator = findVerifikator(klaim_verifikasi, user_modified);

      const verikator_usulan = await db.tb_verikator_usulan.findFirst({
         where: {
            id_jenis_usulan: Number.parseInt(verifikator.id_jenis_usulan),
            tahap: { gt: Number.parseInt(verifikator.tahap) },
         },
         select: {
            id: true,
            tahap: true,
         },
      });

      const oldDataKlaim = await tx.tb_klaim_verifikasi.findUnique({
         where: { id: verifikator.id_klaim },
         select: {
            id: true,
            status_klaim: true,
         },
      });

      await db.$transaction(async (tx) => {
         if (verikator_usulan) {
            const newDataKlaim = await tx.tb_klaim_verifikasi.update({
               where: { id: oldDataKlaim.id },
               data: {
                  status_klaim: "selesai",
               },
            });

            await logAudit(user_modified, "UPDATE", "tb_klaim_verifikasi", req.ip, { ...oldDataKlaim }, { ...newDataKlaim });

            const newDataUsulan = await tx.tb_usulan_kegiatan.update({
               where: { id: Number.parseInt(id_usulan) },
               data: {
                  status_usulan: "pengajuan",
                  user_modified,
                  modified: new Date(),
                  tahap_verifikasi: Number.parseInt(verikator_usulan.tahap),
               },
            });

            await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newDataUsulan });
            return;
         }

         const newDataKlaim = await tx.tb_klaim_verifikasi.update({
            where: { id: oldDataKlaim.id },
            data: {
               status_klaim: "selesai",
            },
         });

         await logAudit(user_modified, "UPDATE", "tb_klaim_verifikasi", req.ip, { ...oldDataKlaim }, { ...newDataKlaim });

         const newDataUsulan = await tx.tb_usulan_kegiatan.update({
            where: { id: Number.parseInt(id_usulan) },
            data: {
               status_usulan: "diterima",
               user_modified,
               modified: new Date(),
            },
         });

         await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newDataUsulan });
      });

      return res.json({
         status: true,
         message: "Status usulan berhasil diperbaharui",
         refetchQuery: [
            [`/verifikasi-usulan/pengajuan/${oldData.id}`, { username: user_modified }],
            ["/usulan-kegiatan", { limit: "25", offset: "0" }],
         ],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
};

const verifikasiRencanaAnggaranBiaya = async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified, new_qty, new_harga_satuan, new_total_biaya, klaim_verifikasi } = req.body;

      const parsed = validationRAB.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await db.tb_rab_detail.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Rencana anggaran biaya tidak ditemukan" });
      }

      const verifikator = findVerifikator(klaim_verifikasi, user_modified);

      await db.$transaction(async (tx) => {
         let oldPerubahan = await tx.tb_rab_detail_perubahan.findUnique({
            where: { id_rab_detail: Number.parseInt(id) },
         });

         const statusVerifikasi = await handleStatusVerifikasi(
            {
               ip: req.ip,
               id_pengguna: verifikator.id_pengguna,
               id_usulan_kegiatan: oldData.id_usulan,
               id_referensi: Number.parseInt(id),
               table_referensi: "tb_rab_detail",
               status: approve === "ubah" ? "valid" : approve,
               user_modified,
               catatan: catatan_perbaikan,
               tahap: verifikator.tahap,
            },
            tx
         );

         const previousStatus = statusVerifikasi?.status ?? null;

         if (previousStatus === "valid" && oldPerubahan) {
            await tx.tb_rab_detail_perubahan.delete({
               where: { id: oldPerubahan.id },
            });

            await logAudit(user_modified, "DELETE", "tb_rab_detail_perubahan", req.ip, { ...oldPerubahan }, null);
            oldPerubahan = null;
         }

         if (approve === "ubah") {
            if (oldPerubahan) {
               const newData = await tx.tb_rab_detail_perubahan.update({
                  where: { id: oldPerubahan.id },
                  data: {
                     qty: Number.parseInt(new_qty),
                     harga_satuan: cleanRupiah(new_harga_satuan),
                     total_biaya: cleanRupiah(new_total_biaya),
                     modified: new Date(),
                     user_modified,
                  },
               });

               await logAudit(user_modified, "UPDATE", "tb_rab_detail_perubahan", req.ip, { ...oldPerubahan }, { ...newData });
            } else {
               const newData = await tx.tb_rab_detail_perubahan.create({
                  data: {
                     id_rab_detail: Number.parseInt(id),
                     qty: Number.parseInt(new_qty),
                     harga_satuan: cleanRupiah(new_harga_satuan),
                     total_biaya: cleanRupiah(new_total_biaya),
                     uploaded: new Date(),
                     user_modified,
                     tahap_verifikasi: verifikator.tahap,
                  },
               });

               await logAudit(user_modified, "CREATE", "tb_rab_detail_perubahan", req.ip, null, { ...newData });
            }
         }

         await hitungAnggaranDisetujui(oldData.id_usulan, user_modified, req.ip, tx);
      });

      return res.json({
         status: true,
         message: "Rencana anggaran biaya berhasil diperbaharui",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id_usulan}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
};

module.exports = { klaim, setujui, verifikasiRencanaAnggaranBiaya };
