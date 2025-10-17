<?php

namespace App\Validation\UnitKerja;

class Upt
{
   public function handleSubmit(): array
   {
      return [
         'id_biro' => [
            'rules' => 'required',
            'label' => 'Biro'
         ],
         'nama' => [
            'rules' => 'required',
            'label' => 'Nama UPT'
         ]
      ];
   }
}
