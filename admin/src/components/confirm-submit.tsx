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
import { usePutMutation } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface ConfirmSubmitProps {
   url: string;
   refetchKey?: Array<unknown> | Array<Array<unknown>>;
   formData?: Lists;
   actionButton: React.ReactNode;
   message?: string;
}

export default function ConfirmDialog({ url, refetchKey, formData, actionButton, message }: Readonly<ConfirmSubmitProps>) {
   const queryClient = useQueryClient();
   const submit = usePutMutation<{ errors: Lists }>(url);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      submit.mutate(
         { ...formData },
         {
            onSuccess: (data) => {
               if (data?.status) {
                  if (refetchKey) {
                     if (Array.isArray(refetchKey) && refetchKey.length > 0 && Array.isArray(refetchKey[0])) {
                        // Array of query keys
                        (refetchKey as Array<Array<unknown>>).forEach((key) => {
                           queryClient.refetchQueries({ queryKey: key });
                        });
                     } else {
                        // Single query key
                        queryClient.refetchQueries({ queryKey: refetchKey });
                     }
                  }
                  toast.success(data?.message);
                  return;
               }

               toast.error(data?.message);
            },
            onError: (error: Error) => {
               toast.error(error.message);
            },
         }
      );
   };

   return (
      <AlertDialog>
         <AlertDialogTrigger asChild>{actionButton}</AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Konfirmasi?</AlertDialogTitle>
               <AlertDialogDescription>{message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel className="h-7">Batal</AlertDialogCancel>
               <AlertDialogAction className="h-7" disabled={submit.isPending} onClick={handleSubmit}>
                  {submit.isPending ? (
                     <>
                        <Loader2Icon className="animate-spin" />
                        Bentar ya, lagi loading...
                     </>
                  ) : (
                     "Lanjutkan"
                  )}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
