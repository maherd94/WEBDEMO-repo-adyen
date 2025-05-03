<?php
require __DIR__ . './../vendor/autoload.php';

$Request_data = file_get_contents('php://input');

// Converts it into a PHP object

$data = json_decode($Request_data,true);

if ($data !== null) {

  $xApiKey = isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '';

    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => 'https://terminal-api-test.adyen.com/sync',
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => '',
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => 'POST',
      CURLOPT_POSTFIELDS =>json_encode($data),
      CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json',
        'X-API-Key: '. $xApiKey
      ),
    ));
    
    $response = curl_exec($curl);
    
    curl_close($curl);
    // echo $response;

echo json_encode($response);
}else {
    // JSON decoding failed
    http_response_code(400); // Bad Request
    echo "Invalid JSON data";
 }
?>