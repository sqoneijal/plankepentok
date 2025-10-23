import { useGetQuery } from "@/hooks/useGetQuery";
import { useState } from "react";

export function useInitPage() {
   const [search, setSearch] = useState("");

   const { results, total, isLoading } = useGetQuery("/usulan-kegiatan/referensi-sbm", { search });

   return { results, total, isLoading, setSearch, search };
}
