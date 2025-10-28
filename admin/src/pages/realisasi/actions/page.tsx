import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toNumber } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { usePostMutation } from "@/hooks/usePostMutation";
import { FormDatePicker, FormInput, FormTextarea, LinkButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { columns } from "./column";

const endpoint = "/realisasi";

type FormData = Record<string, unknown>;

export default function Page() {
   const { id } = useParams();
   const { setButton } = useHeaderButton();
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/ref-rab`);

   const { mutate, isPending } = usePostMutation<FormData, unknown>(`${endpoint}/${id}`, (data) => ({ ...data }), [
      [`${endpoint}/${id}`],
      [`${endpoint}/${id}/ref-rab`],
   ]);

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={`${endpoint}/${id}`} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton, id]);

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<Record<string, string>>({});

   return (
      <div className="row">
         <div className="col-12 col-md-8">
            <Card>
               <CardHeader>
                  <CardTitle>Rencana Anggaran Biaya</CardTitle>
                  <CardDescription>Berikut adalah rencana anggaran biaya yang digunakan sebagai referensi untuk realisasi kegiatan.</CardDescription>
               </CardHeader>
               <CardContent>
                  <Table
                     columns={columns()}
                     data={results}
                     total={results.length}
                     isLoading={isLoading}
                     usePagination={false}
                     trCursor={true}
                     onRowClick={(row) => {
                        let total_biaya: string;

                        if (row.rab_detail_perubahan === null) {
                           total_biaya = (toNumber(row.qty) * toNumber(row.harga_satuan)).toString();
                        } else {
                           total_biaya = (toNumber(row.rab_detail_perubahan.qty) * toNumber(row.rab_detail_perubahan.harga_satuan)).toString();
                        }

                        setFormData({
                           ...row,
                           new_total_biaya: total_biaya,
                           anggaran_digunakan: total_biaya,
                        } as FormData);
                     }}
                  />
               </CardContent>
            </Card>
         </div>
         <div className="col-12 col-md-4">
            <Card>
               <CardContent>
                  <div className="row">
                     <FormInput divClassName="col-12" label="Uraian Biaya" value={formData?.uraian_biaya as string} disabled={true} />
                  </div>
                  <div className="row">
                     <FormDatePicker
                        divClassName="col-12 col-md-6"
                        label="Tanggal Mulai"
                        name="tanggal_mulai"
                        value={formData?.tanggal_mulai as string}
                        onChange={(value) => setFormData({ ...formData, tanggal_mulai: String(value) })}
                        errors={errors}
                     />
                     <FormDatePicker
                        divClassName="col-12 col-md-6"
                        label="Tanggal Selesai"
                        name="tanggal_selesai"
                        value={formData?.tanggal_selesai as string}
                        onChange={(value) => setFormData({ ...formData, tanggal_selesai: String(value) })}
                        errors={errors}
                     />
                  </div>
                  <div className="row">
                     <FormInput
                        apakahFormatRupiah={true}
                        divClassName="col-12"
                        label="Anggaran Digunakan"
                        name="anggaran_digunakan"
                        value={formData?.anggaran_digunakan as string}
                        onChange={(value) => setFormData({ ...formData, anggaran_digunakan: String(value) })}
                        errors={errors}
                     />
                  </div>
                  <div className="row">
                     <FormTextarea
                        divClassName="col-12"
                        label="Deskripsi"
                        name="deskripsi"
                        value={formData?.deskripsi as string}
                        onChange={(value) => setFormData({ ...formData, deskripsi: String(value) })}
                        errors={errors}
                     />
                  </div>
               </CardContent>
               <CardFooter>
                  <Button
                     disabled={isPending}
                     onClick={() => {
                        mutate(formData, {
                           onSuccess: (response) => {
                              const { errors, status, message } = response;
                              setErrors({ ...errors });

                              if (status) {
                                 setFormData({});
                                 toast.success(message);
                              } else {
                                 toast.error(message);
                              }
                           },
                        });
                     }}>
                     {isPending && <Spinner />}Simpan
                  </Button>
               </CardFooter>
            </Card>
         </div>
      </div>
   );
}
