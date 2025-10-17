<?php

namespace App\Validation\Referensi;

class UnitSatuan
{

   public function submit(): array
   {
      return [
         'nama' => [
            'rules' => 'required',
            'label' => 'Nama satuan unit',
         ],
         'aktif' => [
            'rules' => 'required',
            'label' => 'Status'
         ]
      ];
   }
}
