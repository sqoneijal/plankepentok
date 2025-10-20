import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAuth } from "./auth-context";
import { queryClient } from "./queryClient";

export const usePostMutation = <TData, TTransformed = TData>(
   url: string,
   transformData?: (data: TData) => TTransformed,
   queryKeys?: Array<Array<string>>
) => {
   const { token, user } = UseAuth();

   return useMutation({
      mutationFn: async (data: TData) => {
         const transformed = transformData ? transformData(data) : (data as unknown as TTransformed);
         const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...transformed, user_modified: user?.preferred_username }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message || "Failed to post data");
         }

         return response.json();
      },
      onSuccess: (response) => {
         if (queryKeys && response.status) {
            for (const queryKey of queryKeys) {
               queryClient.invalidateQueries({ queryKey, exact: false });
            }
         }
      },
   });
};
