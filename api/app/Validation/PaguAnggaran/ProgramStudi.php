<?php

namespace App\Validation\PaguAnggaran;

class ProgramStudi
{

   public function handleSubmit(string $untuk_semua_prodi): array
   {
      return [
         'tahun' => [
            'rules' => 'required|numeric',
            'label' => 'Tahun'
         ],
         'pagu_unit' => [
            'rules' => ['required', 'numeric', 'greater_than[0]', static function ($value, $data, &$error, $field) {
               $pagu_fakultas = (int) @$data['pagu_fakultas'] ?? 0;

               if ((int) $value > $pagu_fakultas) {
                  $error = 'Jumlah pagu unit tidak boleh lebih besar dari sisa pagu fakultas.';
                  return false;
               }
               return true;
            }],
            'label' => 'Jumlah pagu'
         ],
         'id_prodi' => [
            'rules' => $untuk_semua_prodi === 't' ? 'permit_empty' : 'required',
            'label' => 'Program studi'
         ]
      ];
   }
}
