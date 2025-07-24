<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Register - OfferTrail</title>
    <link rel="stylesheet" href="public/style.css">
</head>
<body>
    <div class="form-card">
        <h2>Create an account</h2>
        <p>Join <strong>OfferTrail</strong> to track your job applications</p>

        <?php if (isset($error) && $error): ?>
            <p style="color:red;"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>

        <form method="post" action="">
            <input type="text" name="username" placeholder="Choose a username" required><br>
            <input type="password" name="password" placeholder="Create a password" required><br>
            <button type="submit">Register</button>
        </form>

        <p>Already have an account? <a href="index.php?page=login">Log in</a></p>
    </div>
</body>
</html>