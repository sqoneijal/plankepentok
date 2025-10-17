<?php

namespace App\Controllers\UnitKerja;

use App\Controllers\BaseController;
use App\Validation\UnitKerja\Fakultas as Validate;
use App\Models\UnitKerja\Fakultas as Model;

class Fakultas extends BaseController
{

   public function index(): object
   {
      $model = new Model();
      $data = $model->getData($this->request->getGet());
      return $this->respond($data);
   }

   public function handleDelete(int $id): object
   {
      $model = new Model();
      $data = $model->handleDelete($id);
      return $this->respond($data);
   }

   public function handleEditData(int $id): object
   {
      $model = new Model();
      $data = $model->handleEditData($id);
      return $this->respond($data);
   }

   public function handleSubmit(): object
   {
      $response = ['status' => false, 'errors' => []];

      $validation = new Validate();
      if ($this->validate($validation->handleSubmit())) {
         $model = new Model();
         $submit = $model->handleSubmit((array) $this->request->getJSON());

         $response = array_merge($submit, ['errors' => []]);
      } else {
         $response['message'] = 'Tolong periksa kembali inputan anda!';
         $response['errors'] = \Config\Services::validation()->getErrors();
      }
      return $this->respond($response);
   }
}
