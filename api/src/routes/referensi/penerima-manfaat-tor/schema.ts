export const create = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: { type: "string" },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama jenis keluaran TOR wajib diisi",
      },
   },
};

export const update = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: { type: "string" },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama jenis keluaran TOR wajib diisi",
      },
   },
};
