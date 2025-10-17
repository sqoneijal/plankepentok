import Table from "@/components/table";
import { toast } from "sonner";
import { loadingElementSecond } from "../../helpers";
import { getColumns } from "./column";
import { useRabData } from "./init";

export default function Page() {
   const { data, isLoading, error } = useRabData();

   if (isLoading) return loadingElementSecond;

   if (error) {
      toast.error(error?.message);
      return null;
   }

   return <Table columns={getColumns()} data={Array.isArray(data?.results) ? data?.results : []} total={data?.total ?? 0} isLoading={isLoading} />;
}
