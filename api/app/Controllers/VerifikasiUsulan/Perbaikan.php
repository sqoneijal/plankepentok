<?php

namespace App\Controllers\VerifikasiUsulan;

use App\Controllers\BaseController;
use App\Models\VerifikasiUsulan\Perbaikan as Model;

class Perbaikan extends BaseController
{

   public function index()
   {
      $model = new Model();
      $data = $model->getData($this->request->getGet());
      return $this->respond($data);
   }

   public function getDokumen(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getDokumen($id_usulan, $this->request->getGet());
      return $this->respond($data);
   }

   public function getIKU(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getIKU($id_usulan, $this->request->getGet());
      return $this->respond($data);
   }

   public function getRAB(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getRAB($id_usulan, $this->request->getGet());
      return $this->respond($data);
   }

   public function getSasaran(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getSasaran($id_usulan);
      return $this->respond($data);
   }

   public function getCatatanPerbaikan(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getCatatanPerbaikan($id_usulan);
      return $this->respond($data);
   }

   public function getTujuan(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getTujuan($id_usulan);
      return $this->respond($data);
   }

   public function getLatarBelakang(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getLatarBelakang($id_usulan);
      return $this->respond($data);
   }

   public function getAnggaran(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getAnggaran($id_usulan);
      return $this->respond($data);
   }

   public function getInformasiDasar(int $id_usulan): object
   {
      $model = new Model();
      $data = $model->getInformasiDasar($id_usulan);
      return $this->respond($data);
   }
}
