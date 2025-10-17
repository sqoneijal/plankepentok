<?php

namespace App\Models\Referensi;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class DetailHargaSBM extends Model
{

   public function cariStandarBiaya(string $query): array
   {
      $table = $this->db->table('tb_standar_biaya_master');
      $table->select('id, kode, nama, id_unit_satuan');
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

   public function submit(array $post): array
   {
      try {
         $data = cleanDataSubmit(['id_sbm', 'tahun_anggaran', 'harga_satuan', 'id_satuan', 'tanggal_mulai_efektif', 'tanggal_akhir_efektif', 'status_validasi'], $post);

         $table = $this->db->table('tb_detail_harga_sbm');
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

   public function getDetailEdit(int $id_detail_harga): array
   {
      try {
         $table = $this->db->table('tb_detail_harga_sbm tdhs');
         $table->select('tdhs.*, tsbm.kode as kode_sbm, tsbm.nama as nama_sbm');
         $table->join('tb_standar_biaya_master tsbm', 'tsbm.id = tdhs.id_sbm', 'left');
         $table->where('tdhs.id', $id_detail_harga);

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

   public function handleDelete(int $id_detail_harga): array
   {
      try {
         $table = $this->db->table('tb_detail_harga_sbm');
         $table->where('id', $id_detail_harga);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getData(array $params): array
   {
      $table = $this->db->table('tb_detail_harga_sbm tdhs');
      $table->select('tdhs.id, tsbm.kode as kode_standar_biaya, tsbm.nama as nama_standar_biaya, tdhs.tahun_anggaran, tdhs.harga_satuan, tus.nama as nama_satuan, tus.aktif as status_satuan, tdhs.tanggal_mulai_efektif, tdhs.tanggal_akhir_efektif, tdhs.status_validasi, tdhs.id_satuan');
      $table->join('tb_standar_biaya_master tsbm', 'tsbm.id = tdhs.id_sbm', 'left');
      $table->join('tb_unit_satuan tus', 'tus.id = tdhs.id_satuan', 'left');

      if (@$params['year']) {
         $table->where('tdhs.tahun_anggaran', $params['year']);
      }

      if (@$params['status_validasi']) {
         $table->where('tdhs.status_validasi', $params['status_validasi']);
      }

      tableSearch($table, ['tsbm.kode', 'tsbm.nama', 'tdhs.tahun_anggaran', 'tdhs.harga_satuan', 'tus.nama'], $params);

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
