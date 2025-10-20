import Table from "@/components/table";
import { useHeaderButton } from "@/hooks/store";
import { FormInput, LinkButton } from "@/lib/helpers";
import { useGetQuery } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getColumns } from "./column";

const endpoint = "/referensi/standar-biaya";

export default function Page() {
   const { setButton } = useHeaderButton();

   const [search, setSearch] = useState("");

   useEffect(() => {
      setButton(<LinkButton label="Tambah" url={`${endpoint}/actions`} />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, total, isLoading } = useGetQuery(endpoint);

   return (
      <>
         <div className="mb-4 max-w-sm">
            <FormInput withLabel={false} label="Cari standar biaya..." onChange={(value) => setSearch(value)} value={search} />
         </div>
         <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
