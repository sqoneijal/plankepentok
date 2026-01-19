const db = require("@/db.js");

const getData = async (req, res) => {
   try {
      const { limit, offset, username } = req.query;

      let results = [];
      let total = 0;

      await db.read.$transaction(async (tx) => {
         const pengguna = await tx.tb_pengguna.findFirst({
            where: { username, id_roles: 4 },
            select: {
               verikator_usulan: {
                  select: {
                     id_jenis_usulan: true,
                     tahap: true,
                  },
               },
            },
         });

         const id_jenis_usulan = pengguna.verikator_usulan.map((e) => e.id_jenis_usulan);
         const tahaps = pengguna.verikator_usulan
            .map((e) => e.tahap)
            .filter((t) => t != null && !Number.isNaN(Number.parseInt(t)))
            .map((t) => Number.parseInt(t));

         const where = {
            status_usulan: "pengajuan",
            id_jenis_usulan: {
               in: id_jenis_usulan,
            },
            OR: [{ tahap_verifikasi: null }, { tahap_verifikasi: { in: tahaps } }],
         };

         total = await tx.tb_usulan_kegiatan.count({ where });
         results = await tx.tb_usulan_kegiatan.findMany({
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
      });

      res.json({ results, total });
   } catch (error) {
      res.json({ status: false, message: error.message });
   }
};

const getDetail = async (req, res) => {
   try {
      const { id_usulan_kegiatan } = req.params;
      const { username } = req.query;

      let results = {};

      const checkAnggaranDisetujui = await db.read.tb_anggaran_disetujui.findUnique({
         where: { id_usulan: Number.parseInt(id_usulan_kegiatan) },
         select: {
            id_usulan: true,
            jumlah: true,
         },
      });

      if (!checkAnggaranDisetujui) {
         const newDataAnggaran = await db.write.tb_anggaran_disetujui.create({
            data: {
               id_usulan: Number.parseInt(id_usulan_kegiatan),
               jumlah: 0,
            },
         });

         await logAudit("system", "CREATE", "tb_anggaran_disetujui", req.ip, { ...checkAnggaranDisetujui }, { ...newDataAnggaran });
      }

      const klaim = await db.read.tb_klaim_verifikasi.findFirst({
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

      results = await db.read.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id_usulan_kegiatan) },
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
                     where: { tahap_verifikasi: Number.parseInt(klaim.verikator_usulan.tahap) },
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

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const getReferensiSBM = async (req, res) => {
   try {
      const results = await db.read.tb_detail_harga_sbm.findMany({
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
};

module.exports = { getData, getDetail, getReferensiSBM };
