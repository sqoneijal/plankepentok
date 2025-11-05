const express = require("express");
const prisma = require("@/db.js");
const errorHandler = require("@/handle-error.js");
const { logAudit } = require("@/helpers.js");
const { z } = require("zod");

const cleanRupiah = (val, fallback = 0) => {
   if (val == null) return fallback;
   const cleaned = val.toString().replaceAll(".", "");
   const num = Number(cleaned);
   return Number.isNaN(num) ? fallback : num;
};

const validationPenolakan = z.object({
   catatan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Asalan penolakan wajib diisi")),
});

const validationPerbaikan = z.object({
   catatan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Asalan perbaikan wajib diisi")),
});

const validationIKU = z
   .object({
      approve: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
      catatan_perbaikan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
   })
   .refine(
      (data) => {
         if (data.approve === "tidak_sesuai") {
            return data.catatan_perbaikan && data.catatan_perbaikan.trim() !== "";
         }
         return true;
      },
      {
         message: "Catatan perbaikan wajib diisi",
         path: ["catatan_perbaikan"],
      }
   );

const validationDokumen = z
   .object({
      approve: z.preprocess((val) => (val == null ? "" : String(val)), z.string().min(1, "Status wajib diisi")),
      catatan_perbaikan: z.preprocess((val) => (val == null ? "" : String(val)), z.string().optional()),
   })
   .refine(
      (data) => {
         if (data.approve === "tidak_sesuai") {
            return data.catatan_perbaikan && data.catatan_perbaikan.trim() !== "";
         }
         return true;
      },
      {
         message: "Catatan perbaikan wajib diisi",
         path: ["catatan_perbaikan"],
      }
   );

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

const router = express.Router();

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

   logAudit(user_modified, "UPDATE", "tb_anggaran_disetujui", ip, { ...oldData }, { ...newData });
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

