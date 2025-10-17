<?php

namespace App\Models\UnitKerja;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class Upt extends Model
{
   public function handleDelete(int $id): array
   {
      try {
         $table = $this->db->table('tb_upt_master');
         $table->where('id', $id);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function handleSubmit(array $post): array
   {
      try {
         $data = cleanDataSubmit(['nama', 'id_biro', 'user_modified'], $post);

         $table = $this->db->table('tb_upt_master');

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

   public function handleEditData(int $id): array
   {
      $table = $this->db->table('tb_upt_master');
      $table->select('id, id_biro, nama');
      $table->where('id', $id);

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
      return ['results' => $response];
   }

   public function getData(array $params): array
   {
      $table = $this->db->table('tb_upt_master tum');
      $table->select('tum.id, tum.nama, tbm.nama as nama_biro');
      $table->join('tb_biro_master tbm', 'tbm.id = tum.id_biro', 'left');
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
