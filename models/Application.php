<?php
class Application
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    // Save a new application (with status)
    public function create($user_id, $company_name, $position, $job_link, $time_period, $date_applied, $status)
    {
        $query = "INSERT INTO applications 
                  (user_id, company_name, position, job_link, time_period, date_applied, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$user_id, $company_name, $position, $job_link, $time_period, $date_applied, $status]);
    }

    // Get all applications for a user, with optional search and status filter
    public function getByUser($user_id, $search = '', $status = '')
    {
        if ($search && $status) {
            $stmt = $this->db->prepare("SELECT * FROM applications 
                WHERE user_id = ? 
                AND status = ? 
                AND (company_name LIKE ? OR position LIKE ?) 
                ORDER BY created_at DESC");
            $searchTerm = '%' . $search . '%';
            $stmt->execute([$user_id, $status, $searchTerm, $searchTerm]);
        } elseif ($search) {
            $stmt = $this->db->prepare("SELECT * FROM applications 
                WHERE user_id = ? 
                AND (company_name LIKE ? OR position LIKE ?) 
                ORDER BY created_at DESC");
            $searchTerm = '%' . $search . '%';
            $stmt->execute([$user_id, $searchTerm, $searchTerm]);
        } elseif ($status) {
            $stmt = $this->db->prepare("SELECT * FROM applications 
                WHERE user_id = ? 
                AND status = ? 
                ORDER BY created_at DESC");
            $stmt->execute([$user_id, $status]);
        } else {
            $stmt = $this->db->prepare("SELECT * FROM applications 
                WHERE user_id = ? 
                ORDER BY created_at DESC");
            $stmt->execute([$user_id]);
        }

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single application (for editing)
    public function getById($id, $user_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM applications WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Update an existing application (including status)
    public function update($id, $user_id, $company, $position, $link, $period, $date, $status)
    {
        $stmt = $this->db->prepare("UPDATE applications 
            SET company_name = ?, position = ?, job_link = ?, time_period = ?, date_applied = ?, status = ?
            WHERE id = ? AND user_id = ?");
        return $stmt->execute([$company, $position, $link, $period, $date, $status, $id, $user_id]);
    }

    // Delete an application
    public function delete($id, $user_id)
    {
        $stmt = $this->db->prepare("DELETE FROM applications WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $user_id]);
    }

    // Get all applications for calendar view (with status included)
    public function getAllForCalendar($user_id)
    {
        $stmt = $this->db->prepare("SELECT company_name, position, date_applied, status
                                    FROM applications 
                                    WHERE user_id = ? AND date_applied IS NOT NULL");
        $stmt->execute([$user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}