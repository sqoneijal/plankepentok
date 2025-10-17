<?php

namespace App\Validation\Referensi;

class StandarBiaya
{

   public function submit(?int $id = null): array
   {
      return [
         'kode' => [
            'rules' => 'required|is_unique[tb_standar_biaya_master.kode,id,' . $id . ']',
            'label' => 'Kode biaya'
         ],
         'nama' => [
            'rules' => 'required',
            'label' => 'Nama biaya'
         ],
         'id_kategori' => [
            'rules' => 'required',
            'label' => 'Kategori biaya'
         ],
         'id_unit_satuan' => [
            'rules' => 'required',
            'label' => 'Unit satuan biaya'
         ],
      ];
   }
}
