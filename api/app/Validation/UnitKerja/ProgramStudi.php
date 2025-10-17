<?php

namespace App\Validation\UnitKerja;

class ProgramStudi
{
   public function handleSubmit(): array
   {
      return [
         'id_fakultas' => [
            'rules' => 'required',
            'label' => 'Fakultas'
         ],
         'nama' => [
            'rules' => 'required',
            'label' => 'Nama program studi'
         ]
      ];
   }
}
