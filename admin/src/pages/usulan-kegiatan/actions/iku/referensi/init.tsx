import { useGetQuery } from "@/hooks/useGetQuery";
import { usePostMutation } from "@/hooks/usePostMutation";
import { useState } from "react";

type FormData = Record<string, string>;

export function useInitPage() {
   const [search, setSearch] = useState("");
   const [tahun_berlaku, setTahun_berlaku] = useState("");

   const { results, total, isLoading } = useGetQuery("/master-iku", { search, tahun_berlaku });

   return { results, total, isLoading, setSearch, search, tahun_berlaku, setTahun_berlaku };
}

export function useCreateRelasiIKU(id_usulan_kegiatan: string | undefined) {
   const { mutate, isPending } = usePostMutation<FormData, unknown>(`/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`, (data) => ({ ...data }), [
      id_usulan_kegiatan ? [`/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`] : [],
   ]);

   return { mutate, isPending };
}
