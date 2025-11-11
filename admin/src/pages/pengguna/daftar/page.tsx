import Table from "@/components/table";
import { useHeaderButton } from "@/hooks/store";
import { useGetQuery } from "@/hooks/useGetQuery";
import { FormInput, LinkButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { getColumns } from "./column";

const endpoint = "/pengguna/daftar";

export default function Page() {
   const { setButton } = useHeaderButton();

   const [search, setSearch] = useState("");

   useEffect(() => {
      setButton(<LinkButton label="Tambah" url={`${endpoint}/actions`} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, total, isLoading } = useGetQuery(endpoint, { search });

   return (
      <>
         <div className="row">
            <FormInput divClassName="col-12 col-md-6" label="Cari..." withLabel={false} onChange={(value) => setSearch(value)} value={search} />
         </div>
         <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
