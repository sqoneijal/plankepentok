<?php

use CodeIgniter\Router\RouteCollection;

function defineOptionsRoutes(RouteCollection $routes)
{
   $routes->group('options', function (RouteCollection $routes) {
      $routes->get('fakultas', 'Options::getDaftarFakultas');
      $routes->get('program-studi', 'Options::getDaftarProgramStudi');
      $routes->get('biro', 'Options::getDaftarBiro');
   });
}

function defineUnitKerjaRoutes(RouteCollection $routes)
{
   $routes->group('unit-kerja', ['namespace' => 'App\Controllers\UnitKerja'], function (RouteCollection $routes) {
      $routes->group('biro', function (RouteCollection $routes) {
         $routes->get('/', 'Biro::index');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'Biro::handleEditData/$1');
            $routes->delete('(:num)', 'Biro::handleDelete/$1');
            $routes->post('/', 'Biro::handleSubmit');
         });
      });

      $routes->group('lembaga', function (RouteCollection $routes) {
         $routes->get('/', 'Lembaga::index');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'Lembaga::handleEditData/$1');
            $routes->delete('(:num)', 'Lembaga::handleDelete/$1');
            $routes->post('/', 'Lembaga::handleSubmit');
         });
      });

      $routes->group('upt', function (RouteCollection $routes) {
         $routes->get('/', 'Upt::index');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'Upt::handleEditData/$1');
            $routes->delete('(:num)', 'Upt::handleDelete/$1');
            $routes->post('/', 'Upt::handleSubmit');
         });
      });

      $routes->group('fakultas', function (RouteCollection $routes) {
         $routes->get('/', 'Fakultas::index');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'Fakultas::handleEditData/$1');
            $routes->delete('(:num)', 'Fakultas::handleDelete/$1');
            $routes->post('/', 'Fakultas::handleSubmit');
         });
      });

      $routes->group('program-studi', function (RouteCollection $routes) {
         $routes->get('/', 'ProgramStudi::index');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'ProgramStudi::handleEditData/$1');
            $routes->delete('(:num)', 'ProgramStudi::handleDelete/$1');
            $routes->post('/', 'ProgramStudi::handleSubmit');
         });
      });
   });
}

function defineReferensiRoutes(RouteCollection $routes)
{
   $routes->group('referensi', ['namespace' => "App\Controllers\Referensi"], function (RouteCollection $routes) {
      $routes->group('unit-satuan', function (RouteCollection $routes) {
         $routes->get('/', 'UnitSatuan::index');

         $routes->delete('(:num)', 'UnitSatuan::handleDelete/$1');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'UnitSatuan::getDetailEdit/$1');

            $routes->post('/', 'UnitSatuan::submit');
         });
      });

      $routes->group('kategori-sbm', function (RouteCollection $routes) {
         $routes->get('/', 'KategoriSBM::index');

         $routes->delete('(:num)', 'KategoriSBM::handleDelete/$1');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'KategoriSBM::getDetailEdit/$1');

            $routes->post('/', 'KategoriSBM::submit');
         });
      });

      $routes->group('standar-biaya', function (RouteCollection $routes) {
         $routes->get('/', 'StandarBiaya::index');

         $routes->delete('(:num)', 'StandarBiaya::handleDelete/$1');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'StandarBiaya::getDetailEdit/$1');
            $routes->get('cari-kategori-sbm', 'StandarBiaya::cariKategoriSBM');
            $routes->get('cari-unit-satuan', 'StandarBiaya::cariUnitSatuan');

            $routes->post('/', 'StandarBiaya::submit');
         });
      });

      $routes->group('detail-harga-sbm', function (RouteCollection $routes) {
         $routes->get('/', 'DetailHargaSBM::index');

         $routes->delete('(:num)', 'DetailHargaSBM::handleDelete/$1');

         $routes->group('actions', function (RouteCollection $routes) {
            $routes->get('(:num)', 'DetailHargaSBM::getDetailEdit/$1');
            $routes->get('cari-standar-biaya', 'DetailHargaSBM::cariStandarBiaya');

            $routes->post('/', 'DetailHargaSBM::submit');
         });
      });
   });
}

function defineUsulanKegiatanRoutes(RouteCollection $routes)
{
   $routes->group('usulan-kegiatan', function (RouteCollection $routes) {
      $routes->get('/', 'UsulanKegiatan::index');

      $routes->delete('(:num)', 'UsulanKegiatan::deleteUsulanKegiatan/$1');

      $routes->group('(:num)', function (RouteCollection $routes) {
         $routes->group('rab', function (RouteCollection $routes) {
            $routes->get('/', 'UsulanKegiatan::getDataRAB/$1');
            $routes->get('actions', 'UsulanKegiatan::getRabActions');

            $routes->post('actions', 'UsulanKegiatan::submitRAB/$1');
         });

         $routes->group('dokumen', function (RouteCollection $routes) {
            $routes->post('actions', 'UsulanKegiatan::submitDokumen/$1');
         });

         $routes->group('iku', function (RouteCollection $routes) {
            $routes->post('actions', 'UsulanKegiatan::submitIKU/$1');
            $routes->delete('(:num)', 'UsulanKegiatan::deleteIKU/$1/$2');
         });

         $routes->get('status-usulan', 'UsulanKegiatan::getStatusUsulan/$1');
         $routes->get('(:any)', 'UsulanKegiatan::getDetail/$1/$2');
      });

      $routes->group('actions', function (RouteCollection $routes) {
         $routes->get('(:num)', 'UsulanKegiatan::getDataEdit/$1');
         $routes->post('/', 'UsulanKegiatan::submit');
         $routes->post('submit-pengajuan', 'UsulanKegiatan::submitPengajuan');
         $routes->delete('rab/(:num)', 'UsulanKegiatan::deleteRAB/$1');
         $routes->delete('dokumen/(:num)', 'UsulanKegiatan::deleteDokumen/$1');
      });
   });
}

