import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useCariPegawai } from "@/helpers/simpeg";
import { useHeaderButton } from "@/hooks/store";
import { useGetQuery } from "@/hooks/useGetQuery";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { useSubmitData } from "@/hooks/useSubmitData";
import { FormSelect, LinkButton, SubmitButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/verifikator";

type Pegawai = {
   id: string;
   nama: string;
   statusAktif?: {
      isActive: boolean;
   };
};

export default function Page() {
   const { setButton } = useHeaderButton();
   const { id } = useParams();
   const isEdit = !!id;

   const [formData, setFormData] = useState({});
   const [errors, setErrors] = useState({});
   const [searchQuery, setSearchQuery] = useState<string>("");

   const { data: pegawaiList } = useCariPegawai(searchQuery);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });
   const { results: daftarJenisUsulan, isLoading: isLoadingDaftarJenisUsulan } = useGetQuery(`${endpoint}/daftar-jenis-usulan`, {}, false);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, isLoading } = useGetQueryDetail(endpoint, id);

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const converted = covertToSTring(results);
         setFormData({ ...converted });
      }
      return () => {};
   }, [id, isLoading, results]);

   if (isLoading || isLoadingDaftarJenisUsulan) {
      return "Loading...";
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <FormSelect
                     divClassName="col-12 col-md-4"
                     label="Jenis Usulan"
                     value={getValue(formData, "id_jenis_usulan")}
                     name="id_jenis_usulan"
                     onChange={(value) => setFormData((prev) => ({ ...prev, id_jenis_usulan: value }))}
                     errors={errors}
                     options={daftarJenisUsulan.map((row: Record<string, string>) => ({ value: String(row.id), label: row.nama }))}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-4"
                     useCommand={true}
                     label="Verifikator"
                     value={getValue(formData, "verifikator")}
                     onChange={(value) => {
                        setFormData({
                           ...formData,
                           verifikator: value,
                           detail_verifikator: pegawaiList?.find((e: { id: string }) => e.id === value) ?? {},
                        });
                     }}
                     name="verifikator"
                     errors={errors}
                     options={
                        pegawaiList
                           ?.filter((e: Pegawai) => e?.statusAktif?.isActive === true)
                           ?.map((p: Pegawai) => ({ value: p.id, label: `${p.nama} - ${p.id}` })) || []
                     }
                     onValueChange={(value) => setSearchQuery(value)}
                  />
                  <FormSelect
                     divClassName="col-12 col-md-2"
                     label="Tahap"
                     value={getValue(formData, "tahap")}
                     name="tahap"
                     onChange={(value) => setFormData((prev) => ({ ...prev, tahap: value }))}
                     errors={errors}
                     options={[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                        { value: "3", label: "3" },
                     ]}
                  />
               </div>
               <SubmitButton label={isEdit ? "Perbaharui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
