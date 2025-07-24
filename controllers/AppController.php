<?php
require_once 'models/Application.php';

class AppController
{
    private $appModel;

    public function __construct($db)
    {
        $this->appModel = new Application($db);
    }

    public function showAddForm()
    {
        require 'views/app/add_application.php';
    }

    public function add()
    {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?page=login");
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user_id = $_SESSION['user_id'];
            $company = $_POST['company'];
            $position = $_POST['position'];
            $link = $_POST['link'];
            $period = $_POST['period'];
            $date = $_POST['date_applied'];
            $status = $_POST['status'] ?? 'pending';

            $this->appModel->create($user_id, $company, $position, $link, $period, $date, $status);
            header("Location: index.php?page=dashboard");
            exit;
        }

        require 'views/app/add_application.php';
    }

    public function showDashboard()
    {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?page=login");
            exit;
        }

        $user_id = $_SESSION['user_id'];
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $applications = $this->appModel->getByUser($user_id, $search, $status);

        require 'views/app/dashboard.php';
    }

    public function showCalendar()
    {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?page=login");
            exit;
        }

        $user_id = $_SESSION['user_id'];
        $rawApplications = $this->appModel->getAllForCalendar($user_id);

        $applicationDates = array_map(function ($app) {
            return [
                'company_name' => $app['company_name'],
                'position' => $app['position'],
                'date_applied' => $app['date_applied'],
                'status' => $app['status']
            ];
        }, $rawApplications);

        require 'views/app/calendar.php';
    }

    public function edit()
    {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?page=login");
            exit;
        }

        $user_id = $_SESSION['user_id'];
        $id = $_GET['id'] ?? null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $company = $_POST['company'];
            $position = $_POST['position'];
            $link = $_POST['link'];
            $period = $_POST['period'];
            $date = $_POST['date_applied'];
            $status = $_POST['status'] ?? 'pending';

            $this->appModel->update($id, $user_id, $company, $position, $link, $period, $date, $status);
            header("Location: index.php?page=dashboard");
            exit;
        } else {
            $application = $this->appModel->getById($id, $user_id);
            require 'views/app/edit_application.php';
        }
    }

    public function delete()
    {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            header("Location: index.php?page=login");
            exit;
        }

        $user_id = $_SESSION['user_id'];
        $id = $_GET['id'] ?? null;

        $this->appModel->delete($id, $user_id);
        header("Location: index.php?page=dashboard");
        exit;
    }
}