<?php

namespace App\Models;

use CodeIgniter\Database\RawSql;
use CodeIgniter\Model;
use phpseclib3\Net\SFTP;

class UsulanKegiatan extends Model
{

   public function getStatusUsulan(int $id): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->select('status_usulan');
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

   public function submitPengajuan(array $post): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->where('id', $post['id_usulan']);
         $table->update(
            [
               'status_usulan' => 'submitted',
               'tanggal_submit' => new RawSql('now()')
            ]
         );

         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getDataEdit(int $id): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan tuk');
         $table->select('tuk.id, tuk.kode, tuk.nama, tuk.latar_belakang, tuk.tujuan, tuk.sasaran, tuk.waktu_mulai, tuk.waktu_selesai, tuk.tempat_pelaksanaan, tuk.id_unit_pengusul, tuk.rencana_total_anggaran');
         $table->where('tuk.id', $id);

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

   public function deleteIKU(int $id_usulan, int $id): array
   {
      try {
         $table = $this->db->table('tb_relasi_usulan_iku');
         $table->where('id_usulan', $id_usulan);
         $table->where('id', $id);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function submitIKU(array $post): array
   {
      try {
         $data = cleanDataSubmit(['user_modified', 'id_usulan', 'id_iku'], $post);

         $data['uploaded'] = new RawSql('now()');

         $table = $this->db->table('tb_relasi_usulan_iku');
         $table->ignore(true)->insert($data);
         return ['status' => true, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function deleteUsulanKegiatan(int $id): array
   {
      try {
         $this->db->table('tb_usulan_kegiatan')->where('id', $id)->delete();
         $this->db->table('tb_rab_detail')->where('id_usulan', $id)->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function deleteDokumen(int $id): array
   {
      try {
         $table = $this->db->table('tb_dokumen_pendukung');
         $table->select('file_dokumen');
         $table->where('id', $id);

         $get = $table->get();
         $data = $get->getRowArray();
         $get->freeResult();

         if (isset($data) && !empty($data['file_dokumen'])) {
            // Connect to SFTP server
            $sftp = new SFTP(env('CDN_HOST'));
            if (!$sftp->login(env('CDN_USER'), env('CDN_PASS'))) {
               return ['status' => false, 'message' => 'SFTP login failed.'];
            }

            // Delete the file on the server
            $filePath = '/usr/share/nginx/cdn/plankepentok/' . $data['file_dokumen'];
            if ($sftp->file_exists($filePath)) {
               $sftp->delete($filePath);
            }
         }

         // Delete the record from the database
         $this->db->table('tb_dokumen_pendukung')->where('id', $id)->delete();

         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function deleteRAB(int $id): array
   {
      try {
         $table = $this->db->table('tb_rab_detail');
         $table->where('id', $id);
         $table->delete();
         return ['status' => true, 'message' => 'Data berhasil dihapus.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getDataRAB(int $id_usulan_kegiatan, array $params): array
   {
      $table = $this->db->table('tb_rab_detail trd');
      $table->select('trd.id, trd.id_usulan, trd.uraian_biaya, trd.qty, trd.id_satuan, trd.harga_satuan, trd.total_biaya, trd.catatan, tus.nama as nama_satuan, tus.deskripsi as deskripsi_satuan, trd.approve');
      $table->join('tb_unit_satuan tus', 'tus.id = trd.id_satuan', 'left');
      $table->where('trd.id_usulan', $id_usulan_kegiatan);
      $table->limit((int) $params['limit'], (int) $params['offset']);
      $table->orderBy('trd.id', 'desc');

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

   public function submitRAB(array $post): array
   {
      try {
         $data = cleanDataSubmit(['id_usulan', 'uraian_biaya', 'qty', 'id_satuan', 'harga_satuan', 'total_biaya', 'catatan', 'user_modified'], $post);

         $table = $this->db->table('tb_rab_detail');
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

   public function getDetail(int $id_usulan_kegiatan, string $type): array
   {
      $response = [];
      if ($type === 'informasi-dasar') {
         $response = $this->getInformasiDasar($id_usulan_kegiatan);
      } elseif ($type === 'anggaran') {
         $response = $this->getAnggaran($id_usulan_kegiatan);
      } elseif ($type === 'latar-belakang') {
         $response = $this->getLatarBelakang($id_usulan_kegiatan);
      } elseif ($type === 'tujuan') {
         $response = $this->getTujuan($id_usulan_kegiatan);
      } elseif ($type === 'sasaran') {
         $response = $this->getSasaran($id_usulan_kegiatan);
      } elseif ($type === 'dokumen') {
         $response = $this->getDokumen($id_usulan_kegiatan);
      } elseif ($type === 'iku') {
         $response = $this->getRelasiIKU($id_usulan_kegiatan);
      }
      return $response;
   }

   private function getRelasiIKU(int $id_usulan_kegiatan): array
   {
      $table = $this->db->table('tb_relasi_usulan_iku trui');
      $table->select('trui.id, trui.id_usulan, trui.id_iku, tim.jenis as jenis_iku, tim.kode as kode_iku, tim.tahun_berlaku as tahun_berlaku_iku, tim.deskripsi as deskripsi_iku, trui.approve');
      $table->join('tb_iku_master tim', 'tim.id = trui.id_iku');
      $table->where('trui.id_usulan', $id_usulan_kegiatan);

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

   private function getDokumen(int $id_usulan_kegiatan): array
   {
      try {
         $table = $this->db->table('tb_dokumen_pendukung tdp');
         $table->select('tdp.id, tdp.nama_dokumen, tdp.tipe_dokumen, tdp.path_file, tdp.file_dokumen, tdp.id_usulan, tdp.approve');
         $table->where('tdp.id_usulan', $id_usulan_kegiatan);
         $table->orderBy('tdp.id', 'desc');

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

         return ['status' => true, 'results' => $response, 'total' => $clone->countAllResults()];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   private function getSasaran(int $id_usulan_kegiatan): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->select('sasaran, status_usulan');
         $table->where('id', $id_usulan_kegiatan);

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

   private function getTujuan(int $id_usulan_kegiatan): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->select('tujuan, status_usulan');
         $table->where('id', $id_usulan_kegiatan);

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

   private function getLatarBelakang(int $id_usulan_kegiatan): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->select('latar_belakang, status_usulan');
         $table->where('id', $id_usulan_kegiatan);

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

   private function getAnggaran(int $id_usulan_kegiatan): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan');
         $table->select('total_anggaran, rencana_total_anggaran, status_usulan');
         $table->where('id', $id_usulan_kegiatan);

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

   private function getInformasiDasar(int $id_usulan_kegiatan): array
   {
      try {
         $table = $this->db->table('tb_usulan_kegiatan tuk');
         $table->select('tuk.id, tuk.kode, tuk.nama, tuk.waktu_mulai as tanggal_mulai, tuk.waktu_selesai as tanggal_selesai, tuk.tempat_pelaksanaan, tuk.id_unit_pengusul, tuk.operator_input, tuk.status_usulan, tuk.tanggal_submit as tanggal_pengajuan');
         $table->where('tuk.id', $id_usulan_kegiatan);

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
         $data = cleanDataSubmit(['kode', 'nama', 'latar_belakang', 'tujuan', 'sasaran', 'waktu_mulai', 'waktu_selesai', 'tempat_pelaksanaan', 'id_unit_pengusul', 'rencana_total_anggaran', 'user_modified'], $post);

         $table = $this->db->table('tb_usulan_kegiatan');
         if (@$post['id']) {
            $data['modified'] = new RawSql('now()');

            $table->where('id', $post['id']);
            $table->update($data);

            $id_usulan_kegiatan = $post['id'];
         } else {
            $data['tanggal_submit'] = new RawSql('now()');
            $data['operator_input'] = $post['user_modified'];
            $data['uploaded'] = new RawSql('now()');

            $table->insert($data);

            $id_usulan_kegiatan = $this->db->insertID('tb_usulan_kegiatan_id_seq');
         }

         return ['status' => true, 'id_usulan_kegiatan' => $id_usulan_kegiatan, 'message' => 'Data berhasil disimpan.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function submitDokumen(array $data): array
   {
      try {
         $insertData = array_merge($data, [
            'uploaded' => new RawSql('now()'),
            'modified' => new RawSql('now()'),
         ]);

         $table = $this->db->table('tb_dokumen_pendukung');
         $table->insert($insertData);

         return ['status' => true, 'message' => 'Dokumen berhasil diupload.'];
      } catch (\Exception $e) {
         return ['status' => false, 'message' => $e->getMessage()];
      }
   }

   public function getData(array $params): array
   {
      $table = $this->db->table('tb_usulan_kegiatan tuk');
      $table->select('tuk.id, tuk.kode, tuk.nama, tuk.waktu_mulai, tuk.waktu_selesai, tuk.tempat_pelaksanaan, tuk.total_anggaran, tuk.rencana_total_anggaran, tuk.status_usulan');

      if (@$params['status_usulan']) {
         $table->where('tuk.status_usulan', $params['status_usulan']);
      }

      tableSearch($table, ['tuk.kode', 'tuk.nama', 'tuk.tempat_pelaksanaan'], $params);
      $table->limit((int) $params['limit'], (int) $params['offset']);
      $table->orderBy('tuk.id', 'desc');

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
