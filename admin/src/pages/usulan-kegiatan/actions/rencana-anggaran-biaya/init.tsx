import { useApiQuery } from "@/hooks/useApiQuery";
import { usePostMutation } from "@/hooks/usePostMutation";
import { usePutMutation } from "@/hooks/usePutMutation";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export type FormData = Record<string, string>;

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: FormData;
   id_usulan?: string;
};

const handleSubmit = (
   mutate: (data: FormData, options: { onSuccess: (response: ResponseType) => void; onError: (error: Error) => void }) => void,
   formData: FormData,
   setErrors: (errors: FormData) => void,
   handleCloseSheetForm: (status: boolean) => void,
   navigate: (path: string) => void
) => {
   mutate(formData, {
      onSuccess: (response: ResponseType) => {
         setErrors(response?.errors || {});
         if (response?.status) {
            toast.success(response?.message);
            if (handleCloseSheetForm) handleCloseSheetForm(false);
            navigate(`/usulan-kegiatan/actions/${response?.id_usulan}`);
            return;
         }
         toast.error(response?.message);
      },
      onError: (error: Error) => {
         toast.error(`Gagal: ${error?.message}`);
      },
   });
};

export function useOptions() {
   const { data, isLoading, error } = useApiQuery({
      url: "/options/unit-satuan",
   });

   if (error) {
      toast.error(error?.message);
   }

   const unitSatuan = data?.results ?? {};

   return { unitSatuan, isLoading };
}

export function useInitPage(id_usulan_kegiatan?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/usulan-kegiatan/rab/${id_usulan_kegiatan}`,
      options: { enabled: !!id_usulan_kegiatan },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = data?.results ?? {};
   const total = data?.total || 0;

   return { results, total, isLoading };
}

export function useGetDetailRab(id_usulan_kegiatan?: string, id_rab_detail?: string) {
   const {
      data,
      isLoading: isLoadingDetail,
      error,
   } = useApiQuery({
      url: `/usulan-kegiatan/rab/${id_usulan_kegiatan}/${id_rab_detail}`,
      options: { enabled: !!id_rab_detail },
   });

   if (error) {
      toast.error(error?.message);
   }

   const dataDetail = data?.results ?? {};

   return { dataDetail, isLoadingDetail };
}

export function useInitForms() {
   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   return { formData, setFormData, errors, setErrors };
}

export function useCreateData({
   id_usulan_kegiatan,
   formData,
   setErrors,
   handleSheetForm,
}: {
   id_usulan_kegiatan?: string;
   formData: FormData;
   setErrors: (errors: FormData) => void;
   handleSheetForm: (status: boolean) => void;
}) {
   const { mutate, isPending } = usePostMutation<FormData, unknown>("/usulan-kegiatan/rab", (data) => ({ ...data, id_usulan: id_usulan_kegiatan }), [
      [`/usulan-kegiatan/rab/${id_usulan_kegiatan}`],
   ]);

   const navigate = useNavigate();

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, handleSheetForm, navigate);
   };

   return { onSubmit, isPending };
}

export function useUpdateData({
   id_rab_detail,
   id_usulan_kegiatan,
   formData,
   setErrors,
   handleSheetForm,
}: {
   id_rab_detail?: string;
   id_usulan_kegiatan?: string;
   formData: FormData;
   setErrors: (errors: FormData) => void;
   handleSheetForm: (status: boolean) => void;
}) {
   const { mutate, isPending } = usePutMutation<FormData, unknown>(
      `/usulan-kegiatan/rab/${id_usulan_kegiatan}/${id_rab_detail}`,
      (data) => ({ ...data }),
      [[`/usulan-kegiatan/rab/${id_usulan_kegiatan}`]]
   );

   const navigate = useNavigate();

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, handleSheetForm, navigate);
   };

   return { onSubmit, isPending };
}
