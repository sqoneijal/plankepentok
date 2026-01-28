export interface KeycloakUser {
   sub: string;
   email_verified: boolean;
   name: string;
   preferred_username: string;
   given_name: string;
   family_name: string;
   email: string;
   realm_access?: {
      roles: Array<string>;
   };
   resource_access?: {
      [key: string]: {
         roles: Array<string>;
      };
   };
}

declare module "fastify" {
   interface FastifyRequest {
      user?: KeycloakUser;
   }
}

export interface PaginationQuery {
   page?: number;
   limit?: number;
   search?: string;
   sortBy?: string;
   sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T = any> {
   success: boolean;
   message: string;
   data?: T;
   meta?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
   errors?: Array<any>;
}

// DTOs for Usulan Kegiatan
export interface CreateUsulanKegiatanDTO {
   latar_belakang?: string;
   tujuan?: string;
   sasaran?: string;
   waktu_mulai?: string;
   waktu_selesai?: string;
   tempat_pelaksanaan?: string;
   id_jenis_usulan?: number;
   id_pengaturan?: number;
   rencana_total_anggaran?: number;
}

export interface UpdateUsulanKegiatanDTO extends Partial<CreateUsulanKegiatanDTO> {
   status_usulan?: string;
   catatan_perbaikan?: string;
}

// DTOs for RAB Detail
export interface CreateRabDetailDTO {
   id_usulan: number;
   uraian_biaya: string;
   qty: number;
   id_satuan: number;
   harga_satuan: number;
   catatan?: string;
}

export interface UpdateRabDetailDTO extends Partial<CreateRabDetailDTO> {}

// DTOs for Master Data
export interface CreateMasterDataDTO {
   nama: string;
}

export interface UpdateMasterDataDTO {
   nama?: string;
}

// DTOs for Verifikasi
export interface CreateVerifikasiDTO {
   id_usulan_kegiatan: number;
   id_referensi?: number;
   table_referensi?: string;
   status: string;
   catatan?: string;
   tahap?: number;
}
