import Table from "@/components/table";
import { cleanRupiah } from "@/helpers/init";
import { FormInput } from "@/lib/helpers";
import { getColumns, type Row } from "./column";
import { useInitPage } from "./init";

type FormData = Record<string, string>;

export default function Page({
   setOpenSheet,
   setFormData,
   formData,
}: Readonly<{ setOpenSheet: (open: boolean) => void; formData: FormData; setFormData?: (data: FormData) => void }>) {
   const { results, total, isLoading, setSearch, search } = useInitPage();

   return (
      <>
         <div className="mb-4 row">
            <div className="col-12 col-md-3">
               <FormInput label="Cari referensi SBM..." value={search} onChange={setSearch} name="search" withLabel={false} />
            </div>
         </div>
         <Table
            columns={getColumns()}
            data={results as Array<Row>}
            total={total}
            isLoading={isLoading}
            trCursor={true}
            onRowClick={(row: Row) => {
               if (setFormData) {
                  setFormData({
                     ...formData,
                     uraian_biaya: row.standar_biaya.nama,
                     id_satuan: String(row.id_satuan),
                     harga_satuan: String(row.harga_satuan),
                     total_biaya: String(cleanRupiah(row.harga_satuan) * 1),
                  });
               }
               setOpenSheet(false);
            }}
         />
      </>
   );
}