router.put("/klaim", async (req, res) => {
   try {
      const { id_usulan_kegiatan, id_verikator_usulan, user_modified } = req.body;

      const usulanKegiatan = await prisma.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan_kegiatan) },
         select: { id: true, id_jenis_usulan: true },
      });

      if (!usulanKegiatan) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      const newData = await prisma.tb_klaim_verifikasi.update({
         where: {
            id_usulan_kegiatan_id_verikator_usulan: {
               id_usulan_kegiatan: Number.parseInt(id_usulan_kegiatan),
               id_verikator_usulan: Number.parseInt(id_verikator_usulan),
            },
         },
         data: {
            waktu_klaim: new Date(),
            status_klaim: "aktif",
         },
      });

      await logAudit(user_modified, "UPDATE", req.ip, null, { ...newData });

      return res.json({
         status: true,
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${usulanKegiatan.id}`, {}]],
         redirect: `/verifikasi-usulan/pengajuan/${usulanKegiatan.id}`,
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.get("/", async (req, res) => {
   try {
      const { username, limit, offset } = req.query;

      const verikator_usulan = await prisma.tb_verikator_usulan.findMany({
         where: {
            pengguna: {
               username,
            },
         },
         select: {
            id: true,
            id_jenis_usulan: true,
            tahap: true,
         },
      });

      const where = {
         id_jenis_usulan: verikator_usulan.id_jenis_usulan,
         status_usulan: "pengajuan",
         klaim_verifikasi: {
            some: {
               status_klaim: {
                  in: ["pending", "aktif"],
               },
               id_verikator_usulan: verikator_usulan.id,
            },
         },
      };

      const total = await prisma.tb_usulan_kegiatan.count({ where });
      const usulan = await prisma.tb_usulan_kegiatan.findMany({
         take: Number.parseInt(limit),
         skip: Number.parseInt(offset),
         where,
         select: {
            id: true,
            kode: true,
            jenis_usulan: {
               select: {
                  nama: true,
               },
            },
            tanggal_submit: true,
            rencana_total_anggaran: true,
            total_anggaran: true,
            pengguna: {
               select: {
                  fullname: true,
               },
            },
            unit_pengusul: {
               select: {
                  biro_master: {
                     select: {
                        nama: true,
                     },
                  },
                  lembaga_master: {
                     select: {
                        nama: true,
                     },
                  },
                  fakultas_master: {
                     select: {
                        nama: true,
                     },
                  },
                  upt_master: {
                     select: {
                        nama: true,
                     },
                  },
                  sub_unit: {
                     select: {
                        nama: true,
                     },
                  },
               },
            },
            klaim_verifikasi: true,
         },
      });

      const results = usulan.map((row) => ({ ...row, verikator_usulan }));

      return res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/referensi-sbm", async (req, res) => {
   try {
      const results = await prisma.tb_detail_harga_sbm.findMany({
         where: { status_validasi: "valid" },
         select: {
            id: true,
            standar_biaya_master: {
               select: {
                  id: true,
                  kode: true,
                  nama: true,
                  deskripsi: true,
               },
            },
            tahun_anggaran: true,
            harga_satuan: true,
            unit_satuan: {
               select: {
                  id: true,
                  nama: true,
                  deskripsi: true,
               },
            },
            tanggal_mulai_efektif: true,
            tanggal_akhir_efektif: true,
         },
      });

      res.json({ results });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

router.get("/:id_usulan/histori-penolakan", async (req, res) => {
   try {
      const { id_usulan } = req.params;

      const results = await prisma.tb_penolakan_usulan.findMany({
         where: { id_usulan_kegiatan: Number.parseInt(id_usulan) },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error?.message });
   }
});

router.get("/:id_usulan/histori-perbaikan", async (req, res) => {
   try {
      const { id_usulan } = req.params;

      const results = await prisma.tb_perbaikan_usulan.findMany({
         where: { id_usulan_kegiatan: Number.parseInt(id_usulan) },
         orderBy: { id: "desc" },
      });

      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error?.message });
   }
});

router.get("/:id_usulan_kegiatan", async (req, res) => {
   try {
      const { id_usulan_kegiatan } = req.params;
      const { username } = req.query;

      let results = {};

      await prisma.$transaction(async (tx) => {
         const checkAnggaranDisetujui = await tx.tb_anggaran_disetujui.findUnique({
            where: { id_usulan: Number.parseInt(id_usulan_kegiatan) },
         });

         if (!checkAnggaranDisetujui) {
            const newDataAnggaran = await tx.tb_anggaran_disetujui.create({
               data: {
                  id_usulan: Number.parseInt(id_usulan_kegiatan),
                  jumlah: 0,
               },
            });

            await logAudit("system", "CREATE", "tb_anggaran_disetujui", req.ip, null, { ...newDataAnggaran });
         }

         const where = {
            id: Number.parseInt(id_usulan_kegiatan),
            status_usulan: { in: ["pengajuan", "perbaiki", "ditolak"] },
            klaim_verifikasi: {
               some: {
                  verikator_usulan: {
                     pengguna: {
                        username,
                     },
                  },
                  status_klaim: "aktif",
               },
            },
         };

         const klaim = await tx.tb_klaim_verifikasi.findFirst({
            where: {
               id_usulan_kegiatan: Number.parseInt(id_usulan_kegiatan),
               status_klaim: "aktif",
               verikator_usulan: {
                  pengguna: {
                     username,
                  },
               },
            },
            select: {
               verikator_usulan: {
                  select: {
                     tahap: true,
                  },
               },
            },
         });

         if (!klaim) {
            throw new Error("Klaim verifikasi aktif tidak ditemukan");
         }

         results = await tx.tb_usulan_kegiatan.findUnique({
            where,
            select: {
               id: true,
               klaim_verifikasi: {
                  where: {
                     status_klaim: "aktif",
                  },
                  select: {
                     id: true,
                     status_klaim: true,
                     verikator_usulan: {
                        select: {
                           id: true,
                           tahap: true,
                           id_jenis_usulan: true,
                           pengguna: {
                              select: {
                                 id: true,
                                 username: true,
                              },
                           },
                        },
                     },
                  },
               },
               kode: true,
               latar_belakang: true,
               tujuan: true,
               sasaran: true,
               waktu_mulai: true,
               waktu_selesai: true,
               tempat_pelaksanaan: true,
               pengguna: {
                  select: {
                     id: true,
                     fullname: true,
                  },
               },
               total_anggaran: true,
               status_usulan: true,
               tanggal_submit: true,
               rencana_total_anggaran: true,
               catatan_perbaikan: true,
               jenis_usulan: {
                  select: {
                     id: true,
                     nama: true,
                  },
               },
               dokumen_pendukung: {
                  orderBy: { uploaded: "asc" },
                  select: {
                     id: true,
                     nama_dokumen: true,
                     tipe_dokumen: true,
                     path_file: true,
                     uploaded: true,
                     modified: true,
                     user_modified: true,
                     file_dokumen: true,
                  },
               },
               rab_detail: {
                  orderBy: { uploaded: "asc" },
                  select: {
                     id: true,
                     uraian_biaya: true,
                     qty: true,
                     harga_satuan: true,
                     total_biaya: true,
                     catatan: true,
                     unit_satuan: {
                        select: {
                           id: true,
                           nama: true,
                           deskripsi: true,
                        },
                     },
                     rab_detail_perubahan: {
                        select: {
                           id: true,
                           qty: true,
                           harga_satuan: true,
                           total_biaya: true,
                        },
                     },
                  },
               },
               relasi_usulan_iku: {
                  orderBy: { id: "desc" },
                  select: {
                     id: true,
                     iku_master: {
                        select: {
                           id: true,
                           jenis: true,
                           kode: true,
                           deskripsi: true,
                           tahun_berlaku: true,
                        },
                     },
                  },
               },
               unit_pengusul: {
                  select: {
                     biro_master: {
                        select: {
                           id: true,
                           nama: true,
                        },
                     },
                     lembaga_master: {
                        select: {
                           id: true,
                           nama: true,
                        },
                     },
                     upt_master: {
                        select: {
                           id: true,
                           nama: true,
                        },
                     },
                     fakultas_master: {
                        select: {
                           id: true,
                           nama: true,
                        },
                     },
                     sub_unit: {
                        select: {
                           id: true,
                           nama: true,
                        },
                     },
                  },
               },
               anggaran_disetujui: {
                  select: { jumlah: true },
               },
               verifikasi: {
                  where: {
                     tahap: Number.parseInt(klaim.verikator_usulan.tahap),
                  },
                  select: {
                     id: true,
                     id_referensi: true,
                     table_referensi: true,
                     catatan: true,
                     status: true,
                  },
               },
            },
         });
      });

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.put("/iku/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified, klaim_verifikasi } = req.body;

      const parsed = validationIKU.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_relasi_usulan_iku.findUnique({
         where: { id: Number.parseInt(id) },
         select: {
            id_usulan: true,
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Relasi IKU tidak ditemukan" });
      }

      const verifikator = findVerifikator(klaim_verifikasi, user_modified);

      await handleStatusVerifikasi({
         ip: req.ip,
         id_pengguna: verifikator.id_pengguna,
         id_usulan_kegiatan: oldData.id_usulan,
         id_referensi: Number.parseInt(id),
         table_referensi: "tb_relasi_usulan_iku",
         status: approve,
         user_modified,
         catatan: catatan_perbaikan,
         tahap: verifikator.tahap,
      });

      return res.json({
         status: true,
         message: "Relasi IKU berhasil diperbaharui",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id_usulan}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.put("/rab/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified, new_qty, new_harga_satuan, new_total_biaya, klaim_verifikasi } = req.body;

      const parsed = validationRAB.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_rab_detail.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Rencana anggaran biaya tidak ditemukan" });
      }

      const verifikator = findVerifikator(klaim_verifikasi, user_modified);

      await prisma.$transaction(async (tx) => {
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
});

router.put("/dokumen/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const { approve, catatan_perbaikan, user_modified, klaim_verifikasi } = req.body;

      const parsed = validationDokumen.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_dokumen_pendukung.findUnique({
         where: { id: Number.parseInt(id) },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Dokumen tidak ditemukan" });
      }

      const verifikator = findVerifikator(klaim_verifikasi, user_modified);

      await handleStatusVerifikasi({
         ip: req.ip,
         id_pengguna: verifikator.id_pengguna,
         id_usulan_kegiatan: oldData.id_usulan,
         id_referensi: Number.parseInt(id),
         table_referensi: "tb_dokumen_pendukung",
         status: approve,
         user_modified,
         catatan: catatan_perbaikan,
         tahap: verifikator.tahap,
      });

      return res.status(201).json({
         status: true,
         message: "Dokumen berhasil diperbaharui",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id_usulan}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.post("/:id_usulan/tolak", async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { user_modified, catatan, klaim_verifikasi } = req.body;

      const parsed = validationPenolakan.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["pengajuan", "ditolak", "perbaiki"],
            },
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      await prisma.$transaction(async (tx) => {
         const newDataLog = await tx.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               tahap: Number.parseInt(klaim_verifikasi.tahap),
               verifikator_id: Number.parseInt(klaim_verifikasi.id_pengguna),
               aksi: "ditolak",
               catatan,
               waktu: new Date(),
            },
         });

         await logAudit(user_modified, "CREATE", "tb_log_verifikasi", req.ip, null, { ...newDataLog });

         const newDataPenolakan = await tx.tb_penolakan_usulan.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               catatan,
               uploaded: new Date(),
               user_modified,
            },
         });

         await logAudit(user_modified, "CREATE", "tb_penolakan_usulan", req.ip, null, { ...newDataPenolakan });

         const newData = await tx.tb_usulan_kegiatan.update({
            where: { id: Number.parseInt(id_usulan) },
            data: {
               catatan_perbaikan: catatan,
               status_usulan: "ditolak",
               modified: new Date(),
            },
         });

         await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });
      });

      return res.json({
         status: true,
         message: "Data berhasil disimpan",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.post("/:id_usulan/perbaiki", async (req, res) => {
   try {
      const { id_usulan } = req.params;
      const { user_modified, catatan, klaim_verifikasi } = req.body;

      const parsed = validationPerbaikan.safeParse(req.body);

      if (!parsed.success) {
         return errorHandler(parsed, res);
      }

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["pengajuan", "ditolak", "perbaiki"],
            },
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      await prisma.$transaction(async (tx) => {
         const newDataLog = await tx.tb_log_verifikasi.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               tahap: Number.parseInt(klaim_verifikasi.tahap),
               verifikator_id: Number.parseInt(klaim_verifikasi.id),
               aksi: "perbaiki",
               catatan,
               waktu: new Date(),
            },
         });

         await logAudit(user_modified, "CREATE", "tb_log_verifikasi", req.ip, null, { ...newDataLog });

         const newDataPerbaikan = await tx.tb_perbaikan_usulan.create({
            data: {
               id_usulan_kegiatan: Number.parseInt(id_usulan),
               catatan,
               uploaded: new Date(),
               user_modified,
            },
         });

         await logAudit(user_modified, "CREATE", "tb_perbaikan_usulan", req.ip, null, { ...newDataPerbaikan });

         const newData = await tx.tb_usulan_kegiatan.update({
            where: { id: Number.parseInt(id_usulan) },
            data: {
               catatan_perbaikan: catatan,
               status_usulan: "perbaiki",
               modified: new Date(),
            },
         });

         await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newData });
      });

      return res.json({
         status: true,
         message: "Data berhasil disimpan",
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
});

router.put("/setujui", async (req, res) => {
   try {
      const { id_usulan, user_modified, klaim_verifikasi } = req.body;

      const oldData = await prisma.tb_usulan_kegiatan.findUnique({
         where: {
            id: Number.parseInt(id_usulan),
            status_usulan: {
               in: ["pengajuan", "ditolak", "perbaiki"],
            },
         },
      });

      if (!oldData) {
         return res.json({ status: false, message: "Usulan kegiatan tidak ditemukan" });
      }

      await prisma.$transaction(async (tx) => {
         const verifikator = findVerifikator(klaim_verifikasi, user_modified);

         const verikator_usulan = await tx.tb_verikator_usulan.findFirst({
            where: {
               id_jenis_usulan: Number.parseInt(verifikator.id_jenis_usulan),
               tahap: { gt: Number.parseInt(verifikator.tahap) },
            },
         });

         if (verikator_usulan) {
            const oldDataKlaim = await tx.tb_klaim_verifikasi.findUnique({
               where: { id: verifikator.id_klaim },
            });

            const newDataKlaim = await tx.tb_klaim_verifikasi.update({
               where: { id: verifikator.id_klaim },
               data: {
                  status_klaim: "selesai",
               },
            });

            await logAudit(user_modified, "UPDATE", "tb_klaim_verifikasi", req.ip, { ...oldDataKlaim }, { ...newDataKlaim });

            const klaim_verifikasi = await tx.tb_klaim_verifikasi.create({
               data: {
                  id_usulan_kegiatan: Number.parseInt(id_usulan),
                  id_verikator_usulan: verikator_usulan.id,
                  status_klaim: "pending",
               },
            });

            await logAudit("system", "CREATE", "tb_klaim_verifikasi", req.ip, null, { ...klaim_verifikasi });

            const newDataUsulan = await tx.tb_usulan_kegiatan.update({
               where: { id: Number.parseInt(id_usulan) },
               data: {
                  status_usulan: "pengajuan",
                  user_modified,
                  modified: new Date(),
               },
            });

            await logAudit(user_modified, "UPDATE", "tb_usulan_kegiatan", req.ip, { ...oldData }, { ...newDataUsulan });
            return;
         }

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
         refetchQuery: [[`/verifikasi-usulan/pengajuan/${oldData.id}`, { username: user_modified }]],
      });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
});

module.exports = router;
