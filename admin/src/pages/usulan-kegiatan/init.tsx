import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { buatAlias } from "@/helpers/init";
import { usePegawai } from "@/helpers/simpeg";
import { UseAuth } from "@/hooks/auth-context";
import { useHeaderButton, useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePostMutation } from "@/hooks/usePostMutation";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function useInitPage() {
   const { setButton } = useHeaderButton();
   const { pagination } = useTablePagination();
   const { user } = UseAuth();
   const { data: dataPegawai, isLoading: isLoadingPegawai } = usePegawai(user?.preferred_username);

   const [search, setSearch] = useState("");

   const navigate = useNavigate();

   const { mutate, isPending } = usePostMutation<
      { kode: string; unit_pengusul: string; id_unit_pengusul: string; tempat_pelaksanaan: string },
      unknown
   >("/usulan-kegiatan", (data) => ({ ...data }), [[`/usulan-kegiatan`]]);

   useEffect(() => {
      if (!isLoadingPegawai && Object.keys(dataPegawai).length > 0) {
         const now = new Date();
         const formatted =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0");

         setButton(
            <Button
               variant="outline"
               disabled={isPending}
               onClick={() =>
                  mutate(
                     {
                        kode: `${buatAlias(dataPegawai?.unitKerjaSaatIni?.[0]?.bagian?.nama)}${formatted}`,
                        unit_pengusul: dataPegawai?.unitKerjaSaatIni?.[0]?.bagian?.nama,
                        id_unit_pengusul: dataPegawai?.unitKerjaSaatIni?.[0]?.bagian?.id,
                        tempat_pelaksanaan: dataPegawai?.unitKerjaSaatIni?.[0]?.bagian?.nama,
                     },
                     {
                        onSuccess: (response: { status?: boolean; message?: string; id_usulan_kegiatan?: number }) => {
                           if (response?.status) {
                              navigate(`/usulan-kegiatan/actions/${response?.id_usulan_kegiatan}`);
                              return;
                           }
                           toast.error(response?.message);
                        },
                        onError: (error: Error) => {
                           toast.error(`Gagal: ${error?.message}`);
                        },
                     }
                  )
               }>
               {isPending && <Spinner />}Tambah Usulan Kegiatan
            </Button>
         );
      }
      return () => {
         setButton(<div />);
      };
   }, [setButton, isPending, isLoadingPegawai, dataPegawai, navigate, mutate]);

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const { data, isLoading, error } = useApiQuery({
      url: "/usulan-kegiatan",
      params: { limit, offset, search },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = data?.results ?? [];
   const total = data?.total ?? 0;

   return { results, total, isLoading, search, setSearch };
}
