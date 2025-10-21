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
import { queryClient } from "@/hooks/queryClient";
import { usePutMutation } from "@/hooks/usePutMutation";
import type { FormData } from "@/types/init";
import React, { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

interface ConfirmSubmitProps {
   url: string;
   refetchKey?: Array<unknown> | Array<Array<unknown>>;
   formData: FormData;
   actionButton: React.ReactNode;
   message: string;
}

export default function ConfirmDialog({ url, refetchKey, formData, actionButton, message }: Readonly<ConfirmSubmitProps>) {
   const [open, setOpen] = useState(false);

   const submit = usePutMutation<FormData>(url);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      submit.mutate(formData, {
         onSuccess: (data) => {
            if (data?.status) {
               if (refetchKey) {
                  if (Array.isArray(refetchKey) && refetchKey.length > 0 && Array.isArray(refetchKey[0])) {
                     // Array of query keys
                     for (const key of refetchKey as Array<Array<unknown>>) {
                        queryClient.invalidateQueries({ queryKey: key, exact: false });
                     }
                  } else {
                     // Single query key
                     queryClient.invalidateQueries({ queryKey: refetchKey, exact: false });
                  }
               }
               toast.success(data?.message);
               setOpen(false);
               return;
            }

            toast.error(data?.message);
         },
         onError: (error: Error) => {
            toast.error(error.message);
         },
      });
   };

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogTrigger asChild>{actionButton}</AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Konfirmasi?</AlertDialogTitle>
               <AlertDialogDescription>{message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel className="h-7">Batal</AlertDialogCancel>
               <AlertDialogAction className="h-7" disabled={submit.isPending} onClick={handleSubmit}>
                  {submit.isPending && <Spinner />}Lanjutkan
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
