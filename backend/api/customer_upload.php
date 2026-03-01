<?php
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
        $fileSize = $_FILES['file']['size'];
        $fileType = $_FILES['file']['type'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        $allowedfileExtensions = array('csv');
        if (in_array($fileExtension, $allowedfileExtensions)) {
            $handle = fopen($fileTmpPath, "r");
            if ($handle !== FALSE) {
                $count = 0;
                $success = 0;
                $failed = 0;
                
                // Read the file line by line
                while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                    $b_name = isset($data[0]) ? $data[0] : '';
                    $m_no = isset($data[1]) ? $data[1] : '';
                    
                    if ($b_name && $m_no) {
                        try {
                            $query = "INSERT INTO ft_cus_master (b_name, m_no) VALUES (:b_name, :m_no)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":b_name", $b_name);
                            $stmt->bindParam(":m_no", $m_no);
                            
                            if ($stmt->execute()) {
                                $success++;
                            } else {
                                $failed++;
                            }
                        } catch (Exception $e) {
                            $failed++;
                        }
                    } else {
                        $failed++;
                    }
                    $count++;
                }
                fclose($handle);
                echo json_encode(array("message" => "Upload complete.", "processed" => $count, "success" => $success, "failed" => $failed));
            } else {
                 http_response_code(500);
                 echo json_encode(array("message" => "Could not open file."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Only .csv files are allowed."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "No file uploaded or upload error."));
    }
}
?>

