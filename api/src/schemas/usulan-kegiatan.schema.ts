export const createUsulanKegiatanSchema = {
   type: "object",
   required: ["id_jenis_usulan", "id_pengaturan"],
   properties: {
      latar_belakang: {
         type: "string",
         minLength: 10,
         maxLength: 5000,
         errorMessage: {
            type: "Latar belakang harus berupa teks",
            minLength: "Latar belakang minimal 10 karakter",
            maxLength: "Latar belakang maksimal 5000 karakter",
         },
      },
      tujuan: {
         type: "string",
         minLength: 10,
         maxLength: 2000,
         errorMessage: {
            type: "Tujuan harus berupa teks",
            minLength: "Tujuan minimal 10 karakter",
            maxLength: "Tujuan maksimal 2000 karakter",
         },
      },
      sasaran: {
         type: "string",
         maxLength: 500,
         errorMessage: {
            type: "Sasaran harus berupa teks",
            maxLength: "Sasaran maksimal 500 karakter",
         },
      },
      waktu_mulai: {
         type: "string",
         format: "date",
         errorMessage: {
            type: "Waktu mulai harus berupa teks",
            format: "Format waktu mulai tidak valid (YYYY-MM-DD)",
         },
      },
      waktu_selesai: {
         type: "string",
         format: "date",
         errorMessage: {
            type: "Waktu selesai harus berupa teks",
            format: "Format waktu selesai tidak valid (YYYY-MM-DD)",
         },
      },
      tempat_pelaksanaan: {
         type: "string",
         maxLength: 255,
         errorMessage: {
            type: "Tempat pelaksanaan harus berupa teks",
            maxLength: "Tempat pelaksanaan maksimal 255 karakter",
         },
      },
      id_jenis_usulan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID jenis usulan harus berupa angka",
            minimum: "ID jenis usulan tidak valid",
         },
      },
      id_pengaturan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID pengaturan harus berupa angka",
            minimum: "ID pengaturan tidak valid",
         },
      },
      rencana_total_anggaran: {
         type: "number",
         minimum: 0,
         errorMessage: {
            type: "Rencana total anggaran harus berupa angka",
            minimum: "Rencana total anggaran tidak boleh negatif",
         },
      },
      // Untuk unit pengusul
      unit_pengusul: {
         type: "object",
         properties: {
            id_biro: { type: "integer", nullable: true },
            id_lembaga: { type: "integer", nullable: true },
            id_upt: { type: "integer", nullable: true },
            id_fakultas: { type: "integer", nullable: true },
            id_sub_unit: { type: "integer", nullable: true },
         },
         errorMessage: {
            type: "Unit pengusul harus berupa objek",
         },
      },
   },
   errorMessage: {
      required: {
         id_jenis_usulan: "Jenis usulan wajib dipilih",
         id_pengaturan: "Tahun anggaran wajib dipilih",
      },
   },
};

export const updateUsulanKegiatanSchema = {
   type: "object",
   properties: {
      ...createUsulanKegiatanSchema.properties,
      status_usulan: {
         type: "string",
         enum: ["draft", "submitted", "review", "revision", "approved", "rejected"],
         errorMessage: {
            enum: "Status usulan tidak valid",
         },
      },
      catatan_perbaikan: {
         type: "string",
         maxLength: 2000,
         errorMessage: {
            maxLength: "Catatan perbaikan maksimal 2000 karakter",
         },
      },
   },
};

export const submitUsulanSchema = {
   type: "object",
   required: ["id"],
   properties: {
      id: {
         type: "integer",
         errorMessage: {
            type: "ID harus berupa angka",
         },
      },
   },
   errorMessage: {
      required: {
         id: "ID usulan wajib diisi",
      },
   },
};

export const filterUsulanSchema = {
   type: "object",
   properties: {
      page: { type: "integer", minimum: 1, default: 1 },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
      search: { type: "string" },
      status_usulan: {
         type: "string",
         enum: ["draft", "submitted", "review", "revision", "approved", "rejected"],
      },
      id_jenis_usulan: { type: "integer" },
      tahun_anggaran: { type: "integer", minimum: 2000, maximum: 2100 },
      sortBy: { type: "string", default: "uploaded" },
      sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
   },
};
