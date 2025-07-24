<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login - OfferTrail</title>
    <link rel="stylesheet" href="public/style.css">
</head>
<body>
    <div class="form-card">
        <h2>Welcome</h2>
        <p>Sign in to your <strong>OfferTrail</strong> account</p>

        <?php if (isset($error) && $error): ?>
            <p style="color:red;"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>

        <form method="post" action="">
            <input type="text" name="username" placeholder="Enter your username" required><br>
            <input type="password" name="password" placeholder="Enter your password" required><br>
            <button type="submit">Log In</button>
        </form>

        <p>Don't have an account? <a href="index.php?page=register">Sign up</a></p>
    </div>
</body>
</html>