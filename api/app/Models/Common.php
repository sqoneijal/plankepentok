<?php

namespace App\Models;

use CodeIgniter\Model;

class Common extends Model
{

   public function getDaftarBiro(): array
   {
      $table = $this->db->table('tb_biro_master');
      $table->orderBy('nama');

      $clone = clone $table;

      $get = $table->get();
      $result = $get->getResultArray();
      $fieldNames = $get->getFieldNames();
      $get->freeResult();

      $response = [];
      foreach ($result as $key => $val) {
         foreach ($fieldNames as $field) {
            $response[$key][$field] = $val[$field] ? trim($val[$field]) : (string) $val[$field];
         }
      }
      return ['results' => $response, 'total' => $clone->countAllResults()];
   }

   public function getDaftarUnitSatuan(): array
   {
      $table = $this->db->table('tb_unit_satuan');
      $table->select('id, nama, deskripsi');
      $table->where('aktif', true);
      $table->orderBy('nama');

      $get = $table->get();
      $result = $get->getResultArray();
      $fieldNames = $get->getFieldNames();
      $get->freeResult();

      $response = [];
      foreach ($result as $key => $val) {
         foreach ($fieldNames as $field) {
            $response[$key][$field] = $val[$field] ? trim($val[$field]) : (string) $val[$field];
         }
      }
      return $response;
   }

   public function getDaftarFakultas(): array
   {
      $table = $this->db->table('tb_fakultas_master');
      $table->select('id as value, nama as label');
      $table->orderBy('nama');

      $get = $table->get();
      $result = $get->getResultArray();
      $fieldNames = $get->getFieldNames();
      $get->freeResult();

      $response = [];
      foreach ($result as $key => $val) {
         foreach ($fieldNames as $field) {
            $response[$key][$field] = $val[$field] ? trim($val[$field]) : (string) $val[$field];
         }
      }
      return ['data' => $response];
   }

   public function getDaftarProgramStudi(): array
   {
      $table = $this->db->table('tb_prodi_master');
      $table->select('id as value, nama as label, id_fakultas');
      $table->orderBy('nama');

      $get = $table->get();
      $result = $get->getResultArray();
      $fieldNames = $get->getFieldNames();
      $get->freeResult();

      $response = [];
      foreach ($result as $key => $val) {
         foreach ($fieldNames as $field) {
            $response[$key][$field] = $val[$field] ? trim($val[$field]) : (string) $val[$field];
         }
      }
      return ['data' => $response];
   }
}
