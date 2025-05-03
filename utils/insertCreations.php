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
        $data = json_decode($jsonData,true);
        $data_ID = $data["ID"];
        $data_connectionSettings = $data["connectionSettings"];
        $data_features = $data["features"];
        // Create a PDO database connection
    
        $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$database;user=$user;password=$password");

        // Prepare the SQL statement for insertion
        $sql = "INSERT INTO public.\"Creations\" (\"ID\",\"ConnectionSettings\",\"Features\") VALUES (:ID,:cnxSettings,:feats)";
        $stmt = $pdo->prepare($sql);

        // Bind the JSON data to the parameter
        $stmt->bindParam(':ID', $data_ID, PDO::PARAM_STR);
        $stmt->bindParam(':cnxSettings', $data_connectionSettings, PDO::PARAM_STR);
        $stmt->bindParam(':feats', $data_features, PDO::PARAM_STR);

        // Execute the statement
        $stmt->execute();

        // Close the database connection
        $pdo = null;

        echo "[Inserted]";
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
} else {
    echo "No JSON data received.";
}
?>
