const db = require("@/db.js");

const getData = async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;

      const total = await db.read.tb_usulan_kegiatan.count();
      const results = await db.read.tb_usulan_kegiatan.findMany({
         take: limit,
         skip: offset,
         orderBy: { id: "desc" },
         select: {
            id: true,
            kode: true,
            waktu_mulai: true,
            waktu_selesai: true,
            total_anggaran: true,
            status_usulan: true,
            rencana_total_anggaran: true,
            jenis_usulan: {
               select: {
                  id: true,
                  nama: true,
               },
            },
         },
      });
      return res.json({ results, total });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const getDaftarJenisUsulan = async (req, res) => {
   try {
      const results = await db.read.tb_jenis_usulan.findMany({
         where: { is_aktif: true },
         select: {
            id: true,
            nama: true,
         },
      });

      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const getReferensiSBM = async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [
            { standar_biaya: { nama: { contains: search, mode: "insensitive" } } },
            { standar_biaya: { deskripsi: { contains: search, mode: "insensitive" } } },
            { unit_satuan: { nama: { contains: search, mode: "insensitive" } } },
            { unit_satuan: { deskripsi: { contains: search, mode: "insensitive" } } },
         ],
      };
      const where = search ? query : {};

      const total = await db.read.tb_detail_harga_sbm.count({ where: { status_validasi: "valid", ...where } });
      const results = await db.read.tb_detail_harga_sbm.findMany({
         orderBy: { uploaded: "asc" },
         where: { status_validasi: "valid", ...where },
         take: limit,
         skip: offset,
         select: {
            id: true,
            id_standar_biaya: true,
            tahun_anggaran: true,
            harga_satuan: true,
            id_satuan: true,
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
                  deskripsi: true,
                  aktif: true,
               },
            },
         },
      });
      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
};

const getDetail = async (req, res) => {
   try {
      const { id } = req.params;

      const results = await db.read.tb_usulan_kegiatan.findUnique({
         where: { id: Number.parseInt(id) },
         select: {
            id: true,
            kode: true,
            latar_belakang: true,
            tujuan: true,
            sasaran: true,
            waktu_mulai: true,
            waktu_selesai: true,
            tempat_pelaksanaan: true,
            operator_input: true,
            total_anggaran: true,
            status_usulan: true,
            tanggal_submit: true,
            rencana_total_anggaran: true,
            catatan_perbaikan: true,
            id_jenis_usulan: true,
            unit_pengusul: {
               select: {
                  biro_master: {
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
                  lembaga_master: {
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
                  upt_master: {
                     select: {
                        id: true,
                        nama: true,
                     },
                  },
               },
            },
            jenis_usulan: {
               select: {
                  id: true,
                  nama: true,
               },
            },
            pengguna: {
               select: {
                  id: true,
                  fullname: true,
               },
            },
         },
      });
      return res.json({ results });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const getRelasiIKU = async (req, res) => {
   try {
      const { id } = req.params;

      const total = await db.read.tb_relasi_usulan_iku.count({
         where: { id_usulan: Number.parseInt(id) },
      });

      const results = await db.read.tb_relasi_usulan_iku.findMany({
         where: { id_usulan: Number.parseInt(id) },
         orderBy: { iku_master: { kode: "asc" } },
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
            usulan_kegiatan: {
               select: {
                  status_usulan: true,
                  verifikasi: {
                     where: {
                        table_referensi: "tb_relasi_usulan_iku",
                     },
                     select: {
                        id_referensi: true,
                        status: true,
                        catatan: true,
                     },
                  },
               },
            },
         },
      });

      return res.json({ results, total });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const getDaftarRabDetail = async (req, res) => {
   try {
      const { id } = req.params;

      const total = await db.read.tb_rab_detail.count({
         where: { id_usulan: Number.parseInt(id) },
      });

      const results = await db.read.tb_rab_detail.findMany({
         where: { id_usulan: Number.parseInt(id) },
         select: {
            id: true,
            uraian_biaya: true,
            qty: true,
            id_satuan: true,
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
            usulan_kegiatan: {
               select: {
                  status_usulan: true,
                  verifikasi: {
                     where: {
                        table_referensi: "tb_rab_detail",
                     },
                     select: {
                        id_referensi: true,
                        status: true,
                        catatan: true,
                     },
                  },
               },
            },
         },
      });

      res.json({ results, total });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

const getDaftarDokumenPendukung = async (req, res) => {
   try {
      const { id } = req.params;
      const where = { id_usulan: Number.parseInt(id) };

      const total = await db.read.tb_dokumen_pendukung.count({ where });
      const results = await db.read.tb_dokumen_pendukung.findMany({
         where,
         select: {
            id: true,
            nama_dokumen: true,
            tipe_dokumen: true,
            path_file: true,
            file_dokumen: true,
            usulan_kegiatan: {
               select: {
                  status_usulan: true,
                  verifikasi: {
                     where: {
                        table_referensi: "tb_dokumen_pendukung",
                     },
                     select: {
                        id_referensi: true,
                        status: true,
                        catatan: true,
                     },
                  },
               },
            },
         },
      });

      return res.json({
         results,
         total,
      });
   } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
   }
};

const getDaftarReferensiSBM = async (req, res) => {
   try {
      const limit = Number.parseInt(req.query.limit) || 25;
      const offset = Number.parseInt(req.query.offset) || 0;
      const search = req.query.search || "";

      const query = {
         OR: [
            { standar_biaya: { nama: { contains: search, mode: "insensitive" } } },
            { standar_biaya: { deskripsi: { contains: search, mode: "insensitive" } } },
            { unit_satuan: { nama: { contains: search, mode: "insensitive" } } },
            { unit_satuan: { deskripsi: { contains: search, mode: "insensitive" } } },
         ],
      };
      const where = search ? query : {};

      const total = await db.read.tb_detail_harga_sbm.count({ where: { status_validasi: "valid", ...where } });
      const results = await db.read.tb_detail_harga_sbm.findMany({
         orderBy: { uploaded: "asc" },
         where: { status_validasi: "valid", ...where },
         take: limit,
         skip: offset,
         select: {
            id: true,
            id_standar_biaya: true,
            tahun_anggaran: true,
            harga_satuan: true,
            id_satuan: true,
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
                  deskripsi: true,
                  aktif: true,
               },
            },
         },
      });
      res.json({ results, total });
   } catch (error) {
      res.json({ status: false, message: error.message });
   }
};

const getDetailRABDetail = async (req, res) => {
   try {
      const { id_usulan, id } = req.params;

      const results = await db.read.tb_rab_detail.findUnique({
         where: { id_usulan: Number.parseInt(id_usulan), id: Number.parseInt(id) },
      });
      return res.json({ results });
   } catch (error) {
      return res.json({ status: false, message: error.message });
   }
};

module.exports = {
   getDetailRABDetail,
   getData,
   getDaftarJenisUsulan,
   getReferensiSBM,
   getDetail,
   getRelasiIKU,
   getDaftarRabDetail,
   getDaftarDokumenPendukung,
   getDaftarReferensiSBM,
};
