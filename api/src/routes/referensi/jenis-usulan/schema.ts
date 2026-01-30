export const create = {
   type: "object",
   required: ["nama", "is_aktif"],
   properties: {
      nama: { type: "string" },
      is_aktif: { type: "string", enum: ["AKTIF", "TIDAK_AKTIF"] },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama jenis usulan wajib diisi",
         is_aktif: "Status jenis usulan wajib dipilih",
      },
   },
};

export const update = {
   type: "object",
   required: ["nama", "is_aktif"],
   properties: {
      nama: { type: "string" },
      is_aktif: { type: "string", enum: ["AKTIF", "TIDAK_AKTIF"] },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama jenis usulan wajib diisi",
         is_aktif: "Status jenis usulan wajib dipilih",
      },
   },
};
