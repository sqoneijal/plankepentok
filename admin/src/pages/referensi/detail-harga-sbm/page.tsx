import Table from "@/components/table";
import { FormInput } from "@/lib/helpers";
import { getColumns } from "./column";
import { useDetailHargaSbmPage } from "./init";

export default function Page() {
   const { results, total, isLoading, setSearch, search } = useDetailHargaSbmPage();

   return (
      <>
         <div className="mb-4 max-w-sm">
            <FormInput withLabel={false} label="Cari detail harga SBM..." onChange={(value) => setSearch(value)} value={search} />
         </div>
         <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
