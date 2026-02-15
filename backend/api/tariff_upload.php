<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        if ($fileExtension === 'csv') {
            $handle = fopen($fileTmpPath, "r");
            if ($handle !== FALSE) {
                // Skip header if needed? Legacy doesn't seem to skip.
                // fgetcsv($handle); 
                
                $successCount = 0;
                $failCount = 0;
                
                $query = "INSERT INTO f_out_tariff (v_type, t_type, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26, a27, a28, a29, a30, a31, a32, a33, a34, a35, a36, a37, a38, a39, a40, a41, a42, a43, a44, a45, a46, a47, a48, a49, a50, a51, a52, a53, a54, a55, a56, a57, a58, a59, a60, a61, a62, a63, a64, a65, a66, a67, a68, a69, a70, a71, a72, a73, a74, a75, a76, a77, a78, a79, a80, a81, a82, a83, a84, a85, a86, a87, a88, a89, a90, a91, a92, a93, a94, a95, a96, a97, a98, a99, a100, a101, a102, a103) 
                          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                          // Note: I need to generate 105 placeholders.
                          
                // Using PHP to generate placeholders to avoid counting errors
                $placeholders = implode(',', array_fill(0, 105, '?'));
                $query = "INSERT INTO f_out_tariff VALUES (NULL, " . $placeholders . ")"; 
                // Wait, legacy query explicitly lists columns but table might have ID.
                // Legacy: INSERT INTO f_out_tariff(v_type, ...) VALUES (...)
                // I will use specific columns to be safe.
                
                $cols = ['v_type', 't_type'];
                for ($i=1; $i<=103; $i++) { $cols[] = "a$i"; }
                
                $colString = implode(', ', $cols);
                $phString = implode(', ', array_fill(0, count($cols), '?'));
                
                $stmt = $db->prepare("INSERT INTO f_out_tariff ($colString) VALUES ($phString)");

                while (($data = fgetcsv($handle, 10000, ",")) !== FALSE) {
                    try {
                        // Ensure data has enough columns, pad with null/empty if needed
                         $dataToInsert = array_slice($data, 0, 105); // max 105 cols
                         // Pad if short using array_pad?
                         // Legacy uses raw indices.
                         
                         if($stmt->execute($dataToInsert)) {
                             $successCount++;
                         } else {
                             $failCount++;
                         }
                    } catch (Exception $e) {
                        $failCount++;
                    }
                }
                fclose($handle);
                echo json_encode(["message" => "Upload complete.", "success" => $successCount, "failed" => $failCount]);
            } else {
                 http_response_code(500);
                 echo json_encode(["message" => "Could not open file."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid file extension. Only CSV allowed."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "No file uploaded or upload error."]);
    }
}
?>
