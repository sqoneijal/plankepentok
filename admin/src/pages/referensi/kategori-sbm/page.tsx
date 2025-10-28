import Table from "@/components/table";
import { useHeaderButton } from "@/hooks/store";
import { useGetQuery } from "@/hooks/useGetQuery";
import { FormInput, LinkButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { getColumns } from "./column";

const endpoint = "/referensi/kategori-sbm";

export default function Page() {
   const { results, total, isLoading } = useGetQuery(endpoint);

   const { setButton } = useHeaderButton();

   const [search, setSearch] = useState("");

   useEffect(() => {
      setButton(<LinkButton label="Tambah" url={`${endpoint}/actions`} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   return (
      <>
         <div className="mb-4 max-w-sm">
            <FormInput withLabel={false} label="Cari kategori SBM..." onChange={(value) => setSearch(value)} value={search} />
         </div>
         <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
