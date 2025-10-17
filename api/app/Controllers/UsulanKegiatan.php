<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\UsulanKegiatan as Model;
use App\Validation\UsulanKegiatan as Validate;
use App\Models\Common;
use phpseclib3\Net\SFTP;

class UsulanKegiatan extends BaseController
{

   public function index(): object
   {
      $model = new Model();
      $data = $model->getData($this->request->getGet());
      return $this->respond($data);
   }

   public function submitPengajuan(): object
   {
      $model = new Model();
      $data = $model->submitPengajuan((array) $this->request->getJSON());
      return $this->respond($data);
   }

   public function getStatusUsulan(int $id): object
   {
      $model = new Model();
      $data = $model->getStatusUsulan($id);
      return $this->respond($data);
   }

   public function getDataEdit(int $id): object
   {
      $model = new Model();
      $data = $model->getDataEdit($id);
      return $this->respond($data);
   }

   public function deleteIKU(int $id_usulan, int $id): object
   {
      $model = new Model();
      $data = $model->deleteIKU($id_usulan, $id);
      return $this->respond($data);
   }

   public function submitIKU(): object
   {
      $model = new Model();
      $data = $model->submitIKU((array) $this->request->getJSON());
      return $this->respond($data);
   }

   private function uploadToSFTP($localPath, $remoteDir, $fileName, &$response): string
   {
      $sftp = new SFTP(env('CDN_HOST'));
      if (!$sftp->login(env('CDN_USER'), env('CDN_PASS'))) {
         $response['message'] = 'SFTP login failed.';
         $response['errors'] = ['file_dokumen' => 'SFTP login failed.'];
         return false;
      }

      if (!$sftp->is_dir($remoteDir)) {
         $sftp->mkdir($remoteDir, -1, true);
      }

      $sftp->put($remoteDir . '/' . $fileName, file_get_contents($localPath));

      @unlink($localPath);

      return 'https://cdn.ar-raniry.ac.id/plankepentok/' . $fileName;
   }

   private function processFileUpload($file, &$response): array
   {
      $result = false;
      if ($file && $file->isValid() && !$file->hasMoved()) {
         if (file_exists($file->getTempName())) {
            $extension = strtolower(pathinfo($file->getClientName(), PATHINFO_EXTENSION));
            $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];
            if (in_array($extension, $allowedExtensions)) {
               $upload_path = WRITEPATH . 'uploads';
               $getRandomName = $file->getRandomName();
               $file->move($upload_path, $getRandomName);

               $remoteDir = '/usr/share/nginx/cdn/plankepentok';
               $newName = $this->uploadToSFTP($upload_path . '/' . $getRandomName, $remoteDir, $getRandomName, $response);
               if ($newName !== false) {
                  $result = ['newName' => $newName, 'extension' => $extension];
               }
            } else {
               $response['message'] = 'Tipe file tidak diizinkan.';
               $response['errors'] = ['file_dokumen' => 'Tipe file tidak diizinkan.'];
            }
         } else {
            $response['message'] = 'File upload failed.';
            $response['errors'] = ['file_dokumen' => 'File upload failed.'];
         }
      } else {
         $response['message'] = 'File tidak valid atau gagal diupload.';
         $response['errors'] = ['file_dokumen' => 'File tidak valid atau gagal diupload.'];
      }
      return $result;
   }

   public function submitDokumen(int $id_usulan_kegiatan): object
   {
      $response = ['status' => false, 'errors' => []];

      $rules = [
         'nama_dokumen' => [
            'rules' => 'required',
            'label' => 'Nama dokumen'
         ],
      ];

      if ($this->validate($rules)) {
         $file = $this->request->getFile('file_dokumen');
         $namaDokumen = $this->request->getPost('nama_dokumen');
         $userModified = $this->request->getPost('user_modified');

         $uploadResult = $this->processFileUpload($file, $response);
         if ($uploadResult === false) {
            return $this->respond($response);
         }

         $data = [
            'id_usulan' => $id_usulan_kegiatan,
            'nama_dokumen' => $namaDokumen,
            'tipe_dokumen' => $uploadResult['extension'],
            'path_file' => $uploadResult['newName'],
            'file_dokumen' => $file->getName(),
            'user_modified' => $userModified,
         ];

         $model = new Model();
         $submit = $model->submitDokumen($data);

         $response = array_merge($submit, ['errors' => []]);
      } else {
         $response['message'] = 'Tolong periksa kembali inputan anda!';
         $response['errors'] = \Config\Services::validation()->getErrors();
      }
      return $this->respond($response);
   }

   public function deleteUsulanKegiatan(int $id): object
   {
      $model = new Model();
      $data = $model->deleteUsulanKegiatan($id);
      return $this->respond($data);
   }

   public function deleteRAB(int $id): object
   {
      $model = new Model();
      $data = $model->deleteRAB($id);
      return $this->respond($data);
   }

   public function deleteDokumen(int $id): object
   {
      $model = new Model();
      $data = $model->deleteDokumen($id);
      return $this->respond($data);
   }

   public function getDataRAB(int $id_usulan_kegiatan): object
   {
      $model = new Model();
      $data = $model->getDataRAB($id_usulan_kegiatan, $this->request->getGet());
      return $this->respond($data);
   }

   public function getRabActions(): object
   {
      $common = new Common();
      $data = [
         'daftarUnitSatuan' => $common->getDaftarUnitSatuan()
      ];
      return $this->respond(['data' => $data]);
   }

   public function getDetail(int $id_usulan_kegiatan, string $type): object
   {
      $model = new Model();
      $data = $model->getDetail($id_usulan_kegiatan, $type);
      return $this->respond($data);
   }

   public function submitRAB(int $id_usulan_kegiatan): object
   {
      $response = ['status' => false, 'errors' => []];

      $post = (array) $this->request->getJSON();

      $validation = new Validate();
      if ($this->validate($validation->submitRAB())) {
         $model = new Model();
         $submit = $model->submitRAB(array_merge($post, ['id_usulan' => $id_usulan_kegiatan]));

         $response = array_merge($submit, ['errors' => []]);
      } else {
         $response['message'] = 'Tolong periksa kembali inputan anda!';
         $response['errors'] = \Config\Services::validation()->getErrors();
      }
      return $this->respond($response);
   }

   public function submit(): object
   {
      $response = ['status' => false, 'errors' => []];

      $post = (array) $this->request->getJSON();

      $validation = new Validate();
      if ($this->validate($validation->submit(@$post['id']))) {
         $model = new Model();
         $submit = $model->submit($post);

         $response = array_merge($submit, ['errors' => []]);
      } else {
         $response['message'] = 'Tolong periksa kembali inputan anda!';
         $response['errors'] = \Config\Services::validation()->getErrors();
      }
      return $this->respond($response);
   }
}
