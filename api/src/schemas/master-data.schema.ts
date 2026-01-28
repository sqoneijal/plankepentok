// Biro Master
export const createBiroSchema = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         isNotEmpty: true,
         errorMessage: {
            type: "Nama biro harus berupa teks",
            minLength: "Nama biro minimal 2 karakter",
            maxLength: "Nama biro maksimal 255 karakter",
            isNotEmpty: "Nama biro tidak boleh kosong",
         },
      },
   },
   errorMessage: {
      required: {
         nama: "Nama biro wajib diisi",
      },
   },
};

// Fakultas Master
export const createFakultasSchema = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         isNotEmpty: true,
         errorMessage: {
            type: "Nama fakultas harus berupa teks",
            minLength: "Nama fakultas minimal 2 karakter",
            maxLength: "Nama fakultas maksimal 255 karakter",
            isNotEmpty: "Nama fakultas tidak boleh kosong",
         },
      },
   },
   errorMessage: {
      required: {
         nama: "Nama fakultas wajib diisi",
      },
   },
};

// Lembaga Master
export const createLembagaSchema = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         isNotEmpty: true,
         errorMessage: {
            type: "Nama lembaga harus berupa teks",
            minLength: "Nama lembaga minimal 2 karakter",
            maxLength: "Nama lembaga maksimal 255 karakter",
            isNotEmpty: "Nama lembaga tidak boleh kosong",
         },
      },
   },
   errorMessage: {
      required: {
         nama: "Nama lembaga wajib diisi",
      },
   },
};

// UPT Master
export const createUptSchema = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         isNotEmpty: true,
         errorMessage: {
            type: "Nama UPT harus berupa teks",
            minLength: "Nama UPT minimal 2 karakter",
            maxLength: "Nama UPT maksimal 255 karakter",
            isNotEmpty: "Nama UPT tidak boleh kosong",
         },
      },
   },
   errorMessage: {
      required: {
         nama: "Nama UPT wajib diisi",
      },
   },
};

// Prodi Master
export const createProdiSchema = {
   type: "object",
   required: ["nama", "id_fakultas"],
   properties: {
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         errorMessage: {
            type: "Nama prodi harus berupa teks",
            minLength: "Nama prodi minimal 2 karakter",
            maxLength: "Nama prodi maksimal 255 karakter",
         },
      },
      id_fakultas: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            type: "ID fakultas harus berupa angka",
            minimum: "ID fakultas tidak valid",
         },
      },
   },
   errorMessage: {
      required: {
         nama: "Nama prodi wajib diisi",
         id_fakultas: "Fakultas wajib dipilih",
      },
   },
};

// Sub Unit
export const createSubUnitSchema = {
   type: "object",
   required: ["nama", "level"],
   properties: {
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         errorMessage: {
            type: "Nama sub unit harus berupa teks",
            minLength: "Nama sub unit minimal 2 karakter",
            maxLength: "Nama sub unit maksimal 255 karakter",
         },
      },
      level: {
         type: "string",
         enum: ["biro", "fakultas", "lembaga", "upt"],
         errorMessage: {
            enum: "Level harus salah satu dari: biro, fakultas, lembaga, upt",
         },
      },
      id_biro: { type: "integer", nullable: true },
      id_lembaga: { type: "integer", nullable: true },
      id_upt: { type: "integer", nullable: true },
      id_fakultas: { type: "integer", nullable: true },
   },
   errorMessage: {
      required: {
         nama: "Nama sub unit wajib diisi",
         level: "Level wajib dipilih",
      },
   },
};

// Unit Satuan
export const createUnitSatuanSchema = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: {
         type: "string",
         minLength: 1,
         maxLength: 50,
         errorMessage: {
            minLength: "Nama satuan minimal 1 karakter",
            maxLength: "Nama satuan maksimal 50 karakter",
         },
      },
      deskripsi: {
         type: "string",
         maxLength: 255,
         errorMessage: {
            maxLength: "Deskripsi maksimal 255 karakter",
         },
      },
      aktif: {
         type: "boolean",
         default: true,
      },
   },
   errorMessage: {
      required: {
         nama: "Nama satuan wajib diisi",
      },
   },
};

// Jenis Usulan
export const createJenisUsulanSchema = {
   type: "object",
   required: ["nama"],
   properties: {
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         errorMessage: {
            minLength: "Nama jenis usulan minimal 2 karakter",
            maxLength: "Nama jenis usulan maksimal 255 karakter",
         },
      },
      is_aktif: {
         type: "boolean",
         default: true,
      },
   },
   errorMessage: {
      required: {
         nama: "Nama jenis usulan wajib diisi",
      },
   },
};

