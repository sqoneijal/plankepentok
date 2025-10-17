<?php

namespace App\Validation\Referensi;

class KategoriSBM
{

   public function submit(?int $id = null)
   {
      return [
         'kode' => [
            'rules' => 'required|is_unique[tb_kategori_sbm.kode,id,' . $id . ']',
            'label' => 'Kode kategori SBM'
         ],
         'nama' => [
            'rules' => 'required',
            'label' => 'Nama kategori SBM'
         ]
      ];
   }
}
