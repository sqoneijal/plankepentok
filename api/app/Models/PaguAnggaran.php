<?php

namespace App\Models;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;

class PaguAnggaran extends Model
{

   public function handleUpdate(array $post): array
   {
      try {
         $pagu = $post['pagu'];

         if ($pagu === 'biro') {
            $this->handleUpdatePaguBiro($post);
         } elseif ($pagu === 'lembaga') {
            $this->handleUpdatePaguLembaga($post);
         } elseif ($pagu === 'upt') {
            $this->handleUpdatePaguUPT($post);
         } elseif ($pagu === 'fakultas') {
            $this->handleUpdatePaguFakultas($post);
         } elseif ($pagu === 'prodi') {
            $this->handleUpdatePaguProdi($post);
         }
         return ['status' => true, 'message' => 'Data berhasil diperbarui.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   private function handleUpdatePaguProdi(array $post): void
   {
      $data = cleanDataSubmit(['total_pagu', 'user_modified'], $post);
      $data['modified'] = new RawSql('now()');

      $table = $this->db->table('tb_pagu_anggaran_prodi');
      $table->where('id_prodi', $post['id']);
      $table->where('tahun_anggaran', $post['tahun_anggaran']);
      $table->update($data);
   }

   private function handleUpdatePaguFakultas(array $post): void
   {
      $data = cleanDataSubmit(['total_pagu', 'user_modified'], $post);
      $data['modified'] = new RawSql('now()');

      $table = $this->db->table('tb_pagu_anggaran_fakultas');
      $table->where('id_fakultas', $post['id']);
      $table->where('tahun_anggaran', $post['tahun_anggaran']);
      $table->update($data);
   }

   private function handleUpdatePaguUPT(array $post): void
   {
      $data = cleanDataSubmit(['total_pagu', 'user_modified'], $post);
      $data['modified'] = new RawSql('now()');

      $table = $this->db->table('tb_pagu_anggaran_upt');
      $table->where('id_upt', $post['id']);
      $table->where('tahun_anggaran', $post['tahun_anggaran']);
      $table->update($data);
   }

   private function handleUpdatePaguLembaga(array $post): void
   {
      $data = cleanDataSubmit(['total_pagu', 'user_modified'], $post);
      $data['modified'] = new RawSql('now()');

      $table = $this->db->table('tb_pagu_anggaran_lembaga');
      $table->where('id_lembaga', $post['id']);
      $table->where('tahun_anggaran', $post['tahun_anggaran']);
      $table->update($data);
   }

   private function handleUpdatePaguBiro(array $post): void
   {
      $data = cleanDataSubmit(['total_pagu', 'user_modified'], $post);
      $data['modified'] = new RawSql('now()');

      $table = $this->db->table('tb_pagu_anggaran_biro');
      $table->where('id_biro', $post['id']);
      $table->where('tahun_anggaran', $post['tahun_anggaran']);
      $table->update($data);
   }

   public function getPaguUPT(int $tahun_anggaran): array
   {
      $result = $this->queryDaftarPaguUPT($tahun_anggaran);

      $id_upt = [];
      foreach ($result as $row) {
         if ($row['id_pagu'] === '' || empty($row['id_pagu'])) {
            $id_upt[] = $row['id'];
         }
      }

      if (!empty($id_upt)) {
         $this->generateDefaultPaguUPT($id_upt, $tahun_anggaran);
         return ['results' => $this->queryDaftarPaguUPT($tahun_anggaran)];
      } else {
         return ['results' => $result];
      }
   }

   private function generateDefaultPaguUPT(array $id_upt, int $tahun_anggaran): void
   {
      $data = [];
      foreach ($id_upt as $id) {
         array_push($data, [
            'id_upt' => $id,
            'tahun_anggaran' => $tahun_anggaran,
            'uploaded' => new RawSql('now()')
         ]);
      }

      $table = $this->db->table('tb_pagu_anggaran_upt');
      $table->insertBatch($data);
   }

   private function queryDaftarPaguUPT(int $tahun_anggaran): array
   {
      $table = $this->db->table('tb_upt_master tum');
      $table->select('tum.id, tum.id_biro, tum.nama, tpau.id as id_pagu, tpau.tahun_anggaran, tpau.total_pagu, tpau.realisasi');
      $table->join('tb_pagu_anggaran_upt tpau', 'tpau.id_upt = tum.id and tpau.tahun_anggaran = ' . $tahun_anggaran, 'left');
      $table->orderBy('tum.nama');

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

   public function getPaguLembaga(int $tahun_anggaran): array
   {
      $result = $this->queryDaftarPaguLembaga($tahun_anggaran);

      $id_lembaga = [];
      foreach ($result as $row) {
         if ($row['id_pagu'] === '' || empty($row['id_pagu'])) {
            $id_lembaga[] = $row['id'];
         }
      }

      if (!empty($id_lembaga)) {
         $this->generateDefaultPaguLembaga($id_lembaga, $tahun_anggaran);
         return ['results' => $this->queryDaftarPaguLembaga($tahun_anggaran)];
      } else {
         return ['results' => $result];
      }
   }

   private function generateDefaultPaguLembaga(array $id_lembaga, int $tahun_anggaran): void
   {
      $data = [];
      foreach ($id_lembaga as $id) {
         array_push($data, [
            'id_lembaga' => $id,
            'tahun_anggaran' => $tahun_anggaran,
            'uploaded' => new RawSql('now()')
         ]);
      }

      $table = $this->db->table('tb_pagu_anggaran_lembaga');
      $table->insertBatch($data);
   }

   private function queryDaftarPaguLembaga(int $tahun_anggaran): array
   {
      $table = $this->db->table('tb_lembaga_master tlm');
      $table->select('tlm.id, tlm.nama, tlm.id_biro, tpal.id as id_pagu, tpal.tahun_anggaran, tpal.total_pagu, tpal.realisasi');
      $table->join('tb_pagu_anggaran_lembaga tpal', 'tpal.id_lembaga = tlm.id and tpal.tahun_anggaran = ' . $tahun_anggaran, 'left');
      $table->orderBy('tlm.nama');

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

   public function getPaguProgramStudi(int $tahun_anggaran): array
   {
      $result = $this->queryDaftarPaguProgramStudi($tahun_anggaran);

      $id_prodi = [];
      foreach ($result as $row) {
         if ($row['id_pagu'] === '' || empty($row['id_pagu'])) {
            $id_prodi[] = $row['id'];
         }
      }

      if (!empty($id_prodi)) {
         $this->generateDefaultPaguProgramStudi($id_prodi, $tahun_anggaran);
         return ['results' => $this->queryDaftarPaguProgramStudi($tahun_anggaran)];
      } else {
         return ['results' => $result];
      }
   }

   private function generateDefaultPaguProgramStudi(array $id_prodi, int $tahun_anggaran)
   {
      $data = [];
      foreach ($id_prodi as $id) {
         array_push($data, [
            'id_prodi' => $id,
            'tahun_anggaran' => $tahun_anggaran,
            'uploaded' => new RawSql('now()')
         ]);
      }

      $table = $this->db->table('tb_pagu_anggaran_prodi');
      $table->insertBatch($data);
   }

   private function queryDaftarPaguProgramStudi(int $tahun_anggaran): array
   {
      $table = $this->db->table('tb_prodi_master tpm');
      $table->select('tpm.id, tpm.id_fakultas, tpm.nama as program_studi, tpap.id as id_pagu, tpap.tahun_anggaran, tpap.total_pagu, tpap.realisasi');
      $table->join('tb_pagu_anggaran_prodi tpap', 'tpap.id_prodi = tpm.id and tpap.tahun_anggaran = ' . $tahun_anggaran, 'left');
      $table->orderBy('tpm.nama');

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

   public function getPaguFakultas(int $tahun_anggaran): array
   {
      $result = $this->queryDaftarPaguFakultas($tahun_anggaran);

      $id_fakultas = [];
      foreach ($result as $row) {
         if ($row['id_pagu'] === '' || empty($row['id_pagu'])) {
            $id_fakultas[] = $row['id'];
         }
      }

      if (!empty($id_fakultas)) {
         $this->generateDefaultPaguFakultas($id_fakultas, $tahun_anggaran);
         return ['results' => $this->queryDaftarPaguFakultas($tahun_anggaran)];
      } else {
         return ['results' => $result];
      }
   }

   private function queryDaftarPaguFakultas(int $tahun_anggaran): array
   {
      $table = $this->db->table('tb_fakultas_master tfm');
      $table->select('tfm.*, tpaf.id as id_pagu, tpaf.tahun_anggaran, tpaf.tahun_anggaran, tpaf.total_pagu, tpaf.realisasi');
      $table->join('tb_pagu_anggaran_fakultas tpaf', 'tpaf.id_fakultas = tfm.id and tpaf.tahun_anggaran = ' . $tahun_anggaran, 'left');
      $table->orderBy('tfm.nama');

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

   public function getPaguBiro(int $tahun_anggaran): array
   {
      $result = $this->queryDaftarPaguBiro($tahun_anggaran);

      $id_biro = [];
      foreach ($result as $row) {
         if ($row['id_pagu_biro'] === '' || empty($row['id_pagu_biro'])) {
            $id_biro[] = $row['id'];
         }
      }

      if (!empty($id_biro)) {
         $this->generateDefaultPaguBiro($id_biro, $tahun_anggaran);
         return ['results' => $this->queryDaftarPaguBiro($tahun_anggaran)];
      } else {
         return ['results' => $result];
      }
   }

   private function queryDaftarPaguBiro(int $tahun_anggaran)
   {
      $table = $this->db->table('tb_biro_master tbm');
      $table->select('tbm.id, tbm.nama, tpab.id as id_pagu_biro, tpab.tahun_anggaran, tpab.total_pagu, tpab.realisasi');
      $table->join('tb_pagu_anggaran_biro tpab', 'tpab.id_biro = tbm.id and tpab.tahun_anggaran = ' . $tahun_anggaran, 'left');
      $table->orderBy('tbm.nama');

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

   private function generateDefaultPaguFakultas(array $id_fakultas, int $tahun_anggaran)
   {
      $data = [];
      foreach ($id_fakultas as $id) {
         array_push($data, [
            'id_fakultas' => $id,
            'tahun_anggaran' => $tahun_anggaran,
            'uploaded' => new RawSql('now()')
         ]);
      }

      $table = $this->db->table('tb_pagu_anggaran_fakultas');
      $table->insertBatch($data);
   }

   private function generateDefaultPaguBiro(array $id_biro, int $tahun_anggaran)
   {
      $data = [];
      foreach ($id_biro as $id) {
         array_push($data, [
            'id_biro' => $id,
            'tahun_anggaran' => $tahun_anggaran,
            'uploaded' => new RawSql('now()')
         ]);
      }

      $table = $this->db->table('tb_pagu_anggaran_biro');
      $table->insertBatch($data);
   }

   public function getTahunAnggaran(): array
   {
      $table = $this->db->table('tb_pengaturan');
      $table->select('tahun_anggaran, is_aktif');
      $table->orderBy('tahun_anggaran', 'desc');

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

   public function getPaguUniversitas(int $tahun_anggaran): array
   {
      $table = $this->db->table('tb_pengaturan');
      $table->where('tahun_anggaran', $tahun_anggaran);

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

      return ['results' => $response, 'status' => !empty($response)];
   }
}
