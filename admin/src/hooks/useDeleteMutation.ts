import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAuth } from "./auth-context";
import { queryClient } from "./queryClient";

export const useDeleteMutation = (url: string, params?: Record<string, string>) => {
   const { token, user } = UseAuth();

   return useMutation({
      mutationFn: async (id: number | string) => {
         let queryString = "";
         if (params) {
            queryString = "?" + new URLSearchParams(params).toString();
         }
         const response = await fetch(`${import.meta.env.VITE_API_URL}${url}/${id}${queryString}`, {
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
         const { status, refetchQuery } = response;
         if (status && Array.isArray(refetchQuery)) {
            for (const queryKey of refetchQuery) {
               queryClient.invalidateQueries({ queryKey, exact: false });
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
