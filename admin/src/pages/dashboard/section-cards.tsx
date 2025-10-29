import { DashboardSectionCardsSkeleton } from "@/components/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toRupiah } from "@/helpers/init";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";

export default function SectionCards({ endpoint }: Readonly<{ endpoint: string }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, "angka-pagu");

   if (isLoading) {
      return <DashboardSectionCardsSkeleton />;
   }

   return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Total Pagu</CardDescription>
               <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{toRupiah(results?.total_pagu)}</CardTitle>
               <CardAction>
                  <Badge variant="outline">{results?.tahun_anggaran}</Badge>
               </CardAction>
            </CardHeader>
         </Card>
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Total Pagu Realisasi</CardDescription>
               <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{toRupiah(results?.realisasi)}</CardTitle>
               <CardAction>
                  <Badge variant="outline">{results?.tahun_anggaran}</Badge>
               </CardAction>
            </CardHeader>
         </Card>
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Rencana Anggaran</CardDescription>
               <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{toRupiah(results?.rencana_anggaran)}</CardTitle>
               <CardAction>
                  <Badge variant="outline">{results?.tahun_anggaran}</Badge>
               </CardAction>
            </CardHeader>
         </Card>
         <Card className="@container/card">
            <CardHeader>
               <CardDescription>Anggaran Diterima</CardDescription>
               <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{toRupiah(results?.anggaran_disetujui)}</CardTitle>
               <CardAction>
                  <Badge variant="outline">{results?.tahun_anggaran}</Badge>
               </CardAction>
            </CardHeader>
         </Card>
      </div>
   );
}
