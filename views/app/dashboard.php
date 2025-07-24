<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - OfferTrail</title>
    <link rel="stylesheet" href="public/style.css">
</head>
<body>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h2>Your Applications</h2>

            <!-- Search Form with Status Filter -->
            <form method="get" action="index.php" class="search-form">
                <input type="hidden" name="page" value="dashboard">
                <input type="text" name="search" placeholder="Search company or position..." value="<?= htmlspecialchars($_GET['search'] ?? '') ?>">

                <!-- Status Filter Dropdown -->
                <select name="status">
                    <option value="">ALL</option>
                    <option value="pending" <?= ($_GET['status'] ?? '') === 'pending' ? 'selected' : '' ?>>Pending</option>
                    <option value="accepted" <?= ($_GET['status'] ?? '') === 'accepted' ? 'selected' : '' ?>>Accepted</option>
                    <option value="rejected" <?= ($_GET['status'] ?? '') === 'rejected' ? 'selected' : '' ?>>Rejected</option>
                </select>

                <button type="submit">Search</button>
            </form>

            <!-- Navigation Links -->
            <div class="dashboard-links">
                <a href="index.php?page=applications/add" class="add-link">+ Add New Application</a>
                <a href="index.php?page=calendar" class="calendar-link">📅 Calendar View</a>
                <a href="index.php?page=logout" class="logout-link">Logout</a>
            </div>
        </div>

        <hr>

        <?php if (empty($applications)): ?>
            <p>No applications found.</p>
        <?php else: ?>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Position</th>
                            <th>Link</th>
                            <th>Time Period</th>
                            <th>Date Applied</th>
                            <th>Status</th>
                            <th>Added On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($applications as $app): ?>
                            <tr>
                                <td><?= htmlspecialchars($app['company_name']) ?></td>
                                <td><?= htmlspecialchars($app['position']) ?></td>
                                <td><a href="<?= htmlspecialchars($app['job_link']) ?>" target="_blank">View</a></td>
                                <td><?= htmlspecialchars($app['time_period']) ?></td>
                                <td><?= htmlspecialchars($app['date_applied']) ?></td>
                                <td>
                                    <?php
                                        $status = strtolower($app['status']);
                                        $statusClass = 'status-label ' . $status;
                                    ?>
                                    <span class="<?= $statusClass ?>">
                                        <?= ucfirst($status) ?>
                                    </span>
                                </td>
                                <td><?= htmlspecialchars($app['created_at']) ?></td>
                                <td>
                                    <a href="index.php?page=applications/edit&id=<?= $app['id'] ?>" class="action-link">Edit</a> |
                                    <a href="index.php?page=applications/delete&id=<?= $app['id'] ?>" class="action-link danger" onclick="return confirm('Delete this application?');">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>