export const create = {
   type: "object",
   required: ["nama", "kode"],
   properties: {
      nama: { type: "string" },
      kode: { type: "string" },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama kategori wajib diisi",
         kode: "Kode kategori wajib diisi",
      },
   },
};

export const update = {
   type: "object",
   required: ["nama", "kode"],
   properties: {
      nama: { type: "string" },
      kode: { type: "string" },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama kategori wajib diisi",
         kode: "Kode kategori wajib diisi",
      },
   },
};
