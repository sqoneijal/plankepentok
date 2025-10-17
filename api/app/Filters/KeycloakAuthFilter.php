<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class KeycloakAuthFilter implements FilterInterface
{
   public function before(RequestInterface $request, $arguments = null)
   {
      $authHeader = $request->getHeaderLine('Authorization');

      if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
         return service('response')->setJSON([
            'message' => 'Unauthorized: Token not provided.',
         ])->setStatusCode(401);
      }

      $token = substr($authHeader, 7);

      try {
         // Ambil JWKS dari Keycloak
         $client = service('curlrequest');

         $response = $client->request('GET', 'https://iam.ar-raniry.ac.id/realms/uinar/protocol/openid-connect/certs');

         $body = $response->getBody();
         $jwks = json_decode($body, true);

         $decodedHeader = JWT::jsonDecode(JWT::urlsafeB64Decode(explode('.', $token)[0]));
         $kid = $decodedHeader->kid;

         // Temukan key yang cocok
         $key = null;
         foreach ($jwks['keys'] as $jwk) {
            if ($jwk['kid'] === $kid) {
               $key = $jwk;
               break;
            }
         }

         if (!$key) {
            throw new \Exception("Public key not found for kid $kid");
         }

         // Ubah JWK ke format PEM (RSA public key)
         $publicKeyPem = $this->convertJwkToPem($key);

         $decoded = JWT::decode($token, new Key($publicKeyPem, 'RS256'));
         $request->user = $decoded;
      } catch (\Throwable $e) {
         return service('response')->setJSON([
            'message' => 'Unauthorized: Invalid token',
            'error' => $e->getMessage(),
         ])->setStatusCode(401);
      }
   }

   private function convertJwkToPem(array $jwk): string
   {
      $components = [
         'kty' => $jwk['kty'],
         'n'   => $jwk['n'],
         'e'   => $jwk['e'],
      ];

      $rsa = \phpseclib3\Crypt\RSA::loadPublicKey([
         'n' => new \phpseclib3\Math\BigInteger(JWT::urlsafeB64Decode($components['n']), 256),
         'e' => new \phpseclib3\Math\BigInteger(JWT::urlsafeB64Decode($components['e']), 256)
      ]);

      return $rsa->withPadding(\phpseclib3\Crypt\RSA::SIGNATURE_PKCS1)->toString('PKCS8');
   }

   public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
   {
      // do nothing
   }
}
