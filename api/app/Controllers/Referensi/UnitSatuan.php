<?php

namespace App\Controllers\Referensi;

use App\Controllers\BaseController;
use App\Models\Referensi\UnitSatuan as Model;
use App\Validation\Referensi\UnitSatuan as Validate;

class UnitSatuan extends BaseController
{

   public function index()
   {
      $model = new Model();
      $data = $model->getData($this->request->getGet());
      return $this->respond($data);
   }

   public function handleDelete(int $id_unit_satuan): object
   {
      $model = new Model();
      $data = $model->handleDelete($id_unit_satuan);
      return $this->respond($data);
   }

   public function getDetailEdit(int $id_unit_satuan): object
   {
      $model = new Model();
      $data = $model->getDetailEdit($id_unit_satuan);
      return $this->respond($data);
   }

   public function submit(): object
   {
      $response = ['status' => false, 'errors' => []];

      $validation = new Validate();
      if ($this->validate($validation->submit())) {
         $model = new Model();
         $submit = $model->submit((array) $this->request->getJSON());

         $response = array_merge($submit, ['errors' => []]);
      } else {
         $response['message'] = 'Tolong periksa kembali inputan anda!';
         $response['errors'] = \Config\Services::validation()->getErrors();
      }
      return $this->respond($response);
   }
}
