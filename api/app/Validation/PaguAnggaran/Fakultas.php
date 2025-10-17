<?php

namespace App\Validation\PaguAnggaran;

class Fakultas
{

   public function handleSubmit(): array
   {
      return [
         'id_fakultas' => [
            'rules' => 'required',
            'label' => 'Fakultas'
         ],
         'tahun' => [
            'rules' => 'required|numeric',
            'label' => 'Tahun'
         ],
         'pagu_unit' => [
            'rules' => 'required|numeric',
            'label' => 'Jumlah pagu'
         ]
      ];
   }
}
