import Table from "@/components/table";
import { FormInput, FormSelect } from "@/lib/helpers";
import { getColumns } from "./column";
import { useMasterIKUPage } from "./use-page";

export default function Page() {
   const { data, isLoading, limit, offset, navigate, search, setSearch, year, setYear } = useMasterIKUPage();

   const currentYear = new Date().getFullYear();
   const yearOptions = Array.from({ length: 10 }, (_, i) => ({
      label: (currentYear - i).toString(),
      value: (currentYear - i).toString(),
   }));

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
                  options={yearOptions}
                  value={year.toString()}
                  onChange={(value) => setYear(value)}
               />
            </div>
         </div>
         <Table
            columns={getColumns({ navigate, limit, offset })}
            data={Array.isArray(data?.results) ? data?.results : []}
            total={data?.total ?? 0}
            isLoading={isLoading}
         />
      </>
   );
}
