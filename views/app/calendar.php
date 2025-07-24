<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Calendar - OfferTrail</title>
    <link rel="stylesheet" href="/FinalProject_COMP3541/public/style.css">
</head>
<body>
    <div class="calendar-container">
        <div class="calendar-header">
            <a href="index.php?page=dashboard" class="add-link">← Back to Applications</a>
            <div class="calendar-nav-buttons">
                <button onclick="changeMonth(-1)">← Prev</button>
                <button onclick="changeMonth(1)">Next →</button>
            </div>
        </div>

        <div class="calendar-top">
            <span id="calendar-title" class="calendar-title"></span>
        </div>

        <div class="calendar-days">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
        </div>

        <div class="calendar-grid" id="calendar-grid"></div>
    </div>

    <script id="application-data" type="application/json">
        <?= json_encode($applicationDates ?? []) ?>
    </script>

    <script>
        const rawData = document.getElementById('application-data').textContent;
        const applicationData = JSON.parse(rawData);
        const grid = document.getElementById('calendar-grid');
        const title = document.getElementById('calendar-title');

        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        function changeMonth(offset) {
            currentMonth += offset;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            } else if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar();
        }

        function generateCalendar() {
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const startDay = firstDay.getDay();
            const totalDays = lastDay.getDate();

            title.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;
            grid.innerHTML = '';

            for (let i = 0; i < startDay; i++) {
                const empty = document.createElement('div');
                empty.classList.add('calendar-cell', 'calendar-empty');
                grid.appendChild(empty);
            }

            for (let day = 1; day <= totalDays; day++) {
                const cell = document.createElement('div');
                cell.classList.add('calendar-cell');

                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entries = applicationData.filter(app => app.date_applied?.startsWith(dateStr));

                const dayLabel = document.createElement('strong');
                dayLabel.textContent = day;
                cell.appendChild(dayLabel);

                if (entries.length > 0) {
                    cell.classList.add('highlight');

                    entries.forEach(app => {
                        const entry = document.createElement('div');
                        const status = (app.status || '').trim().toLowerCase();
                        const validStatus = ['accepted', 'rejected', 'pending'];
                        const statusClass = validStatus.includes(status) ? status : 'pending';

                        entry.classList.add('entry', statusClass);
                        entry.setAttribute('aria-label', `${status} application`);
                        entry.textContent = `${app.company_name} - ${app.position}`;

                        cell.appendChild(entry);
                    });
                }

                grid.appendChild(cell);
            }
        }

        generateCalendar();
    </script>
</body>
</html>