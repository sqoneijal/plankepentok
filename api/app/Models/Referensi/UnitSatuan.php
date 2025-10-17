<?php

namespace App\Models\Referensi;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class UnitSatuan extends Model
{

   public function handleDelete(int $id_unit_satuan): array
   {
      try {
         $table = $this->db->table('tb_unit_satuan');
         $table->where('id', $id_unit_satuan);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getDetailEdit(int $id_unit_satuan): array
   {
      $table = $this->db->table('tb_unit_satuan');
      $table->where('id', $id_unit_satuan);

      $get = $table->get();
      $data = $get->getRowArray();
      $fieldNames = $get->getFieldNames();
      $get->freeResult();

      $response = [];
      if (isset($data)) {
         foreach ($fieldNames as $field) {
            $response[$field] = ($data[$field] ? trim($data[$field]) : (string) $data[$field]);
         }
      }

      return ['status' => isset($data) ? true : false, 'data' => $response];
   }

   public function submit(array $post): array
   {
      try {
         $data = cleanDataSubmit(['nama', 'aktif', 'deskripsi', 'user_modified'], $post);

         $table = $this->db->table('tb_unit_satuan');
         if (@$post['id']) {
            $data['modified'] = new RawSql('now()');

            $table->where('id', $post['id']);
            $table->update($data);
         } else {
            $data['uploaded'] = new RawSql('now()');

            $table->insert($data);
         }
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getData(array $params): array
   {
      $table = $this->db->table('tb_unit_satuan');

      tableSearch($table, ['nama', 'deskripsi'], $params);

      $table->limit((int) $params['limit'], (int) $params['offset']);

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

      return [
         'results' => $response,
         'total' => $clone->countAllResults()
      ];
   }
}
