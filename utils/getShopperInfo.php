<?php

// // Takes raw data from the request
// $Request_data = file_get_contents('php://input');

// // Converts it into a PHP object

// $data = json_decode($Request_data,true);
// if ($data == null){
//    $countries = file_get_contents('./../db/countries.json');
//    $countries = json_decode($countries,true);
//    echo json_encode($countries);
//    return;
// }
// if ($data !== null) {
//     // Access the data and perform operations
//     $countries = file_get_contents('./../db/countries.json');
//     $countries = json_decode($countries,true);
//     if ($countries !== null)
//     {
//     $countryNumber = $data["order"];
//      $returnedCountryInfo = $countries[$countryNumber];

//     echo json_encode($returnedCountryInfo);
//     }else {
//         // JSON decoding failed
//         http_response_code(400); // Bad Request
//         echo "Invalid JSON data";
//      }
    
//     // Perform further processing or respond to the request
//  } else {
//     // JSON decoding failed
//     http_response_code(400); // Bad Request
//     echo "Invalid JSON data";
//  }
$host = "pw1qc1.stackhero-network.com";
$port = "5994";
$database = "WebDemo";
$user = "admin_integration"; // Replace with your PostgreSQL username
$password = "admin_integration"; // Replace with your PostgreSQL password
$shopperEmail = '';
// Takes raw data from the request
$Request_data = file_get_contents('php://input');

// Converts it into a PHP object

$data = json_decode($Request_data,true);
if ($data !== null){
$shopperEmail = $data["shopperEmail"];

}else{
      //JSON decoding failed
    http_response_code(400); // Bad Request
    echo "Invalid JSON data";
    return;
}
// Establish a connection to the PostgreSQL database
$dsn = "pgsql:host=$host;port=$port;dbname=$database;user=$user;password=$password";
try {
    $pdo = new PDO($dsn);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Query the database
// Query the database with a filter on shopperEmail
$query = "SELECT * FROM public.\"Shoppers\" WHERE \"shopperEmail\" = :shopperEmail";

try {
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':shopperEmail', $shopperEmail, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Encode the result as JSON
    $jsonResult = json_encode($result);

    // Set the response header to indicate JSON content
    header('Content-Type: application/json');

    // Output the JSON
    echo $jsonResult;
} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
}

?>