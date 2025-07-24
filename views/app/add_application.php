<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Add Application - OfferTrail</title>
    <link rel="stylesheet" href="public/style.css">
</head>
<body>
    <div class="form-card">
        <h2>Add New Application</h2>
        <form method="post" action="index.php?page=applications/add">
            <label for="company">Company Name:</label>
            <input type="text" id="company" name="company" required>

            <label for="position">Position:</label>
            <input type="text" id="position" name="position" required>

            <label for="link">Job Link:</label>
            <input type="url" id="link" name="link">

            <label for="period">Time Period:</label>
            <input type="text" id="period" name="period">

            <label for="date_applied">Date Applied:</label>
            <input type="date" id="date_applied" name="date_applied">

            <button type="submit">Submit</button>
        </form>
        <p style="margin-top: 1rem;">
            <a href="index.php?page=dashboard">← Back to Dashboard</a>
        </p>
    </div>
</body>
</html>