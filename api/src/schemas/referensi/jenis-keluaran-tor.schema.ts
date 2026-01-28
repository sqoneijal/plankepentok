export const createJenisKeluaranTorSchema = {
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
