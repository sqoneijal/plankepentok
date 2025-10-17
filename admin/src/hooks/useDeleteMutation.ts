import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "./queryClient";

export const useDeleteMutation = (url: string, queryKey?: Array<Array<string>>) => {
   return useMutation({
      mutationFn: async (id: number | string) => {
         const response = await fetch(`${import.meta.env.VITE_API_URL}${url}/${id}`, {
            method: "DELETE",
         });

         if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message || "Gagal menghapus data.");
         }

         return response.json();
      },
      onSuccess: (response) => {
         if (queryKey && response.status) {
            for (const qk of queryKey) {
               queryClient.invalidateQueries({ queryKey: qk, exact: false });
            }
         }
         toast.success("Data berhasil dihapus.");
      },
   });
};
