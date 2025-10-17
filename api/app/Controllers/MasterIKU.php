<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\MasterIKU as Model;
use App\Validation\MasterIKU as Validate;

class MasterIKU extends BaseController
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

   public function getDetailEdit(int $id): object
   {
      $model = new Model();
      $data = $model->getDetailEdit($id);
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
         $response['msg_response'] = 'Tolong periksa kembali inputan anda!';
         $response['errors'] = \Config\Services::validation()->getErrors();
      }
      return $this->respond($response);
   }
}
