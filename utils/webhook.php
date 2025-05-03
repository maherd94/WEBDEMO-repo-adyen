<?php
$host = "pw1qc1.stackhero-network.com";
$port = "5994";
$database = "WebDemo";
$user = "admin_integration"; // Replace with your PostgreSQL username
$password = "admin_integration"; // Replace with your PostgreSQL password

// Get the JSON data from the POST request
$jsonData = file_get_contents("php://input");

// Check if data was received
if (!empty($jsonData)) {
    try {
        $data = json_decode($jsonData);
        $merchantAccountCode = preg_match('/"merchantAccountCode":"([^"]+)"/', json_encode(json_decode($jsonData, true)), $matches) ? $matches[1] : null;

        // Create a PDO database connection
        $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$database;user=$user;password=$password");

        // Prepare the SQL statement for insertion
        $sql = "INSERT INTO public.\"Webhooks\" (\"content\",\"merchantAccount\") VALUES (:jsonData,:merchantAccount)";
        $stmt = $pdo->prepare($sql);
//test
        // Bind the JSON data to the parameter
        $stmt->bindParam(':jsonData', $jsonData, PDO::PARAM_STR);
        $stmt->bindParam(':merchantAccount', $merchantAccountCode, PDO::PARAM_STR);


        // Execute the statement
        $stmt->execute();

        // Close the database connection
        $pdo = null;

        echo "[accepted]";
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
} else {
    echo "No JSON data received.";
}
?>
