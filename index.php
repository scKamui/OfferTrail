<?php

session_start(); // Start session for auth tracking

$page = $_GET['page'] ?? 'login';

require_once __DIR__ . '/config/database.php'; // Load DB class
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/AppController.php';

// Initialize DB connection
$database = new Database();
$db = $database->getConnection();

// Pass DB to controllers
$auth = new AuthController($db);
$app = new AppController($db);

switch ($page) {
    case 'login':
        $auth->login();
        break;

    case 'register':
        $auth->register();
        break;

    case 'logout':
        $auth->logout();
        break;

    case 'dashboard':
        // ✅ Pass optional search and status filter to dashboard controller
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $app->showDashboard($search, $status);
        break;

    case 'calendar':
        // ✅ NEW: show calendar page
        $app->showCalendar();
        break;

    case 'applications/add':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $app->add();
        } else {
            $app->showAddForm();
        }
        break;

    case 'applications/edit':
        $app->edit();
        break;

    case 'applications/delete':
        $app->delete();
        break;

    default:
        $auth->login();
}