OfferTrail - Job Application Tracker
====================================

Built as part of COMP 3541 - Web Site Design & Programming  
By: Samar Chauhan

Overview:
---------
OfferTrail is a simple and helpful web application built with PHP and MySQL to help users track their job applications in one place. Whether you're applying for internships or full-time roles, OfferTrail makes it easy to stay organized.

Main Features:
--------------
 User registration and login system  
 Add new job applications with details like company, position, date applied, status, and job link  
 Filter and search applications by keyword or status (Accepted, Pending, Rejected)  
 Edit or delete any application entry  
 View all your applications in a clean table format  
 Switch to calendar view to see when you applied for each position  
 Calendar entries are color-coded by status:
   - Green: Accepted  
   - Yellow/Grey: Pending  
   - Red: Rejected  
 Responsive and minimal design for better usability on different screen sizes  
 Light gradient background for a modern look  


How to Run:
-----------
1. **Set up a local server** (such as XAMPP or MAMP):
   - Make sure Apache and MySQL services are running.

2. **Database Setup**:
   - Import the provided `database.sql` file (if available) into phpMyAdmin.
   - This will create the `applications` table and other necessary tables.

3. **Project Files**:
   - Place the full project folder (e.g., `FinalProject_COMP3541`) inside the `htdocs` folder (XAMPP) or your equivalent `www` directory.

4. **Access the app**:
   - Open your browser and go to:  
     `http://localhost/FinalProject_COMP3541/index.php'

5. **Login or Register**:
   - create a new account. Otherwise, login with the test credentials provided.

6. **Start using OfferTrail!**  
   - Add new job applications, track your progress, and stay on top of all your submissions.

Folder Structure:
-----------------
- `index.php` – Main router file  
- `view/` – Contains HTML templates (dashboard, login, calendar, etc.)  
- `model/` – Application class handling all database actions  
- `public/style.css` – All styling for the app  
- `controller/` – Handles form submissions and routing logic  
- `database.sql` – (If included) Sample structure for database

Notes:
------
- This app is meant to be run locally and does not include production-level security features.
- Make sure PHP and MySQL are used to run the project.

