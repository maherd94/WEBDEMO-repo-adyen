<?php
require __DIR__ . './../vendor/autoload.php';

$Request_data = file_get_contents('php://input');

// Converts it into a PHP object

$data = json_decode($Request_data,true);

if ($data !== null) {
    $xApiKey = isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '';

$client = new \Adyen\Client();
$client->setApplicationName('Test Application');
$client->setEnvironment(\Adyen\Environment::TEST);
$client->setXApiKey($xApiKey);
$service = new \Adyen\Service\Checkout\ModificationsApi($client);
$params = $data["request"];
$PaymentRefundRequest = new \Adyen\Model\Checkout\PaymentRefundRequest($params);

$result = $service->refundCapturedPayment($data["pspReference"],$PaymentRefundRequest);

echo json_encode($result);
}else {
    // JSON decoding failed
    http_response_code(400); // Bad Request
    echo "Invalid JSON data";
 }
?>