import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAuth } from "./auth-context";

export function useApiQuery({
   queryKey,
   url,
   params,
   options,
}: {
   queryKey?: string | Array<unknown>;
   url: string;
   params?: Record<string, string>;
   options?: Record<string, unknown>;
}) {
   const { token } = UseAuth();
   const queryString = params ? new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString() : "";
   const fullUrl = import.meta.env.VITE_API_URL + url + (queryString ? `?${queryString}` : "");

   return useQuery({
      queryKey: Array.isArray(queryKey) ? [queryKey] : [url, params],
      queryFn: async () => {
         const response = await fetch(fullUrl, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            toast.error(response?.statusText || "Failed to fetch data");
         }

         return response.json();
      },
      ...options,
   });
}
