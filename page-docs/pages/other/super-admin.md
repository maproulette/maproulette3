# Super Admin (`/super-admin`)

**Source**: `src/components/SuperAdminPages/`

Admin-only section for platform management. All pages require super admin privileges.

### Home

Dashboard with navigation cards to each admin section.

### Users (`/super-admin/users`)

Searchable, paginated table of all platform users showing avatar, name, OSM ID, email, role (super_admin/admin/user), score, and join date.

### Projects (`/super-admin/projects`)

Grid of all projects on the platform with stats (total, active, challenges, avg completion) and search. Each card shows owner, status, challenge count, and completion rate.

### Challenges (`/super-admin/challenges`)

Grid of all challenges with stats and search. Cards show project, owner, status, tasks remaining, progress bar, and difficulty.

### Analytics (`/super-admin/analytics`)

Platform metrics: total users, active projects/challenges, tasks completed, average completion time, daily active users, and system uptime. Includes placeholder areas for chart visualizations and lists of top contributors and most active projects.

### Plugins (`/super-admin/plugins`)

Grid of all plugins with stats and search. Cards show name, version, author, status (active/inactive/beta/deprecated), download count, and configuration options.

### Settings (`/super-admin/settings`)

Platform-wide configuration organized into six cards: General (site name, description, URL, maintenance mode), Email (SMTP settings), Security (verification, 2FA, session timeout, password policy), Database (host, port, backups, maintenance), Notifications (toggle notification types), and Appearance (dark mode default, brand color, logo URL).
