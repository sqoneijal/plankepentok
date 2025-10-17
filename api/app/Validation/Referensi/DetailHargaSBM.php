<?php

namespace App\Validation\Referensi;

class DetailHargaSBM
{
   public function submit(): array
   {
      return [
         'id_sbm' => [
            'rules' => ['required', static function ($value, $data, &$error, $field) {
               $id = @$data['id'];
               if (!$id) {
                  $id_satuan = @$data['id_satuan'];
                  $tahun_anggaran = @$data['tahun_anggaran'];

                  if ($value && $id_satuan && $tahun_anggaran) {
                     $db = db_connect('default');

                     $table = $db->table('tb_detail_harga_sbm');
                     $table->where('id_sbm', $value);
                     $table->where('tahun_anggaran', $tahun_anggaran);
                     $table->where('id_satuan', $id_satuan);

                     $status = $table->countAllResults() > 0;

                     if ($status) {
                        $error = 'Standar biaya sudah terdaftar pada tahun anggaran ' . $tahun_anggaran;
                        return false;
                     }
                  }
                  return true;
               }
               return true;
            }],
            'label' => 'Standar biaya'
         ],
         'tahun_anggaran' => [
            'rules' => 'required',
            'label' => 'Tahun anggaran'
         ],
         'harga_satuan' => [
            'rules' => 'required',
            'label' => 'Harga satuan'
         ],
         'tanggal_mulai_efektif' => [
            'rules' => 'required',
            'label' => 'Tanggal mulai efektif'
         ],
         'status_validasi' => [
            'rules' => 'required',
            'label' => 'Status validasi'
         ],
      ];
   }
}
