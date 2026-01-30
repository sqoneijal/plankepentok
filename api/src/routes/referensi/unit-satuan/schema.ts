export const create = {
   type: "object",
   required: ["nama", "aktif"],
   properties: {
      nama: { type: "string" },
      aktif: { type: "string", enum: ["AKTIF", "TIDAK_AKTIF"] },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama unit satuan wajib diisi",
         aktif: "Status unit satuan wajib dipilih",
      },
   },
};

export const update = {
   type: "object",
   required: ["nama", "aktif"],
   properties: {
      nama: { type: "string" },
      aktif: { type: "string", enum: ["AKTIF", "TIDAK_AKTIF"] },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama unit satuan wajib diisi",
         aktif: "Status unit satuan wajib dipilih",
      },
   },
};
