export const uploadDokumenSchema = {
   type: "object",
   required: ["id_usulan", "nama_dokumen", "tipe_dokumen"],
   properties: {
      id_usulan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan harus berupa angka",
            minimum: "ID usulan tidak valid",
         },
      },
      nama_dokumen: {
         type: "string",
         minLength: 3,
         maxLength: 255,
         errorMessage: {
            minLength: "Nama dokumen minimal 3 karakter",
            maxLength: "Nama dokumen maksimal 255 karakter",
         },
      },
      tipe_dokumen: {
         type: "string",
         enum: ["proposal", "tor", "rab", "surat_tugas", "laporan", "lainnya"],
         errorMessage: {
            enum: "Tipe dokumen tidak valid",
         },
      },
   },
   errorMessage: {
      required: {
         id_usulan: "ID usulan wajib diisi",
         nama_dokumen: "Nama dokumen wajib diisi",
         tipe_dokumen: "Tipe dokumen wajib dipilih",
      },
   },
};
