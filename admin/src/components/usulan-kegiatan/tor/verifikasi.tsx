import Table from "@/components/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const columns = () => [];

export default function Verifikasi() {
   const isLoading = false;

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Term of Reference (TOR)</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns()} data={[]} isLoading={isLoading} usePagination={false} total={0} />
         </CardContent>
      </Card>
   );
}
