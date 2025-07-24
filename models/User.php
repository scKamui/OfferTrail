<?php
class User {
    private $conn;
    private $table_name = "users";

    // Accept the db connection from outside
    public function __construct($db) {
        $this->conn = $db;
    }

    public function register($username, $password) {
        $query = "INSERT INTO " . $this->table_name . " (username, password_hash) VALUES (:username, :password)";
        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":password", $hashedPassword);

        return $stmt->execute();
    }

    public function login($username, $password) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE username = :username LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($password, $row['password_hash'])) {
                return $row['id'];
            }
        }

        return false;
    }
}
?>