<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\API\ResponseTrait;
use Config\Cors;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 */
abstract class BaseController extends Controller
{

   use ResponseTrait;


   /**
    * Instance of the main Request object.
    *
    * @var CLIRequest|IncomingRequest
    */
   protected $request;

   /**
    * An array of helpers to be loaded automatically upon
    * class instantiation. These helpers will be available
    * to all other controllers that extend BaseController.
    *
    * @var list<string>
    */
   protected $helpers = ['init'];

   /**
    * Be sure to declare properties for any property fetch you initialized.
    * The creation of dynamic property is deprecated in PHP 8.2.
    */
   // protected $session;

   public function options()
   {
      return $this->respondCors($this->response)->setStatusCode(200);
   }

   private function respondCors(ResponseInterface $response): ResponseInterface
   {
      $config = new Cors();
      $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

      if (in_array($origin, $config->allowedOrigins)) {
         $response->setHeader('Access-Control-Allow-Origin', $origin);
      }

      $response->setHeader('Access-Control-Allow-Credentials', 'true');
      $response->setHeader('Access-Control-Allow-Methods', implode(', ', $config->allowedMethods));
      $response->setHeader('Access-Control-Allow-Headers', implode(', ', $config->allowedHeaders));
      $response->setHeader('Access-Control-Max-Age', '3600');

      return $response;
   }
}
