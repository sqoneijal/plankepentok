<?php

namespace App\Validation\UnitKerja;

class Lembaga
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
            'label' => 'Nama lembaga'
         ]
      ];
   }
}
