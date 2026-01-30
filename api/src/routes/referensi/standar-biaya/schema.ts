export const create = {
   type: "object",
   required: ["nama", "kode", "id_kategori", "id_unit_satuan"],
   properties: {
      nama: { type: "string" },
      kode: { type: "string" },
      id_kategori: { type: "number" },
      id_unit_satuan: { type: "number" },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama standar wajib diisi",
         kode: "Kode standar wajib diisi",
         id_kategori: "Kategori SBM wajib dipilih",
         id_unit_satuan: "Unit satuan wajib dipilih",
      },
   },
};

export const update = {
   type: "object",
   required: ["nama", "kode", "id_kategori", "id_unit_satuan"],
   properties: {
      nama: { type: "string" },
      kode: { type: "string" },
      id_kategori: { type: "number" },
      id_unit_satuan: { type: "number" },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama standar wajib diisi",
         kode: "Kode standar wajib diisi",
         id_kategori: "Kategori SBM wajib dipilih",
         id_unit_satuan: "Unit satuan wajib dipilih",
      },
   },
};
