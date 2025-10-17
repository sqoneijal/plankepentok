<?php

namespace App\Validation;

class MasterIKU
{
   public function submit(?int $id = null): array
   {
      return [
         'jenis' => [
            'rules' => 'required',
            'label' => 'Jenis'
         ],
         'kode' => [
            'rules' => 'required|is_unique[tb_iku_master.kode,id,' . $id . ']',
            'label' => 'Kode'
         ],
         'deskripsi' => [
            'rules' => 'required',
            'label' => 'Deskripsi'
         ],
         'tahun_berlaku' => [
            'rules' => 'required|numeric|exact_length[4]',
            'label' => 'Tahun berlaku'
         ],
      ];
   }
}
