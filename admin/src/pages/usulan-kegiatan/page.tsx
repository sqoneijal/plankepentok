import Table from "@/components/table";
import { FormInput } from "@/lib/helpers";
import { getColumns } from "./column";
import { useInitPage } from "./init";

export default function Page() {
   const { results, total, isLoading, search, setSearch } = useInitPage();

   return (
      <>
         <div className="mb-4 row">
            <div className="col-12 col-md-3">
               <FormInput label="Cari usulan kegiatan..." value={search} onChange={setSearch} name="search" withLabel={false} />
            </div>
            <div className="col-12 col-md-2">
               {/* <FormSelect
                  withLabel={false}
                  label="status usulan"
                  name="status_usulan"
                  options={[
                     { value: "draft", label: "Draft" },
                     { value: "submitted", label: "Submitted" },
                     { value: "verified", label: "Verified" },
                     { value: "rejected", label: "Rejected" },
                  ]}
                  value={status_usulan}
                  onChange={(value) => setStatus_usulan(value)}
               /> */}
            </div>
         </div>
         <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
