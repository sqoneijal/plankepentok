import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { buatAlias, objectLength } from "@/helpers/init";
import { usePegawai } from "@/helpers/simpeg";
import { UseAuth } from "@/hooks/auth-context";
import { useHeaderButton } from "@/hooks/store";
import { usePostMutation } from "@/hooks/usePostMutation";
import { FormInput } from "@/lib/helpers";
import { useGetQuery } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getColumns } from "./column";

const endpoint = "/usulan-kegiatan";

export default function Page() {
   const { setButton } = useHeaderButton();
   const { user } = UseAuth();
   const { data: dataPegawai, isLoading: isLoadingPegawai } = usePegawai(user?.preferred_username);

   const [search, setSearch] = useState("");

   const navigate = useNavigate();

   const { mutate, isPending } = usePostMutation<
      { kode: string; unit_pengusul: string; id_unit_pengusul: string; tempat_pelaksanaan: string },
      unknown
   >(endpoint, (data) => ({ ...data }), [[endpoint]]);

   useEffect(() => {
      if (!isLoadingPegawai && objectLength(dataPegawai)) {
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
                              navigate(`${endpoint}/actions/${response?.id_usulan_kegiatan}`);
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
               {isPending && <Spinner />}Tambah
            </Button>
         );
      }
      return () => {
         setButton(<div />);
      };
   }, [setButton, isPending, isLoadingPegawai, dataPegawai, navigate, mutate]);

   const { results, total, isLoading } = useGetQuery(endpoint);

   return (
      <>
         <div className="mb-4 row">
            <div className="col-12 col-md-3">
               <FormInput label="Cari usulan kegiatan..." value={search} onChange={setSearch} name="search" withLabel={false} />
            </div>
         </div>
         <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
