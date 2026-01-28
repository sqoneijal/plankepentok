export const createPenggunaSchema = {
   type: "object",
   required: ["username"],
   properties: {
      username: {
         type: "string",
         minLength: 3,
         maxLength: 100,
         pattern: String.raw`^[a-zA-Z0-9_\.]+$`,
         errorMessage: {
            type: "Username harus berupa teks",
            minLength: "Username minimal 3 karakter",
            maxLength: "Username maksimal 100 karakter",
            pattern: "Username hanya boleh huruf, angka, underscore, dan titik",
         },
      },
      fullname: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         errorMessage: {
            minLength: "Nama lengkap minimal 2 karakter",
            maxLength: "Nama lengkap maksimal 255 karakter",
         },
      },
      level_unit: {
         type: "string",
         enum: ["biro", "fakultas", "lembaga", "upt", "admin", "verifikator"],
         errorMessage: {
            enum: "Level unit tidak valid",
         },
      },
      id_roles: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            minimum: "ID role tidak valid",
         },
      },
   },
   errorMessage: {
      required: {
         username: "Username wajib diisi",
      },
   },
};

export const updatePenggunaSchema = {
   type: "object",
   properties: {
      fullname: {
         type: "string",
         minLength: 2,
         maxLength: 255,
         errorMessage: {
            minLength: "Nama lengkap minimal 2 karakter",
            maxLength: "Nama lengkap maksimal 255 karakter",
         },
      },
      level_unit: {
         type: "string",
         enum: ["biro", "fakultas", "lembaga", "upt", "admin", "verifikator"],
         errorMessage: {
            enum: "Level unit tidak valid",
         },
      },
      id_roles: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            minimum: "ID role tidak valid",
         },
      },
   },
};

export const assignPenggunaRoleSchema = {
   type: "object",
   required: ["id_pengguna"],
   properties: {
      id_pengguna: {
         type: "integer",
         minimum: 1,
         errorMessage: {
            minimum: "ID pengguna tidak valid",
         },
      },
      id_biro: { type: "integer", nullable: true },
      id_lembaga: { type: "integer", nullable: true },
      id_upt: { type: "integer", nullable: true },
      id_fakultas: { type: "integer", nullable: true },
      id_sub_unit: { type: "integer", nullable: true },
   },
   errorMessage: {
      required: {
         id_pengguna: "ID pengguna wajib diisi",
      },
   },
};
