<?php

namespace App\Validation;

class UsulanKegiatan
{

   public function submitRAB(): array
   {
      return [
         'uraian_biaya' => [
            'rules' => 'required',
            'label' => 'Uraian biaya'
         ],
         'qty' => [
            'rules' => 'required|numeric|greater_than[0]',
            'label' => 'Kuantitas'
         ],
         'id_satuan' => [
            'rules' => 'required',
            'label' => 'Satuan'
         ],
         'harga_satuan' => [
            'rules' => 'required|numeric|greater_than[0]',
            'label' => 'Harga satuan'
         ],
         'total_biaya' => [
            'rules' => 'required|numeric|greater_than[0]',
            'label' => 'Total biaya'
         ],
         'catatan' => [
            'rules' => 'required',
            'label' => 'Catatan'
         ]
      ];
   }

   public function submit(?int $id = null): array
   {
      return [
         'kode' => [
            'rules' => 'required|is_unique[tb_usulan_kegiatan.kode,id,' . $id . ']',
            'label' => 'Kode usulan kegiatan'
         ],
         'nama' => [
            'rules' => 'required',
            'label' => 'Nama'
         ],
         'latar_belakang' => [
            'rules' => 'required',
            'label' => 'Latar belakang'
         ],
         'tujuan' => [
            'rules' => 'required',
            'label' => 'Tujuan'
         ],
         'sasaran' => [
            'rules' => 'required',
            'label' => 'Sasaran'
         ],
         'waktu_mulai' => [
            'rules' => 'required',
            'label' => 'Tanggal mulai'
         ],
         'waktu_selesai' => [
            'rules' => 'required',
            'label' => 'Tanggal selesai'
         ],
         'tempat_pelaksanaan' => [
            'rules' => 'required',
            'label' => 'Tempat pelaksanaan'
         ],
         'id_unit_pengusul' => [
            'rules' => 'required',
            'label' => 'Unit pengusul'
         ],
         'rencana_total_anggaran' => [
            'rules' => 'required|numeric',
            'label' => 'Rencana total anggaran'
         ]
      ];
   }
}
