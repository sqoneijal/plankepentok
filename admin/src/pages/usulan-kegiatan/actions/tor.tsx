import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Tor({ id_usulan_kegiatan }: Readonly<{ id_usulan_kegiatan?: string }>) {
   console.log(id_usulan_kegiatan);
   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Term of Reference (TOR)</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="row"></div>
         </CardContent>
      </Card>
   );
}
