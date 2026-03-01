<?php
// CORS — read allowed origins from env variable (comma-separated) or fall back to localhost
$allowed_origins = array_filter(array_map('trim', explode(',',
    getenv('ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://localhost:5174,http://localhost:5175'
)));

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    // Default to first allowed origin for non-CORS requests
    header("Access-Control-Allow-Origin: " . reset($allowed_origins));
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Read credentials from environment variables — fall back to local dev defaults
        $this->host     = getenv('DB_HOST')     ?: '127.0.0.1';
        $this->db_name  = getenv('DB_NAME')     ?: 'ft_welcome';
        $this->username = getenv('DB_USER')     ?: 'root';
        $this->password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '';
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $e) {
            // Log error instead of echoing to avoid breaking JSON
            error_log("Connection Error: " . $e->getMessage());
        }
        return $this->conn;
    }
}

// Instantiate for files that expect direct $conn (login.php, register.php)
$database = new Database();
$conn = $database->getConnection();
?>
