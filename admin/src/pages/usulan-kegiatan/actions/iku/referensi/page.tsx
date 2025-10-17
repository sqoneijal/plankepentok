import Table from "@/components/table";
import { getYearOptions } from "@/helpers/init";
import { FormInput, FormSelect } from "@/lib/helpers";
import { useParams } from "react-router";
import { toast } from "sonner";
import { getColumns } from "./column";
import { useCreateRelasiIKU, useInitPage } from "./init";

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: Record<string, string>;
};

export default function Page({ setOpenSheet }: Readonly<{ setOpenSheet: (open: boolean) => void }>) {
   const { id_usulan_kegiatan } = useParams();

   const { results, total, isLoading, setSearch, search, tahun_berlaku, setTahun_berlaku } = useInitPage();
   const { mutate, isPending } = useCreateRelasiIKU(id_usulan_kegiatan!);

   return (
      <>
         <div className="mb-4 row">
            <div className="col-12 col-md-3">
               <FormInput label="Cari master IKU..." value={search} onChange={setSearch} name="search" withLabel={false} />
            </div>
            <div className="col-12 col-md-2">
               <FormSelect
                  withLabel={false}
                  label="Tahun"
                  name="year"
                  options={getYearOptions()}
                  value={tahun_berlaku}
                  onChange={(value) => setTahun_berlaku(value)}
               />
            </div>
         </div>
         <Table
            columns={getColumns()}
            data={results}
            total={total}
            isLoading={isLoading}
            trCursor={true}
            onRowClick={(row) =>
               mutate(
                  { ...row, id_usulan: id_usulan_kegiatan! },
                  {
                     onSuccess: (response: ResponseType) => {
                        if (response?.status) {
                           toast.success(response?.message);
                           setOpenSheet(false);
                           return;
                        }
                        toast.error(response?.message);
                     },
                     onError: (error: Error) => {
                        toast.error(`Gagal: ${error?.message}`);
                     },
                  }
               )
            }
            isLoadingRow={isPending}
         />
      </>
   );
}
