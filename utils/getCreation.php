<?php


    // // Access the data and perform operations
    // $items = file_get_contents('./../db/Items.json');
    // $items = json_decode($items,true);
    // if ($items !== null)
    // {

    // echo json_encode($items);
    // }else {
    //     // JSON decoding failed
    //     http_response_code(400); // Bad Request
    //     echo "Invalid JSON data";
    //  }

   
// Database connection parameters
$Request_data = file_get_contents('php://input');

// Converts it into a PHP object

$data = json_decode($Request_data,true);

if ($data !== null) {
    $host = "pw1qc1.stackhero-network.com";
    $port = "5994";
    $database = "WebDemo";
    $user = "admin_integration"; // Replace with your PostgreSQL username
    $password = "admin_integration"; // Replace with your PostgreSQL password

// Establish a connection to the PostgreSQL database
$dsn = "pgsql:host=$host;port=$port;dbname=$database;user=$user;password=$password";
try {
    $pdo = new PDO($dsn);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Query the database
$query = "SELECT * FROM public.\"Creations\" where \"ID\" in (:ID)";

try {
    $stmt = $pdo->prepare($query);
    // Bind the JSON data to the parameter
    $stmt->bindParam(':ID', $data["ID"], PDO::PARAM_STR);
   
    // Execute the query
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Encode the result as JSON
    $jsonResult = json_encode($result[0]);

    // Set the response header to indicate JSON content
    header('Content-Type: application/json');

    // Output the JSON
    echo $jsonResult;
} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
}
}

?>
