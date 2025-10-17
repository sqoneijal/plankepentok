<?php

namespace App\Models\VerifikasiUsulan;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class Pengajuan extends Model
{

   public function handleTerima(array $post): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->where('id', $post['id_usulan']);
         $table->update([
            'status_usulan' => 'verified',
            'modified' => new RawSql('now()'),
            'user_modified' => $post['user_modified']
         ]);
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function updateDokumenStatus(array $post): array
   {
      try {
         $table = $this->db->table('tb_dokumen_pendukung');
         $table->whereIn('id', $post['ids']);
         $table->update([
            'approve' => $post['aksi'],
            'modified' => new RawSql('now()'),
            'user_modified' => $post['user_modified']
         ]);
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function updateIKUStatus(array $post): array
   {
      try {
         $table = $this->db->table('tb_relasi_usulan_iku');
         $table->whereIn('id', $post['ids']);
         $table->update([
            'approve' => $post['aksi'],
            'modified' => new RawSql('now()'),
            'user_modified' => $post['user_modified']
         ]);
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function updateRABStatus(array $post): array
   {
      try {
         $table = $this->db->table('tb_rab_detail');
         $table->whereIn('id', $post['ids']);
         $table->update([
            'approve' => $post['aksi'],
            'modified' => new RawSql('now()'),
            'user_modified' => $post['user_modified']
         ]);
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function submitPerbaiki(int $id, array $post): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->where('id', $id);
         $table->update([
            'catatan_perbaikan' => htmlentities($post['catatan_perbaikan']),
            'user_modified' => $post['user_modified'],
            'modified' => new RawSql('now()'),
            'status_usulan' => 'rejected'
         ]);
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getDokumen(int $id, array $params): array
   {
      $table = $this->db->table('tb_dokumen_pendukung tdp');
      $table->select('tdp.id, tdp.nama_dokumen, tdp.tipe_dokumen, tdp.path_file, tdp.file_dokumen, tdp.id_usulan, tdp.approve');
      $table->where('tdp.id_usulan', $id);
      $table->limit((int) $params['limit'], (int) $params['offset']);
      $table->orderBy('tdp.uploaded', 'desc');

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

   public function getIKU(int $id, array $params): array
   {
      $table = $this->db->table('tb_relasi_usulan_iku trui');
      $table->select('trui.id, trui.id_usulan, trui.id_iku, tim.jenis as jenis_iku, tim.kode as kode_iku, tim.tahun_berlaku as tahun_berlaku_iku, tim.deskripsi as deskripsi_iku, trui.approve');
      $table->join('tb_iku_master tim', 'tim.id = trui.id_iku');
      $table->where('trui.id_usulan', $id);
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

   public function getRAB(int $id, array $params): array
   {
      $table = $this->db->table('tb_rab_detail trd');
      $table->select('trd.id, trd.uraian_biaya, trd.qty, tus.nama as nama_satuan, tus.deskripsi as deskripsi_satuan, trd.harga_satuan, trd.total_biaya, trd.catatan, trd.id_usulan, trd.approve');
      $table->join('tb_unit_satuan tus', 'tus.id = trd.id_satuan', 'left');
      $table->where('trd.id_usulan', $id);
      $table->limit((int) $params['limit'], (int) $params['offset']);
      $table->orderBy('trd.id');

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
         'total' => $clone->countAllResults(),
      ];
   }

   public function getSasaran(int $id): array
   {
      $table = $this->db->table('tb_usulan_kegiatan');
      $table->select('sasaran');
      $table->where('id', $id);
      $table->where('status_usulan', 'submitted');

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

      return [
         'content' => $response,
         'status' => !empty($response)
      ];
   }

   public function getTujuan(int $id): array
   {
      $table = $this->db->table('tb_usulan_kegiatan');
      $table->select('tujuan');
      $table->where('id', $id);
      $table->where('status_usulan', 'submitted');

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

      return [
         'content' => $response,
         'status' => !empty($response)
      ];
   }

   public function getLatarBelakang(int $id): array
   {
      $table = $this->db->table('tb_usulan_kegiatan');
      $table->select('latar_belakang');
      $table->where('id', $id);
      $table->where('status_usulan', 'submitted');

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

      return [
         'content' => $response,
         'status' => !empty($response)
      ];
   }

   public function getAnggaran(int $id): array
   {
      $table = $this->db->table('tb_usulan_kegiatan');
      $table->select('rencana_total_anggaran, total_anggaran');
      $table->where('id', $id);
      $table->where('status_usulan', 'submitted');

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

      return [
         'content' => $response,
         'status' => !empty($response)
      ];
   }

   public function getInformasiDasar(int $id): array
   {
      $table = $this->db->table('tb_usulan_kegiatan');
      $table->select('kode, waktu_mulai, waktu_selesai, tempat_pelaksanaan, tanggal_submit, operator_input, nama, status_usulan, id_unit_pengusul');
      $table->where('id', $id);
      $table->where('status_usulan', 'submitted');

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

      return [
         'content' => $response,
         'status' => !empty($response)
      ];
   }

   public function getData(array $params): array
   {
      $table = $this->db->table('tb_usulan_kegiatan tuk');
      $table->where('tuk.status_usulan', 'submitted');
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
