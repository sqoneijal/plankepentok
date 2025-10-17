<?php

namespace App\Models;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class MasterIKU extends Model
{

   public function handleDelete(int $id): array
   {
      try {
         $table = $this->db->table('tb_iku_master');
         $table->where('id', $id);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getDetailEdit(int $id): array
   {
      try {
         $table = $this->db->table('tb_iku_master');
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

         return ['status' => true, 'data' => $response];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function submit(array $post): array
   {
      try {
         $data = cleanDataSubmit(['jenis', 'kode', 'deskripsi', 'tahun_berlaku', 'user_modified'], $post);

         $table = $this->db->table('tb_iku_master');
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
      $table = $this->db->table('tb_iku_master');

      if (@$params['year']) {
         $table->where('tahun_berlaku', $params['year']);
      }

      tableSearch($table, ['kode', 'jenis', 'deskripsi'], $params);
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
