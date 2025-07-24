<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Application - OfferTrail</title>
    <link rel="stylesheet" href="public/style.css">
</head>
<body>
    <div class="form-card">
        <h2>Edit Application</h2>
        <form method="post">
            <input type="text" name="company" placeholder="Company Name" value="<?= htmlspecialchars($application['company_name']) ?>" required>

            <input type="text" name="position" placeholder="Position" value="<?= htmlspecialchars($application['position']) ?>" required>

            <input type="url" name="link" placeholder="Job Link" value="<?= htmlspecialchars($application['job_link']) ?>">

            <input type="text" name="period" placeholder="Time Period" value="<?= htmlspecialchars($application['time_period']) ?>">

            <input type="date" name="date_applied" value="<?= htmlspecialchars($application['date_applied']) ?>">

            <select name="status" required>
                <option value="pending" <?= $application['status'] === 'pending' ? 'selected' : '' ?>>Pending</option>
                <option value="accepted" <?= $application['status'] === 'accepted' ? 'selected' : '' ?>>Accepted</option>
                <option value="rejected" <?= $application['status'] === 'rejected' ? 'selected' : '' ?>>Rejected</option>
            </select>

            <button type="submit">Update</button>
        </form>
        <p><a href="index.php?page=dashboard">← Back to Dashboard</a></p>
    </div>
</body>
</html>