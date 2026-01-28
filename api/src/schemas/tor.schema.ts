// src/schemas/tor.schema.ts
export const createTorSchema = {
   type: "object",
   required: ["id_usulan_kegiatan"],
   properties: {
      id_usulan_kegiatan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan kegiatan harus berupa angka",
            minimum: "ID usulan kegiatan tidak valid",
         },
      },
      penyelenggara: {
         type: "string",
         maxLength: 500,
         errorMessage: {
            maxLength: "Penyelenggara maksimal 500 karakter",
         },
      },
      program: {
         type: "string",
         maxLength: 500,
         errorMessage: {
            maxLength: "Program maksimal 500 karakter",
         },
      },
      kegiatan: {
         type: "string",
         maxLength: 500,
         errorMessage: {
            maxLength: "Kegiatan maksimal 500 karakter",
         },
      },
      ikk: {
         type: "string",
         maxLength: 500,
         errorMessage: {
            maxLength: "IKK maksimal 500 karakter",
         },
      },
      satuan_ukuran_keluaran: {
         type: "string",
         maxLength: 255,
      },
      dasar_hukum: { type: "string" },
      gambaran_umum: { type: "string" },
      alasan_kegiatan: { type: "string" },
      uraian_kegiatan: { type: "string" },
      batasan_kegiatan: { type: "string" },
      maksud_kegiatan: { type: "string" },
      tujuan_kegiatan: { type: "string" },
      indikator_keluaran: { type: "string" },
      keluaran: { type: "string" },
      metode_pelaksanaan: { type: "string" },
      tahapan_kegiatan: { type: "string" },
      tempat_pelaksanaan: { type: "string" },
      pelaksana_kegiatan: { type: "string" },
      penanggung_jawab: { type: "string" },
      jadwal_kegiatan: { type: "string" },
      biaya: { type: "string" },
      jenis_keluaran: {
         type: "array",
         items: { type: "integer" },
      },
      penerima_manfaat: {
         type: "array",
         items: { type: "integer" },
      },
      volume_keluaran: {
         type: "array",
         items: { type: "integer" },
      },
   },
   errorMessage: {
      required: {
         id_usulan_kegiatan: "ID usulan kegiatan wajib diisi",
      },
   },
};

export const updateTorSchema = {
   type: "object",
   properties: {
      penyelenggara: { type: "string", maxLength: 500 },
      program: { type: "string", maxLength: 500 },
      kegiatan: { type: "string", maxLength: 500 },
      ikk: { type: "string", maxLength: 500 },
      satuan_ukuran_keluaran: { type: "string", maxLength: 255 },
      dasar_hukum: { type: "string" },
      gambaran_umum: { type: "string" },
      alasan_kegiatan: { type: "string" },
      uraian_kegiatan: { type: "string" },
      batasan_kegiatan: { type: "string" },
      maksud_kegiatan: { type: "string" },
      tujuan_kegiatan: { type: "string" },
      indikator_keluaran: { type: "string" },
      keluaran: { type: "string" },
      metode_pelaksanaan: { type: "string" },
      tahapan_kegiatan: { type: "string" },
      tempat_pelaksanaan: { type: "string" },
      pelaksana_kegiatan: { type: "string" },
      penanggung_jawab: { type: "string" },
      jadwal_kegiatan: { type: "string" },
      biaya: { type: "string" },
      jenis_keluaran: {
         type: "array",
         items: { type: "integer" },
      },
      penerima_manfaat: {
         type: "array",
         items: { type: "integer" },
      },
      volume_keluaran: {
         type: "array",
         items: { type: "integer" },
      },
   },
};
