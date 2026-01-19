import { TorSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { detailLabel } from "@/helpers/init";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { decode } from "html-entities";

export default function Detail({ id_usulan_kegiatan }: Readonly<{ id_usulan_kegiatan: string }>) {
   const { results, isLoading } = useGetQueryDetail(`/usulan-kegiatan/tor`, id_usulan_kegiatan);

   if (isLoading) {
      return <TorSkeleton />;
   }

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Term of Reference (TOR)</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Penyelenggara",
                        value: results?.penyelenggara || "-",
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Program",
                        value: results?.program || "-",
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Kegiatan",
                        value: results?.kegiatan || "-",
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Indikator Kinerja Kegiatan",
                        value: results?.ikk || "-",
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-4">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Jenis Keluaran (Output)",
                        value:
                           results?.jenis_keluaran_tor
                              ?.map((item: { mst_jenis_keluaran_tor: { nama: string } }) => item.mst_jenis_keluaran_tor.nama)
                              .join(", ") || "-",
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-4">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Volume Keluaran (Output)",
                        value:
                           results?.volume_keluaran_tor
                              ?.map((item: { mst_volume_keluaran_tor: { nama: string } }) => item.mst_volume_keluaran_tor.nama)
                              .join(", ") || "-",
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-4">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Penerima Manfaat",
                        value:
                           results?.penerima_manfaat_tor
                              ?.map((item: { mst_penerima_manfaat_tor: { nama: string } }) => item.mst_penerima_manfaat_tor.nama)
                              .join(", ") || "-",
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Satuan Ukuran Keluaran",
                        value: results?.satuan_ukuran_keluaran || "-",
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Dasar Hukum",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.dasar_hukum) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Gambaran Umum",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.gambaran_umum) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Alasan Kegiatan Dilaksanakan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.alasan_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Uraian Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.uraian_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Batasan Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.batasan_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Maksud Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.maksud_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Tujuan Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.tujuan_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Indikator Keluaran",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.indikator_keluaran) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Keluaran",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.keluaran) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Metode Pelaksanaan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.metode_pelaksanaan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Tahapan Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.tahapan_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Tempat Pelaksanaan Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.tempat_pelaksanaan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Pelaksana Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.pelaksana_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Penanggung Jawab Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.penanggung_jawab) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Jadwal Kegiatan",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.jadwal_kegiatan) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="mb-4">
                     {detailLabel({
                        label: "Biaya",
                        value: (
                           <div
                              className="text-sm text-gray-900 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: decode(results?.biaya) || "-" }}
                           />
                        ),
                     })}
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
