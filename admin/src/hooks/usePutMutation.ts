import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAuth } from "./auth-context";
import { queryClient } from "./queryClient";

export const usePutMutation = <TData, TTransformed = TData>(
   url: string,
   transformData?: (data: TData) => TTransformed,
   queryKey?: Array<Array<string>>
) => {
   const { user } = UseAuth();

   return useMutation({
      mutationFn: async (data: TData) => {
         const transformed = transformData ? transformData(data) : (data as unknown as TTransformed);
         const bodyData = { ...transformed, user_modified: user?.preferred_username || "" };
         const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
         });

         if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
         }

         return response.json();
      },
      onSuccess: (response) => {
         if (queryKey && response.status) {
            for (const qk of queryKey) {
               queryClient.invalidateQueries({ queryKey: qk, exact: false });
            }
         }
      },
   });
};
