import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteMutation } from "@/hooks/useDeleteMutation";
import { Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface ConfirmDialogProps {
   url: string;
   refetchKey?: Array<Array<string>>;
   id: string | number;
}

export default function ConfirmDialog({ url, refetchKey, id }: Readonly<ConfirmDialogProps>) {
   const _delete = useDeleteMutation(url, refetchKey);

   return (
      <AlertDialog>
         <AlertDialogTrigger asChild>
            <Button variant="outline" className="size-6">
               <Trash />
            </Button>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Konfirmasi penghapusan?</AlertDialogTitle>
               <AlertDialogDescription>Apakah anda yakin ingin menghapus. Data yang dihapus tidak dapat dikembalikan!!!</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel className="h-7">Batal</AlertDialogCancel>
               <AlertDialogAction className="h-7" disabled={_delete.isPending} onClick={() => _delete.mutate(id)}>
                  {_delete.isPending && <Spinner />}
                  Lanjutkan
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