function defineMasterIKURoutes(RouteCollection $routes)
{
   $routes->group('master-iku', function (RouteCollection $routes) {
      $routes->get('/', 'MasterIKU::index');
      $routes->delete('(:num)', 'MasterIKU::handleDelete/$1');

      $routes->group('actions', function (RouteCollection $routes) {
         $routes->get('(:num)', 'MasterIKU::getDetailEdit/$1');
         $routes->post('/', 'MasterIKU::submit');
      });
   });
}

function defineVerifikasiUsulanRoutes(RouteCollection $routes)
{
   $routes->group('verifikasi-usulan', ['namespace' => 'App\Controllers\VerifikasiUsulan'], function (RouteCollection $routes) {
      $routes->group('pengajuan', function (RouteCollection $routes) {
         $routes->get('/', 'Pengajuan::index');
         $routes->put('rab', 'Pengajuan::updateRABStatus');
         $routes->put('iku', 'Pengajuan::updateIKUStatus');
         $routes->put('dokumen', 'Pengajuan::updateDokumenStatus');

         $routes->group('(:num)', function (RouteCollection $routes) { // (:num) id_pengajuan
            $routes->get('informasi-dasar', 'Pengajuan::getInformasiDasar/$1');
            $routes->get('anggaran', 'Pengajuan::getAnggaran/$1');
            $routes->get('latar-belakang', 'Pengajuan::getLatarBelakang/$1');
            $routes->get('tujuan', 'Pengajuan::getTujuan/$1');
            $routes->get('sasaran', 'Pengajuan::getSasaran/$1');
            $routes->get('rab', 'Pengajuan::getRAB/$1');
            $routes->get('iku', 'Pengajuan::getIKU/$1');
            $routes->get('dokumen', 'Pengajuan::getDokumen/$1');
            $routes->post('perbaiki', 'Pengajuan::submitPerbaiki/$1');
            $routes->put('terima', 'Pengajuan::handleTerima/$1');
         });
      });

      $routes->group('perbaikan', function (RouteCollection $routes) {
         $routes->get('/', 'Perbaikan::index');

         $routes->group('(:num)', function (RouteCollection $routes) {
            $routes->get('informasi-dasar', 'Perbaikan::getInformasiDasar/$1');
            $routes->get('anggaran', 'Perbaikan::getAnggaran/$1');
            $routes->get('latar-belakang', 'Perbaikan::getLatarBelakang/$1');
            $routes->get('tujuan', 'Perbaikan::getTujuan/$1');
            $routes->get('sasaran', 'Perbaikan::getSasaran/$1');
            $routes->get('rab', 'Perbaikan::getRAB/$1');
            $routes->get('iku', 'Perbaikan::getIKU/$1');
            $routes->get('dokumen', 'Perbaikan::getDokumen/$1');
            $routes->get('catatan-perbaikan', 'Perbaikan::getCatatanPerbaikan/$1');
         });
      });
   });
}

function definePaguAnggaranRoutes(RouteCollection $routes)
{
   $routes->group('pagu-anggaran', function (RouteCollection $routes) {
      $routes->get('tahun-anggaran', 'PaguAnggaran::getTahunAnggaran');
      $routes->put('(:num)', 'PaguAnggaran::handleUpdate/$1'); // (:num) tahun_anggaran

      $routes->group('(:num)', function (RouteCollection $routes) { // (:num) tahun_anggaran
         $routes->get('universitas', 'PaguAnggaran::getPaguUniversitas/$1');
         $routes->get('biro', 'PaguAnggaran::getPaguBiro/$1');
         $routes->get('fakultas', 'PaguAnggaran::getPaguFakultas/$1');
         $routes->get('program-studi', 'PaguAnggaran::getPaguProgramStudi/$1');
         $routes->get('lembaga', 'PaguAnggaran::getPaguLembaga/$1');
         $routes->get('upt', 'PaguAnggaran::getPaguUPT/$1');
      });
   });
}

function defineRealisasiRoutes(RouteCollection $routes)
{
   $routes->group('realisasi', function (RouteCollection $routes) {
      $routes->get('/', 'Realisasi::index');
   });
}

function definePengaturanRoutes(RouteCollection $routes)
{
   $routes->group('pengaturan', function (RouteCollection $routes) {
      $routes->get('/', 'Pengaturan::index');

      $routes->group('actions', function (RouteCollection $routes) {
         $routes->get('(:num)', 'Pengaturan::getDataEdit/$1');
         $routes->delete('(:num)', 'Pengaturan::handleDelete/$1');
         $routes->post('/', 'Pengaturan::handleSubmit');
      });
   });
}

$routes->options('api/(:any)', 'BaseController::options');

$routes->group('api', ['filter' => ['cors', 'keycloak-auth']], function (RouteCollection $routes) {
   defineOptionsRoutes($routes);
   defineUnitKerjaRoutes($routes);
   defineReferensiRoutes($routes);
   defineUsulanKegiatanRoutes($routes);
   defineMasterIKURoutes($routes);
   defineVerifikasiUsulanRoutes($routes);
   definePaguAnggaranRoutes($routes);
   defineRealisasiRoutes($routes);
   definePengaturanRoutes($routes);
});
