import Table from "@/components/table";
import { FormInput } from "@/lib/helpers";
import { getColumns } from "./column";
import { useUnitPage } from "./init";

export default function Page() {
   const { results, total, isLoading, setSearch, search } = useUnitPage();

   return (
      <>
         <div className="mb-4 max-w-sm">
            <FormInput withLabel={false} label="Cari unit satuan..." onChange={(value) => setSearch(value)} value={search} />
         </div>
         <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
