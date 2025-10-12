# ⚡ Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### 2. Setup Database
```bash
docker-compose up -d
```

### 3. Configure Environment
Create `.env` file:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=english_learning_dev

SALT_ROUNDS=10
SESSION_EXPIRATION=24

MAIL_EMAIL=your-email@gmail.com
MAIL_PASS=your-app-password

OPENAI_API_KEY=your-openai-key

DOMAIN=http://localhost:3000
DOMAIN2=http://localhost:5173
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Create Admin Account
```bash
npm run create-admin
```

### 6. Start Servers
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### 7. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Admin Login**: Use credentials from step 5

## 📱 First Steps

### As Regular User:
1. Sign up at http://localhost:5173/signup
2. Check email for verification link
3. Verify email
4. Create profile (choose language)
5. Select categories
6. Add words to learn
7. Start quizzes!

### As Admin:
1. Login with admin credentials
2. Access audit logs: http://localhost:5173/admin/audit-logs
3. Monitor security events
4. Manage users

## 🛠️ Common Commands

```bash
# Backend
npm run dev              # Development server
npm run test             # Run tests
npm run create-admin     # Create admin (interactive)
npm run seed             # Seed categories

# Frontend
cd client
npm run dev              # Development server
npm run build            # Production build
```

## 🔧 Troubleshooting

### Database won't connect?
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Port already in use?
Change `PORT` in `.env` or kill the process:
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Email not sending?
1. Use Gmail with **App Password** (not regular password)
2. Enable 2FA on Gmail account
3. Generate App Password in Google Account settings
4. Use that password in `MAIL_PASS`

## 📚 Next Steps

- Read [README.md](./README.md) for complete documentation
- See [AUDIT_SYSTEM.md](./AUDIT_SYSTEM.md) for security logging
- Check [ADMIN_SCRIPTS.md](./ADMIN_SCRIPTS.md) for admin utilities

---

**Happy coding! 🎉**

