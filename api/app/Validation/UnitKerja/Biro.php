<?php

namespace App\Validation\UnitKerja;

class Biro
{

   public function handleSubmit(): array
   {
      return [
         'nama' => [
            'rules' => 'required',
            'label' => 'Nama biro'
         ]
      ];
   }
}
