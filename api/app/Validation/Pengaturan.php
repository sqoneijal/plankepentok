<?php

namespace App\Validation;

class Pengaturan
{

   public function handleSubmit(): array
   {
      return [
         'tahun_anggaran' => [
            'rules' => 'required|numeric',
            'label' => 'Tahun anggaran'
         ],
         'total_pagu' => [
            'rules' => 'required|numeric|greater_than[0]',
            'label' => 'Total pagu'
         ],
         'is_aktif' => [
            'rules' => 'required',
            'label' => 'Status aktif'
         ]
      ];
   }
}
