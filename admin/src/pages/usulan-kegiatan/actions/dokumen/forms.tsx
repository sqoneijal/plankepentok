import { ScrollArea } from "@/components/ui/scroll-area";
import { objectLength } from "@/helpers/init";
import { UseAuth } from "@/hooks/auth-context";
import { queryClient } from "@/hooks/queryClient";
import { useDetailRow } from "@/hooks/store";
import { FormFile, FormInput, SubmitButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FormData = Record<string, string | File>;

export default function Forms({
   id_usulan_kegiatan,
   setOpenSheet,
}: Readonly<{ id_usulan_kegiatan: string | undefined; setOpenSheet: (open: boolean) => void }>) {
   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<Record<string, string | null>>({});
   const [isLoading, setIsLoading] = useState(false);

   const { user, token } = UseAuth();
   const { detailRow, setDetailRow } = useDetailRow();

   useEffect(() => {
      if (objectLength(detailRow)) {
         setFormData({ ...detailRow });
      }

      return () => {};
   }, [detailRow]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrors({});

      const isUpdate = objectLength(detailRow);
      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate
         ? `${import.meta.env.VITE_API_URL}/usulan-kegiatan/${id_usulan_kegiatan}/dokumen/${detailRow.id}`
         : `${import.meta.env.VITE_API_URL}/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`;

      const data = new FormData();
      data.append("nama_dokumen", (formData.nama_dokumen as string) || "");
      data.append("user_modified", String(user?.preferred_username));
      data.append("file_dokumen", (formData.file_dokumen as File) || "");

      try {
         const response = await fetch(url, {
            method,
            body: data,
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         const result = await response.json();

         if (result.status) {
            toast.success(isUpdate ? "Dokumen berhasil diperbarui!" : "Dokumen berhasil diunggah!");
            setFormData({});
            setOpenSheet(false);
            setDetailRow({});
            queryClient.invalidateQueries({ queryKey: [`/usulan-kegiatan/${id_usulan_kegiatan}/dokumen`], exact: false });
         } else if (result.errors) {
            toast.error(result?.message);
            setErrors(result.errors);
         } else {
            toast.error(result.message || "Terjadi kesalahan");
         }
      } catch (error) {
         toast?.error(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <ScrollArea className="h-screen">
         <form onSubmit={handleSubmit}>
            <div className="row">
               <FormInput
                  divClassName="col-12"
                  label="Nama Dokumen"
                  name="nama_dokumen"
                  value={formData?.nama_dokumen as string}
                  onChange={(value) => setFormData({ ...formData, nama_dokumen: value })}
                  errors={errors}
               />
            </div>
            <div className="row">
               <FormFile
                  divClassName="col-12"
                  label="File Dokumen"
                  name="file_dokumen"
                  onChange={(file: File) => {
                     setFormData({ ...formData, file_dokumen: file });
                  }}
                  errors={errors}
               />
            </div>
            <SubmitButton label={"Simpan"} isLoading={isLoading} />
         </form>
      </ScrollArea>
   );
}
