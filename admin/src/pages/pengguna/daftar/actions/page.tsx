import { FormPenggunaSkeleton } from "@/components/loading-skeleton";
import { getValue } from "@/helpers/init";
import { useCariPegawai } from "@/helpers/simpeg";
import { useHeaderButton } from "@/hooks/store";
import { useGetQuery } from "@/hooks/useGetQuery";
import { FormSelect, LinkButton, SubmitButton } from "@/lib/helpers";
import { useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/pengguna/daftar";
type FormData = Record<string, string>;

type SubUnit = {
   id: number | string;
   nama: string;
   level: string;
};

type UnitKerja = {
   id: number | string;
   nama: string;
   level: string;
   sub_unit: Array<SubUnit>;
};

type Pegawai = {
   id: string;
   nama: string;
   statusAktif?: {
      isActive: boolean;
   };
};

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { setButton } = useHeaderButton();

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={`${endpoint}`} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});
   const [searchQuery, setSearchQuery] = useState<string>("");

   const { results: daftarRoles, isLoading: isLoadingRoles } = useGetQuery(`${endpoint}/roles`);
   const { results, isLoading } = useGetQuery(`${endpoint}/unit-kerja`) as { results: Array<UnitKerja>; isLoading: boolean };
   const { data: pegawaiList } = useCariPegawai(searchQuery);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   if (isLoading || isLoadingRoles) {
      return <FormPenggunaSkeleton />;
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-2">
                     <FormSelect
                        label="Role"
                        value={getValue(formData, "id_roles")}
                        onChange={(value) =>
                           setFormData({
                              ...formData,
                              id_roles: value,
                              id_parent: "",
                           })
                        }
                        name="id_roles"
                        errors={errors}
                        options={daftarRoles.map((row: FormData) => ({ value: String(row.id), label: row.nama }))}
                     />
                  </div>
                  <div className="col-12 col-md-5">
                     <FormSelect
                        useCommand={true}
                        label="Operator"
                        value={getValue(formData, "username")}
                        onChange={(value) => setFormData({ ...formData, username: value })}
                        name="username"
                        errors={errors}
                        options={
                           pegawaiList
                              ?.filter((e: Pegawai) => e?.statusAktif?.isActive === true)
                              ?.map((p: Pegawai) => ({ value: p.id, label: `${p.nama} - ${p.id}` })) || []
                        }
                        onValueChange={(value) => setSearchQuery(value)}
                     />
                  </div>
                  {formData?.id_roles === "3" && (
                     <div className="col-12 col-md-5">
                        <FormSelect
                           useCommand={true}
                           label="Unit Kerja"
                           value={getValue(formData, "id_parent")}
                           onChange={(value) => setFormData({ ...formData, id_parent: value })}
                           name="id_parent"
                           errors={errors}
                           options={results.map((row: UnitKerja) => ({
                              value: `${row.id}-${row.level}`,
                              label: row.nama,
                              hasChild: Boolean(row.sub_unit?.length),
                              child: row.sub_unit?.map((sub: SubUnit) => ({ value: `${sub.id}-sub_unit`, label: sub.nama })),
                           }))}
                           useHeaderAsValue={true}
                        />
                     </div>
                  )}
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
