export const createVolumeKeluaranTorSchema = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: { type: "string" },
   },
   errorMessage: {
      type: "object",
      required: {
         nama: "Nama volume keluaran TOR wajib diisi",
      },
   },
};
