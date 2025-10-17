import { useApiQuery } from "@/hooks/useApiQuery";
import { usePutMutation } from "@/hooks/usePutMutation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type FormData = Record<string, string>;

export interface BiroData {
   id: number;
   nama: string;
   realisasi: string | null;
   pagu_anggaran: {
      id: number;
      total_pagu: string | null;
   } | null;
}

export interface LembagaData {
   id: number;
   nama: string;
   realisasi: string | null;
   id_biro: number;
   pagu_anggaran: {
      id: number;
      total_pagu: string | null;
   } | null;
}

export interface FakultasData {
   id: number;
   nama: string;
   realisasi: string | null;
   id_biro: number;
   pagu_anggaran: {
      id: number;
      total_pagu: string | null;
   } | null;
}

export interface ProdiData {
   id: number;
   nama: string;
   realisasi: string | null;
   id_fakultas: number;
   pagu_anggaran: {
      id: number;
      total_pagu: string | null;
   } | null;
}

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: FormData;
};

const handleSubmit = (
   mutate: (data: FormData, options: { onSuccess: (response: ResponseType) => void; onError: (error: Error) => void }) => void,
   formData: FormData,
   setFormData: (data: FormData) => void
) => {
   mutate(formData, {
      onSuccess: (response) => {
         if (response?.status) {
            toast.success(response?.message);
            setFormData({ id: "", total_pagu: "" });
         }
      },
      onError: (error: Error) => {
         toast.error(`Gagal: ${error?.message}`);
      },
   });
};

export function useUpdatePaguBiro({ id, total_pagu, setFormData }: { id?: string; total_pagu: number; setFormData: (data: FormData) => void }) {
   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/pagu-anggaran/biro/${id}`, () => ({ id, total_pagu }), [
      ["/pagu-anggaran/biro"],
      ["/pagu-anggaran/universitas"],
   ]);

   const onSubmit = () => {
      handleSubmit(mutate, { id: id || "", total_pagu: total_pagu.toString() }, setFormData);
   };

   return { onSubmit, isPending };
}

export function useUpdatePaguLembaga({ id, total_pagu, setFormData }: { id?: string; total_pagu: number; setFormData: (data: FormData) => void }) {
   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/pagu-anggaran/lembaga/${id}`, () => ({ id, total_pagu }), [
      ["/pagu-anggaran/lembaga"],
      ["/pagu-anggaran/universitas"],
   ]);

   const onSubmit = () => {
      handleSubmit(mutate, { id: id || "", total_pagu: total_pagu.toString() }, setFormData);
   };

   return { onSubmit, isPending };
}

export function useUpdatePaguFakultas({ id, total_pagu, setFormData }: { id?: string; total_pagu: number; setFormData: (data: FormData) => void }) {
   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/pagu-anggaran/fakultas/${id}`, () => ({ id, total_pagu }), [
      ["/pagu-anggaran/fakultas"],
      ["/pagu-anggaran/universitas"],
   ]);

   const onSubmit = () => {
      handleSubmit(mutate, { id: id || "", total_pagu: total_pagu.toString() }, setFormData);
   };

   return { onSubmit, isPending };
}

export function useUpdatePaguProdi({ id, total_pagu, setFormData }: { id?: string; total_pagu: number; setFormData: (data: FormData) => void }) {
   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/pagu-anggaran/prodi/${id}`, () => ({ id, total_pagu }), [
      ["/pagu-anggaran/prodi"],
      ["/pagu-anggaran/universitas"],
   ]);

   const onSubmit = () => {
      handleSubmit(mutate, { id: id || "", total_pagu: total_pagu.toString() }, setFormData);
   };

   return { onSubmit, isPending };
}

export function useOptions() {
   const { data, isLoading: isLoadingTahunAnggaran } = useApiQuery({
      url: "/options/tahun-anggaran",
   });

   const daftarTahunAnggaran = data?.results ?? [];

   return { daftarTahunAnggaran, isLoadingTahunAnggaran };
}

export function useInitPage() {
   const [formData, setFormData] = useState<FormData>({});

   return { formData, setFormData };
}

export function usePaguAnggaranUniversitas({ formData, setFormData }: { formData: FormData; setFormData: (data: FormData) => void }) {
   const { data, isLoading: isLoadingPaguUniversitas } = useApiQuery({
      url: "/pagu-anggaran/universitas",
      params: { tahun_anggaran: formData.tahun_anggaran },
      options: { enabled: !!formData.tahun_anggaran },
   });

   useEffect(() => {
      if (!isLoadingPaguUniversitas) {
         setFormData({ ...formData, sisa_pagu_sementara: data?.sisa_pagu_sementara });
      }
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [data, isLoadingPaguUniversitas]);

   const paguUniversitas = data?.results ?? {};

   return { paguUniversitas, isLoadingPaguUniversitas };
}

export function usePaguAnggaranBiro({ formData, enabled }: { formData: FormData; enabled: boolean }) {
   const { data, isLoading: isLoadingPaguBiro } = useApiQuery({
      url: "/pagu-anggaran/biro",
      params: { tahun_anggaran: formData.tahun_anggaran },
      options: { enabled: !!formData.tahun_anggaran && !enabled },
   });

   const paguBiro = data?.results ?? [];

   return { paguBiro, isLoadingPaguBiro };
}

export function usePaguAnggaranLembaga({ formData, enabled }: { formData: FormData; enabled: boolean }) {
   const { data, isLoading: isLoadingPaguLembaga } = useApiQuery({
      url: "/pagu-anggaran/lembaga",
      params: { tahun_anggaran: formData.tahun_anggaran },
      options: { enabled: !enabled && !!formData.tahun_anggaran },
   });

   const paguLembaga = data?.results ?? [];

   return { paguLembaga, isLoadingPaguLembaga };
}

export function usePaguAnggaranFakultas({ formData, enabled }: { formData: FormData; enabled: boolean }) {
   const { data, isLoading: isLoadingPaguFakultas } = useApiQuery({
      url: "/pagu-anggaran/fakultas",
      params: { tahun_anggaran: formData.tahun_anggaran },
      options: { enabled: !enabled && !!formData.tahun_anggaran },
   });

   const paguFakultas = data?.results ?? [];

   return { paguFakultas, isLoadingPaguFakultas };
}

export function usePaguAnggaranProdi({ formData, enabled }: { formData: FormData; enabled: boolean }) {
   const { data, isLoading: isLoadingPaguProdi } = useApiQuery({
      url: "/pagu-anggaran/prodi",
      params: { tahun_anggaran: formData.tahun_anggaran },
      options: { enabled: !enabled && !!formData.tahun_anggaran },
   });

   const paguProdi = data?.results ?? [];

   return { paguProdi, isLoadingPaguProdi };
}
