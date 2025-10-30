import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAuth } from "./auth-context";
import { queryClient } from "./queryClient";

export const useDeleteMutation = (url: string, queryKey?: Array<Array<string>>) => {
   const { token, user } = UseAuth();

   return useMutation({
      mutationFn: async (id: number | string) => {
         const response = await fetch(`${import.meta.env.VITE_API_URL}${url}/${id}`, {
            method: "DELETE",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_modified: user?.preferred_username }),
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
               queryClient.invalidateQueries({ queryKey: qk, exact: false, refetchType: "active" });
            }
         }

         if (response?.status) {
            toast.success("Data berhasil dihapus.");
         } else {
            toast.error(response?.message);
         }
      },
   });
};
