import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Informasi({ status }: Readonly<{ status?: "submitted" | "verified" | "rejected" }>) {
   const desc = {
      submitted: "Pengajuan telah dikirim dan menunggu proses verifikasi oleh pihak berwenang.",
      verified: "Pengajuan telah diverifikasi dan dinyatakan valid untuk tahap selanjutnya.",
      rejected: "Pengajuan ditolak karena tidak memenuhi persyaratan atau terdapat kesalahan pada data.",
   };

   return (
      status &&
      desc[status] && (
         <Alert variant="default">
            <Info />
            <AlertTitle>Informasi Pengajuan</AlertTitle>
            <AlertDescription>{desc[status]}</AlertDescription>
         </Alert>
      )
   );
}
