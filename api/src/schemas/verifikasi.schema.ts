export const createVerifikasiSchema = {
   type: "object",
   required: ["id_usulan_kegiatan", "status"],
   properties: {
      id_usulan_kegiatan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan kegiatan harus berupa angka",
            minimum: "ID usulan kegiatan tidak valid",
         },
      },
      id_referensi: {
         type: "integer",
         nullable: true,
         errorMessage: {
            type: "ID referensi harus berupa angka",
         },
      },
      table_referensi: {
         type: "string",
         maxLength: 100,
         errorMessage: {
            maxLength: "Table referensi maksimal 100 karakter",
         },
      },
      status: {
         type: "string",
         enum: ["pending", "approved", "rejected", "revision"],
         errorMessage: {
            enum: "Status harus salah satu dari: pending, approved, rejected, revision",
         },
      },
      catatan: {
         type: "string",
         maxLength: 2000,
         errorMessage: {
            maxLength: "Catatan maksimal 2000 karakter",
         },
      },
      tahap: {
         type: "integer",
         minimum: 1,
         maximum: 10,
         default: 1,
         errorMessage: {
            minimum: "Tahap minimal 1",
            maximum: "Tahap maksimal 10",
         },
      },
   },
   errorMessage: {
      required: {
         id_usulan_kegiatan: "ID usulan kegiatan wajib diisi",
         status: "Status verifikasi wajib diisi",
      },
   },
};

export const approveUsulanSchema = {
   type: "object",
   required: ["id_usulan_kegiatan"],
   properties: {
      id_usulan_kegiatan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan kegiatan harus berupa angka",
         },
      },
      jumlah_disetujui: {
         type: "number",
         minimum: 0,
         errorMessage: {
            type: "Jumlah disetujui harus berupa angka",
            minimum: "Jumlah disetujui tidak boleh negatif",
         },
      },
      catatan: {
         type: "string",
         maxLength: 2000,
      },
   },
   errorMessage: {
      required: {
         id_usulan_kegiatan: "ID usulan kegiatan wajib diisi",
      },
   },
};

export const rejectUsulanSchema = {
   type: "object",
   required: ["id_usulan_kegiatan", "catatan"],
   properties: {
      id_usulan_kegiatan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan kegiatan harus berupa angka",
         },
      },
      catatan: {
         type: "string",
         minLength: 10,
         maxLength: 2000,
         errorMessage: {
            minLength: "Alasan penolakan minimal 10 karakter",
            maxLength: "Alasan penolakan maksimal 2000 karakter",
         },
      },
   },
   errorMessage: {
      required: {
         id_usulan_kegiatan: "ID usulan kegiatan wajib diisi",
         catatan: "Alasan penolakan wajib diisi",
      },
   },
};

export const revisionUsulanSchema = {
   type: "object",
   required: ["id_usulan_kegiatan", "catatan"],
   properties: {
      id_usulan_kegiatan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan kegiatan harus berupa angka",
         },
      },
      catatan: {
         type: "string",
         minLength: 10,
         maxLength: 2000,
         errorMessage: {
            minLength: "Catatan perbaikan minimal 10 karakter",
            maxLength: "Catatan perbaikan maksimal 2000 karakter",
         },
      },
   },
   errorMessage: {
      required: {
         id_usulan_kegiatan: "ID usulan kegiatan wajib diisi",
         catatan: "Catatan perbaikan wajib diisi",
      },
   },
};
