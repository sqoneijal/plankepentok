import { covertToSTring, getYearOptions, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { FormInput, FormSelect, FormTextarea, LinkButton, SubmitButton } from "@/lib/helpers";
import { useGetQueryDetail, useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

type FormData = Record<string, string>;

const endpoint = "/master-iku";

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   const { results, isLoading } = useGetQueryDetail(endpoint, id);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const converted = covertToSTring(results);
         setFormData({ ...(converted as FormData) });
      }
   }, [isLoading, results, id]);

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   if (isLoading) {
      return "Loading...";
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Jenis IKU"
                     name="jenis"
                     value={formData?.jenis}
                     onChange={(value) => setFormData({ ...formData, jenis: value })}
                     options={[
                        { value: "rektor", label: "Rektor" },
                        { value: "perguruan_tinggi", label: "Perguruan Tinggi" },
                     ]}
                     errors={errors}
                  />
                  <FormInput
                     divClassName="col-12 col-md-2"
                     label="Kode IKU"
                     name="kode"
                     value={formData?.kode}
                     onChange={(value) => setFormData({ ...formData, kode: value })}
                     errors={errors}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Tahun Berlaku"
                     name="tahun_berlaku"
                     value={formData?.tahun_berlaku}
                     onChange={(value) => setFormData({ ...formData, tahun_berlaku: value })}
                     options={getYearOptions()}
                     errors={errors}
                  />
               </div>
               <div className="row">
                  <FormTextarea
                     divClassName="col-12"
                     label="Deskripsi"
                     name="deskripsi"
                     value={formData.deskripsi}
                     errors={errors}
                     onChange={(value) => setFormData({ ...formData, deskripsi: value })}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
