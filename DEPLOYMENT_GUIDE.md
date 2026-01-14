# 🚀 BraineX - Complete Deployment & Setup Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Configuration](#database-configuration)
3. [Testing the Application](#testing-the-application)
4. [Production Deployment](#production-deployment)
5. [Hosting Options](#hosting-options)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- **Node.js** v18.0.0 or higher
- **MySQL** v8.0 or higher  
- **Git** (for version control)
- **npm** v9.0.0 or higher

### Step 1: Clone & Install

```bash
# Navigate to project directory
cd c:\Users\MMM\Desktop\BraineX-main

# Install all dependencies
npm install
```

### Step 2: Environment Configuration

```bash
# Create .env file from template
copy .env.example .env
```

Edit the `.env` file with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (IMPORTANT!)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=brainex_db
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD    # ⚠️ Change this!

# JWT Secrets (IMPORTANT!)
JWT_SECRET=brainex-super-secret-jwt-key-change-in-production-2024
JWT_REFRESH_SECRET=brainex-refresh-token-secret-change-in-production-2024

# Email (Optional for development - will use demo mode)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
```

---

## Database Configuration

### Option 1: Using MySQL (Recommended)

#### Install MySQL
1. Download from: https://dev.mysql.com/downloads/installer/
2. Install MySQL Community Server
3. Remember the root password you set

#### Create Database & Run Migrations

```bash
# Open MySQL Command Line or MySQL Workbench
mysql -u root -p

# Create the database
CREATE DATABASE brainex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations from project directory
node database/migrate.js

# Seed with sample data
node database/seed.js
```

**Expected Output:**
```
🔄 Connecting to MySQL...
✅ Connected to MySQL successfully!
🔄 Creating database 'brainex_db'...
✅ Database created successfully!
🔄 Running schema.sql...
✅ Tables created successfully!
```

**After Seeding:**
```
✅ Seeded 3 users
✅ Seeded 8 fields
✅ Seeded 10 scholarships
✅ Seeded 5 mentors
✅ Seeded 6 projects
✅ Seeded 4 events
```

### Verify Database Setup

```sql
mysql -u root -p
USE brainex_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM scholarships;
```

You should see 10+ tables and data in each.

---

## Testing the Application

### Start the Server

```bash
# Start development server
npm run dev
```

**Expected Output:**
```
🚀 BraineX server running on http://localhost:3000
📝 Environment: development
🔒 Security: Helmet, CORS, Rate Limiting enabled
⚡ Real-time: Socket.IO enabled
```

### Test Credentials

**Admin Account:**
- Email: `admin@brainex.com`
- Password: `Admin@123`

**Student Account:**
- Email: `john.doe@example.com`
- Password: `Student@123`

**Mentor Account:**
- Email: `mentor@example.com`
- Password: `Mentor@123`

### Access the Application

1. **Homepage:** http://localhost:3000
2. **Scholarships:** http://localhost:3000/scholarships
3. **Fields:** http://localhost:3000/fields
4. **Mentors:** http://localhost:3000/mentors
5. **Projects:** http://localhost:3000/projects
6. **Events:** http://localhost:3000/events
7. **Admin Panel:** http://localhost:3000/admin.html (login required)

### Test Checklist

- [ ] Homepage loads successfully
- [ ] Theme toggle works (dark/light)
- [ ] Navigation between pages works
- [ ] Login with test credentials
- [ ] View scholarships list
- [ ] Search functionality works
- [ ] Admin panel accessible (with admin credentials)

---

## Production Deployment

### Option A: Docker Deployment (Easiest)

#### Prerequisites
- Docker Desktop installed
- Docker Compose installed

#### Steps

```bash
# 1. Build Docker images
npm run docker:build

# 2. Start all services
npm run docker:up

# Services will start:
# - MySQL on port 3306
# - Redis on port 6379
# - Backend on port 3000
# - Nginx on port 80
```

Access at: http://localhost

#### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker-compose logs -f backend

# Stop all services
npm run docker:down

# Restart a service
docker-compose restart backend
```

### Option B: Traditional Server Deployment

#### 1. Prepare Production Build

```bash
# Set environment
set NODE_ENV=production

# Build frontend
npm run build

# Test production build
npm start
```

#### 2. Server Requirements

- **OS:** Ubuntu 20.04+ or Windows Server
- **RAM:** Minimum 2GB
- **Storage:** 10GB+
- **Domain:** Optional but recommended

#### 3. Install Production Dependencies

```bash
# On Ubuntu server
sudo apt-get update
sudo apt-get install -y nodejs npm mysql-server nginx

# Install PM2 for process management
npm install -g pm2
```

#### 4. Deploy Application

```bash
# Upload files to server
scp -r * user@your-server:/var/www/brainex

# On server
cd /var/www/brainex
npm install --production

# Start with PM2
pm2 start server.js --name brainex
pm2 save
pm2 startup
```

#### 5. Configure Nginx

Create `/etc/nginx/sites-available/brainex`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/brainex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Hosting Options

### 1. Heroku (Free/Paid)

**Pros:** Easy deployment, free tier available  
**Cons:** Sleeps after 30 min inactivity on free tier

```bash
# Install Heroku CLI
# Create Heroku app
heroku create brainex-app

# Add MySQL addon
heroku addons:create cleardb:ignite

# Deploy
git push heroku main
```

### 2. AWS (Paid)

**Services Needed:**
- EC2 (for application)
- RDS (for MySQL database)
- S3 (for file storage)
- CloudFront (for CDN)

**Estimated Cost:** $20-50/month

### 3. DigitalOcean (Paid - Recommended)

**Droplet Requirements:**
- Basic Droplet: $6/month (1GB RAM)
- Recommended: $12/month (2GB RAM)

**Setup:**
1. Create Ubuntu droplet
2. Follow Traditional Server Deployment steps above
3. Point domain to droplet IP

### 4. Vercel/Netlify (Frontend) + Railway (Backend)

**Frontend (Vercel/Netlify):** Free  
**Backend (Railway):** $5/month

---

## SSL/HTTPS Setup (Production)

### Using Certbot (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## Monitoring & Maintenance

### Check Application Status

```bash
# Using PM2
pm2 status
pm2 logs brainex

# Check disk space
df -h

# Check memory
free -m
```

### Database Backups

```bash
# Manual backup
mysqldump -u root -p brainex_db > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
0 2 * * * mysqldump -u root -pYOUR_PASSWORD brainex_db > /backups/brainex_$(date +\%Y\%m\%d).sql
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart brainex
```

---

## Troubleshooting

### Server Won't Start

**Error:** `Port 3000 already in use`
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Solution: Change PORT in .env file
```

**Error:** `Cannot connect to MySQL`
```bash
# Check MySQL is running
# Windows: Services → MySQL → Start
# Linux: sudo systemctl start mysql

# Verify credentials in .env file
# Test connection:
mysql -u root -p
```

### Database Migration Fails

```bash
# Drop and recreate database
mysql -u root -p

DROP DATABASE IF EXISTS brainex_db;
CREATE DATABASE brainex_db;
EXIT;

# Run migration again
node database/migrate.js
```

### Theme Toggle Not Working

- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)
- Verify theme.js is loaded in HTML

### API Returns 404

- Ensure server is running on correct port
- Check `API_BASE_URL` in JavaScript files
- Verify routes in server.js

---

##Quick Start Commands

```bash
# Complete setup from scratch
npm install
copy .env.example .env
# Edit .env with your MySQL password
node database/migrate.js
node database/seed.js
npm run dev

# Access: http://localhost:3000
# Login: admin@brainex.com / Admin@123
```

---

## Support

**Issues?** Check:
1. Node.js version: `node --version` (need 18+)
2. MySQL running: `mysql --version`
3. Dependencies installed: `npm list`
4. Correct .env configuration

**Still stuck?** Open an issue on GitHub with:
- Error message
- Steps to reproduce
- System info (OS, Node version, MySQL version)

---

## Security Checklist for Production

- [ ] Change all default passwords in .env
- [ ] Generate strong JWT secrets (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Set secure MySQL password
- [ ] Configure firewall (allow only ports 80, 443, 22)
- [ ] Enable rate limiting (already configured)
- [ ] Regular security updates: `npm audit fix`
- [ ] Database backups automated
- [ ] Monitor logs daily

---

## Performance Tips

1. **Enable Redis caching** (already configured in Docker)
2. **Use CDN** for static assets
3. **Enable Gzip compression** (configured in Nginx)
4. **Optimize images** (Sharp configured)
5. **Database indexing** (already implemented)

---

🎉 **You're all set! Visit http://localhost:3000 to see your BraineX platform!**
