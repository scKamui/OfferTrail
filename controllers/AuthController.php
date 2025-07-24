<?php
require_once __DIR__ . '/../models/User.php';


class AuthController {
    private $userModel;

    // Accept the database connection on construction
    public function __construct($db) {
        $this->userModel = new User($db);
    }

    public function login() {
        $error = null; // Define the error variable

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = trim($_POST['username']);
            $password = $_POST['password'];

            $userId = $this->userModel->login($username, $password);

            if ($userId) {
                $_SESSION['user_id'] = $userId;
                $_SESSION['username'] = $username;
                header('Location: index.php?page=dashboard');
                exit;
            } else {
                $error = "Invalid username or password.";
            }
        }

        include __DIR__ . '/../views/auth/login.php';
    }

    public function register() {
        $error = null; // Define the error variable

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = trim($_POST['username']);
            $password = $_POST['password'];

            $success = $this->userModel->register($username, $password);

            if ($success) {
                header('Location: index.php?page=login');
                exit;
            } else {
                $error = "Username already taken.";
            }
        }

        include __DIR__ . '/../views/auth/register.php';
    }

    public function logout() {
        session_destroy();
        header('Location: index.php?page=login');
        exit;
    }
}