<?php

namespace App\Models;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class Pengaturan extends Model
{

   public function handleDelete(int $id_pengaturan): array
   {
      try {
         $table = $this->db->table('tb_pengaturan');
         $table->where('id', $id_pengaturan);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getDataEdit(int $id_pengaturan): array
   {
      $table = $this->db->table('tb_pengaturan');
      $table->select('id, tahun_anggaran, total_pagu, is_aktif');
      $table->where('id', $id_pengaturan);

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
      return ['data' => $response, 'status' => !empty($response)];
   }

   public function handleSubmit(array $post): array
   {
      try {
         $data = cleanDataSubmit(['tahun_anggaran', 'total_pagu', 'is_aktif', 'user_modified'], $post);

         $table = $this->db->table('tb_pengaturan');
         if (@$post['id']) {
            $data['modified'] = new RawSql('now()');

            $table->where('id', $post['id']);
            $table->update($data);

            if ($post['is_aktif'] === 't') {
               $this->updateStatusAktifLainnya($post['id']);
            }
         } else {
            $data['uploaded'] = new RawSql('now()');

            $table->ignore(true)->insert($data);

            $this->updateStatusAktifLainnya($this->db->insertID('tb_pengaturan_id_seq'));
         }
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   private function updateStatusAktifLainnya(int $id): void
   {
      $table = $this->db->table('tb_pengaturan');
      $table->where('id !=', $id);
      $table->update(['is_aktif' => false]);
   }

   public function getData(array $params): array
   {
      $table = $this->db->table('tb_pengaturan');
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
