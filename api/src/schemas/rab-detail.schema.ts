export const createRabDetailSchema = {
   type: "object",
   required: ["id_usulan", "uraian_biaya", "qty", "id_satuan", "harga_satuan"],
   properties: {
      id_usulan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan harus berupa angka",
            minimum: "ID usulan tidak valid",
            required: "ID usulan wajib diisi",
         },
      },
      uraian_biaya: {
         type: "string",
         minLength: 3,
         maxLength: 500,
         isNotEmpty: true,
         errorMessage: {
            type: "Uraian biaya harus berupa teks",
            minLength: "Uraian biaya minimal 3 karakter",
            maxLength: "Uraian biaya maksimal 500 karakter",
            isNotEmpty: "Uraian biaya tidak boleh kosong",
         },
      },
      qty: {
         type: "number",
         minimum: 0.01,
         errorMessage: {
            type: "Quantity harus berupa angka",
            minimum: "Quantity minimal 0.01",
         },
      },
      id_satuan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID satuan harus berupa angka",
            minimum: "ID satuan tidak valid",
         },
      },
      harga_satuan: {
         type: "number",
         minimum: 0,
         errorMessage: {
            type: "Harga satuan harus berupa angka",
            minimum: "Harga satuan tidak boleh negatif",
         },
      },
      catatan: {
         type: "string",
         maxLength: 1000,
         errorMessage: {
            maxLength: "Catatan maksimal 1000 karakter",
         },
      },
   },
   errorMessage: {
      required: {
         id_usulan: "ID usulan wajib diisi",
         uraian_biaya: "Uraian biaya wajib diisi",
         qty: "Quantity wajib diisi",
         id_satuan: "Satuan wajib dipilih",
         harga_satuan: "Harga satuan wajib diisi",
      },
   },
};

export const updateRabDetailSchema = {
   type: "object",
   properties: {
      uraian_biaya: {
         type: "string",
         minLength: 3,
         maxLength: 500,
         errorMessage: {
            type: "Uraian biaya harus berupa teks",
            minLength: "Uraian biaya minimal 3 karakter",
            maxLength: "Uraian biaya maksimal 500 karakter",
         },
      },
      qty: {
         type: "number",
         minimum: 0.01,
         errorMessage: {
            type: "Quantity harus berupa angka",
            minimum: "Quantity minimal 0.01",
         },
      },
      id_satuan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID satuan harus berupa angka",
            minimum: "ID satuan tidak valid",
         },
      },
      harga_satuan: {
         type: "number",
         minimum: 0,
         errorMessage: {
            type: "Harga satuan harus berupa angka",
            minimum: "Harga satuan tidak boleh negatif",
         },
      },
      catatan: {
         type: "string",
         maxLength: 1000,
         errorMessage: {
            maxLength: "Catatan maksimal 1000 karakter",
         },
      },
   },
};

export const bulkCreateRabDetailSchema = {
   type: "object",
   required: ["id_usulan", "items"],
   properties: {
      id_usulan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID usulan harus berupa angka",
            minimum: "ID usulan tidak valid",
         },
      },
      items: {
         type: "array",
         minItems: 1,
         maxItems: 100,
         items: {
            type: "object",
            required: ["uraian_biaya", "qty", "id_satuan", "harga_satuan"],
            properties: {
               uraian_biaya: { type: "string", minLength: 3, maxLength: 500 },
               qty: { type: "number", minimum: 0.01 },
               id_satuan: { type: "integer", minimum: 1 },
               harga_satuan: { type: "number", minimum: 0 },
               catatan: { type: "string", maxLength: 1000 },
            },
         },
         errorMessage: {
            minItems: "Minimal 1 item RAB",
            maxItems: "Maksimal 100 item RAB per request",
         },
      },
   },
   errorMessage: {
      required: {
         id_usulan: "ID usulan wajib diisi",
         items: "Items wajib diisi",
      },
   },
};
