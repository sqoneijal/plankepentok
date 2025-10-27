import keycloakInstance from "@/hooks/keycloak";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const getAuthHeaders = async (): Promise<Record<string, string>> => {
   if (keycloakInstance?.token) {
      if (keycloakInstance.isTokenExpired()) {
         await keycloakInstance.updateToken(30);
      }
      return { Authorization: `Bearer ${keycloakInstance.token}` };
   }
   return {};
};

export const useCariUnitPegawai = (pegawaiId: string | undefined) => {
   return useQuery({
      queryKey: ["cari-unit-pegawai", pegawaiId],
      queryFn: async () => {
         const headers = await getAuthHeaders();
         const response = await axios.post(
            import.meta.env.VITE_API_SIMPEG,
            {
               query: `
               query Pegawai($pegawaiId: ID!) {
                  pegawai(id: $pegawaiId) {
                     id
                     unitKerjaSaatIni {
                        bagian {
                           nama
                           id
                        }
                        unitKerja {
                           id
                           nama
                        }
                     }
                  }
               }
            `,
               variables: {
                  pegawaiId,
               },
            },
            { headers }
         );

         const unitKerjaSaatIni = response.data.data.pegawai.unitKerjaSaatIni;
         if (unitKerjaSaatIni.length > 0) {
            return unitKerjaSaatIni[0];
         }
         toast.error("Apakah benar anda pegawai UIN Ar Raniry.");
      },
      enabled: !!pegawaiId,
   });
};

export const usePegawai = (pegawaiId: string | undefined) => {
   return useQuery({
      queryKey: ["pegawai", pegawaiId],
      queryFn: async () => {
         const headers = await getAuthHeaders();
         const response = await axios.post(
            import.meta.env.VITE_API_SIMPEG,
            {
               query: `
               query Pegawai($pegawaiId: ID!) {
                  pegawai(id: $pegawaiId) {
                     nama
                     id
                     unitKerjaSaatIni {
                        bagian {
                           id
                           nama
                        }
                     }
                  }
               }
            `,
               variables: {
                  pegawaiId,
               },
            },
            { headers }
         );

         return response.data.data.pegawai;
      },
      enabled: !!pegawaiId,
   });
};

export const useCariPegawai = (query: string | undefined) => {
   return useQuery({
      queryKey: ["pegawai", query],
      queryFn: async () => {
         const headers = await getAuthHeaders();
         const response = await axios.post(
            import.meta.env.VITE_API_SIMPEG,
            {
               query: `query Pegawai($filter: PegawaiFilterInput) {
                     daftarPegawai(filter: $filter) {
                        pegawai {
                           nama
                           id
                           statusAktif {
                              isActive
                           }
                        }
                     }
                  }`,
               variables: {
                  filter: {
                     searchString: query,
                  },
               },
            },
            { headers }
         );

         return response?.data?.data?.daftarPegawai?.pegawai || [];
      },
      enabled: !!query,
   });
};

export const useUnitKerja = (id_unit_kerja: string | undefined) => {
   return useQuery({
      queryKey: ["unit-kerja", id_unit_kerja],
      queryFn: async () => {
         const headers = await getAuthHeaders();
         const response = await axios.post(
            import.meta.env.VITE_API_SIMPEG,
            {
               query: `
               query UnitKerja {
                  daftarBagianUnitKerja {
                     id
                     nama
                  }
               }
            `,
            },
            { headers }
         );

         const daftarBagianUnitKerja = response.data.data.daftarBagianUnitKerja;

         return daftarBagianUnitKerja.find((e: { id: string; nama: string }) => e.id === id_unit_kerja)?.nama;
      },
      enabled: !!id_unit_kerja,
   });
};
