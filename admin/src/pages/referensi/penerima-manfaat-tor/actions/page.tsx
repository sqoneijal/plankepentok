import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { useSubmitData } from "@/hooks/useSubmitData";
import { FormInput, FormTextarea, LinkButton, SubmitButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/referensi/penerima-manfaat-tor";

export default function Page() {
   const { setButton } = useHeaderButton();
   const { id } = useParams();
   const isEdit = !!id;

   const [formData, setFormData] = useState<Record<string, string>>({});
   const [errors, setErrors] = useState<Record<string, string>>({});

   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   const { results, isLoading } = useGetQueryDetail(endpoint, id);

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const converted = covertToSTring(results);
         setFormData({ ...converted } as Record<string, string>);
      }
      return () => {};
   }, [id, isLoading, results]);

   if (isLoading) {
      return "loading...";
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormInput
                     divClassName="col-12 col-md-3"
                     label="Nama Penerima"
                     value={getValue(formData, "nama")}
                     name="nama"
                     onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                     errors={errors}
                  />
               </div>
               <div className="row">
                  <FormTextarea
                     divClassName="col-12 col-md-12"
                     label="Keterangan"
                     value={getValue(formData, "keterangan")}
                     name="keterangan"
                     onChange={(value) => setFormData((prev) => ({ ...prev, keterangan: value }))}
                     errors={errors}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbaharui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
