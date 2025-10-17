<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Validation\Pengaturan as Validate;
use App\Models\Pengaturan as Model;

class Pengaturan extends BaseController
{

   public function index()
   {
      $model = new Model();
      $data = $model->getData($this->request->getGet());
      return $this->respond($data);
   }

   public function handleDelete(int $id_pengaturan)
   {
      $model = new Model();
      $data = $model->handleDelete($id_pengaturan);
      return $this->respond($data);
   }

   public function getDataEdit(int $id_pengaturan)
   {
      $model = new Model();
      $data = $model->getDataEdit($id_pengaturan);
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
