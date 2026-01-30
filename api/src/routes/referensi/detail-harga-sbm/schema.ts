export const create = {
   type: "object",
   required: ["id_standar_biaya", "tahun_anggaran", "harga_satuan", "id_satuan", "tanggal_mulai_efektif", "tanggal_akhir_efektif", "status_validasi"],
   properties: {
      id_standar_biaya: { type: "number" },
      tahun_anggaran: { type: "number" },
      harga_satuan: { type: "number" },
      id_satuan: { type: "number" },
      tanggal_mulai_efektif: { type: "string", format: "date" },
      tanggal_akhir_efektif: { type: "string", format: "date" },
      status_validasi: { type: "string", enum: ["DRAFT", "VALID", "KADALUARSA"] },
   },
   errorMessage: {
      type: "object",
      required: {
         id_standar_biaya: "Standar biaya wajib dipilih",
         tahun_anggaran: "Tahun anggaran wajib dipilih",
         harga_satuan: "Harga satuan wajib diisi",
         id_satuan: "Unit satuan wajib dipilih",
         tanggal_mulai_efektif: "Tanggal mulai efektif wajib dipilih",
         tanggal_akhir_efektif: "Tanggal akhir efektif wajib dipilih",
         status_validasi: "Status wajib dipilih",
      },
   },
};

export const update = {
   type: "object",
   required: ["id_standar_biaya", "tahun_anggaran", "harga_satuan", "id_satuan", "tanggal_mulai_efektif", "tanggal_akhir_efektif", "status_validasi"],
   properties: {
      id_standar_biaya: { type: "number" },
      tahun_anggaran: { type: "number" },
      harga_satuan: { type: "number" },
      id_satuan: { type: "number" },
      tanggal_mulai_efektif: { type: "string", format: "date" },
      tanggal_akhir_efektif: { type: "string", format: "date" },
      status_validasi: {
         type: "string",
         enum: ["DRAFT", "VALID", "KADALUARSA"],
      },
   },
   errorMessage: {
      type: "object",
      required: {
         id_standar_biaya: "Standar biaya wajib dipilih",
         tahun_anggaran: "Tahun anggaran wajib dipilih",
         harga_satuan: "Harga satuan wajib diisi",
         id_satuan: "Unit satuan wajib dipilih",
         tanggal_mulai_efektif: "Tanggal mulai efektif wajib dipilih",
         tanggal_akhir_efektif: "Tanggal akhir efektif wajib dipilih",
         status_validasi: "Status wajib dipilih",
      },
   },
};