// Pengaturan (Tahun Anggaran)
export const createPengaturanSchema = {
   type: "object",
   required: ["tahun_anggaran"],
   properties: {
      tahun_anggaran: {
         type: "integer",
         minimum: 2000,
         maximum: 2100,
         errorMessage: {
            type: "Tahun anggaran harus berupa angka",
            minimum: "Tahun anggaran minimal 2000",
            maximum: "Tahun anggaran maksimal 2100",
         },
      },
      total_pagu: {
         type: "number",
         minimum: 0,
         default: 0,
         errorMessage: {
            minimum: "Total pagu tidak boleh negatif",
         },
      },
      is_aktif: {
         type: "boolean",
         default: true,
      },
   },
   errorMessage: {
      required: {
         tahun_anggaran: "Tahun anggaran wajib diisi",
      },
   },
};

// IKU Master
export const createIkuSchema = {
   type: "object",
   required: ["kode", "deskripsi"],
   properties: {
      jenis: {
         type: "string",
         maxLength: 100,
         errorMessage: {
            maxLength: "Jenis maksimal 100 karakter",
         },
      },
      kode: {
         type: "string",
         minLength: 1,
         maxLength: 50,
         pattern: String.raw`^[A-Z0-9\-\.]+$`,
         errorMessage: {
            minLength: "Kode IKU minimal 1 karakter",
            maxLength: "Kode IKU maksimal 50 karakter",
            pattern: "Kode IKU hanya boleh huruf kapital, angka, strip, dan titik",
         },
      },
      deskripsi: {
         type: "string",
         minLength: 5,
         maxLength: 1000,
         errorMessage: {
            minLength: "Deskripsi minimal 5 karakter",
            maxLength: "Deskripsi maksimal 1000 karakter",
         },
      },
      tahun_berlaku: {
         type: "integer",
         minimum: 2000,
         maximum: 2100,
         errorMessage: {
            minimum: "Tahun berlaku minimal 2000",
            maximum: "Tahun berlaku maksimal 2100",
         },
      },
   },
   errorMessage: {
      required: {
         kode: "Kode IKU wajib diisi",
         deskripsi: "Deskripsi IKU wajib diisi",
      },
   },
};

// Standar Biaya Master
export const createStandarBiayaSchema = {
   type: "object",
   required: ["kode", "nama"],
   properties: {
      kode: {
         type: "string",
         minLength: 1,
         maxLength: 50,
         errorMessage: {
            minLength: "Kode standar biaya minimal 1 karakter",
            maxLength: "Kode standar biaya maksimal 50 karakter",
         },
      },
      nama: {
         type: "string",
         minLength: 3,
         maxLength: 255,
         errorMessage: {
            minLength: "Nama standar biaya minimal 3 karakter",
            maxLength: "Nama standar biaya maksimal 255 karakter",
         },
      },
      deskripsi: {
         type: "string",
         maxLength: 500,
         errorMessage: {
            maxLength: "Deskripsi maksimal 500 karakter",
         },
      },
      id_kategori: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            minimum: "ID kategori tidak valid",
         },
      },
      id_unit_satuan: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            minimum: "ID unit satuan tidak valid",
         },
      },
   },
   errorMessage: {
      required: {
         kode: "Kode standar biaya wajib diisi",
         nama: "Nama standar biaya wajib diisi",
      },
   },
};

// Kategori SBM
export const createKategoriSbmSchema = {
   type: "object",
   required: ["kode", "nama"],
   properties: {
      kode: {
         type: "string",
         minLength: 1,
         maxLength: 50,
         errorMessage: {
            minLength: "Kode kategori minimal 1 karakter",
            maxLength: "Kode kategori maksimal 50 karakter",
         },
      },
      nama: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         errorMessage: {
            minLength: "Nama kategori minimal 2 karakter",
            maxLength: "Nama kategori maksimal 255 karakter",
         },
      },
      deskripsi: {
         type: "string",
         maxLength: 500,
         errorMessage: {
            maxLength: "Deskripsi maksimal 500 karakter",
         },
      },
   },
   errorMessage: {
      required: {
         kode: "Kode kategori wajib diisi",
         nama: "Nama kategori wajib diisi",
      },
   },
};
