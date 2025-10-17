<?php

namespace App\Models\Referensi;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class StandarBiaya extends Model
{

   public function handleDelete(int $id_standar_biaya): array
   {
      try {
         $table = $this->db->table('tb_standar_biaya_master');
         $table->where('id', $id_standar_biaya);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getDetailEdit(int $id_standar_biaya): array
   {
      try {
         $table = $this->db->table('tb_standar_biaya_master tsbm');
         $table->select('tsbm.*, tks.kode as kode_kategori, tks.nama as nama_kategori, tus.nama as unit_satuan');
         $table->join('tb_kategori_sbm tks', 'tks.id = tsbm.id_kategori', 'left');
         $table->join('tb_unit_satuan tus', 'tus.id = tsbm.id_unit_satuan', 'left');
         $table->where('tsbm.id', $id_standar_biaya);

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

   public function getData(array $params): array
   {
      $table = $this->db->table('tb_standar_biaya_master tsbm');
      $table->select('tsbm.id, tsbm.kode, tsbm.nama, tsbm.deskripsi, tks.kode as kode_kategori, tks.nama as nama_kategori, tus.nama as nama_unit_satuan, tus.deskripsi as deskripsi_unit_satuan');
      $table->join('tb_kategori_sbm tks', 'tks.id = tsbm.id_kategori', 'left');
      $table->join('tb_unit_satuan tus', 'tus.id = tsbm.id_unit_satuan', 'left');
      tableSearch($table, ['tsbm.kode', 'tsbm.nama', 'tsbm.deskripsi', 'tks.kode', 'tks.nama', 'tus.nama', 'tus.deskripsi'], $params);
      $table->limit((int) $params['limit'], (int) $params['offset']);
      $table->orderBy('tsbm.kode');

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

   public function submit(array $post): array
   {
      try {
         $data = cleanDataSubmit(['user_modified', 'kode', 'nama', 'id_kategori', 'id_unit_satuan', 'deskripsi'], $post);

         $table = $this->db->table('tb_standar_biaya_master');
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

   public function cariKategoriSBM(string $query): array
   {
      $table = $this->db->table('tb_kategori_sbm');
      $table->select('id, kode, nama');
      $table->groupStart();
      $table->like('trim(lower(kode))', $query);
      $table->orLike('trim(lower(nama))', $query);
      $table->groupEnd();
      $table->limit(25);

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

   public function cariUnitSatuan(string $query): array
   {
      $table = $this->db->table('tb_unit_satuan');
      $table->select('id, nama');
      $table->like('trim(lower(nama))', $query);
      $table->limit(25);

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
}
