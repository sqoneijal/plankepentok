<?php

namespace App\Validation\UnitKerja;

class Fakultas
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
            'label' => 'Nama fakultas'
         ]
      ];
   }
}
