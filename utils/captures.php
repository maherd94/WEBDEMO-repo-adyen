<?php
require __DIR__ . './../vendor/autoload.php';

$Request_data = file_get_contents('php://input');

// Converts it into a PHP object

$data = json_decode($Request_data,true);

if ($data !== null) {
$client = new \Adyen\Client();
$client->setApplicationName('Test Application');
$client->setEnvironment(\Adyen\Environment::TEST);
$client->setXApiKey('AQEuhmfxK47HbBxEw0m/n3Q5qf3VZYpFCIFrW2ZZ03a/qqNxYzLIkV4T4RpD+QLLkBDBXVsNvuR83LVYjEgiTGAH-SA1rN63uaZO505w752voi4T0qnhRYn/bJo9Rezz1Tt0=-i1i;(XaqSPL5WqCq+Xt');
$service = new \Adyen\Service\Checkout\ModificationsApi($client);
$params = $data["request"];
$PaymentCaptureRequest = new \Adyen\Model\Checkout\PaymentCaptureRequest($params);

$result = $service->captureAuthorisedPayment($data["pspReference"],$PaymentCaptureRequest);


echo json_encode($result);
}else {
    // JSON decoding failed
    http_response_code(400); // Bad Request
    echo "Invalid JSON data";
 }
?>