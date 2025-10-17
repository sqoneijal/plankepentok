<?php

namespace App\Models\Referensi;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class KategoriSBM extends Model
{

   public function getDetailEdit(int $id_kategori_sbm): array
   {
      try {
         $table = $this->db->table('tb_kategori_sbm');
         $table->where('id', $id_kategori_sbm);

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

   public function handleDelete(int $id_kategori_sbm): array
   {
      try {
         $table = $this->db->table('tb_kategori_sbm');
         $table->where('id', $id_kategori_sbm);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function submit(array $post): array
   {
      try {
         $data = cleanDataSubmit(['kode', 'nama', 'user_modified', 'deskripsi'], $post);

         $table = $this->db->table('tb_kategori_sbm');
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
      $table = $this->db->table('tb_kategori_sbm');
      tableSearch($table, ['kode', 'nama', 'deskripsi'], $params);
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
