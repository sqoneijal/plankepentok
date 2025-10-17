<?php

namespace App\Controllers\Referensi;

use App\Controllers\BaseController;
use App\Models\Referensi\StandarBiaya as Model;
use App\Validation\Referensi\StandarBiaya as Validate;

class StandarBiaya extends BaseController
{
   public function index(): object
   {
      $model = new Model();
      $data = $model->getData($this->request->getGet());
      return $this->respond($data);
   }

   public function getDetailEdit(int $id_standar_biaya): object
   {
      $model = new Model();
      $data = $model->getDetailEdit($id_standar_biaya);
      return $this->respond($data);
   }

   public function handleDelete(int $id_standar_biaya): object
   {
      $model = new Model();
      $data = $model->handleDelete($id_standar_biaya);
      return $this->respond($data);
   }

   public function cariKategoriSBM(): object
   {
      $model = new Model();
      $data = $model->cariKategoriSBM(trim(strtolower($this->request->getGet('search'))));
      return $this->respond($data);
   }

   public function cariUnitSatuan(): object
   {
      $model = new Model();
      $data = $model->cariUnitSatuan(trim(strtolower($this->request->getGet('search'))));
      return $this->respond($data);
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
