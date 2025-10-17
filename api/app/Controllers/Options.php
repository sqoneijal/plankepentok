<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\Common as Model;

class Options extends BaseController
{

   public function getDaftarFakultas()
   {
      $model = new Model();
      $data = $model->getDaftarFakultas();
      return $this->respond($data);
   }

   public function getDaftarProgramStudi()
   {
      $model = new Model();
      $data = $model->getDaftarProgramStudi();
      return $this->respond($data);
   }

   public function getDaftarBiro()
   {
      $model = new Model();
      $data = $model->getDaftarBiro();
      return $this->respond($data);
   }
}
