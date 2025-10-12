# 🛠️ Admin Utility Scripts

## Create Admin Account

Two methods are available to create an admin account:

### Method 1: Interactive Mode (Recommended)

```bash
npm run create-admin
```

This will launch an interactive wizard that prompts you for:
1. **First name**
2. **Last name**
3. **Email** (with validation)
4. **Password** (with strength requirements)
5. **Password confirmation**

**Password Requirements:**
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Example Session:**
```
🔐 Admin Account Creation Utility

================================

✅ Database connected

First name: John
Last name: Doe
Email: admin@example.com
Password (min 12 chars, 1 uppercase, 1 number, 1 special): ************
Confirm password: ************

✅ Admin account created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:     admin@example.com
👤 Name:      John Doe
🆔 ID:        550e8400-e29b-41d4-a716-446655440000
🔑 Admin:     Yes
✓  Verified:  Yes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 You can now log in with these credentials.
```

### Method 2: CLI Mode (For Automation)

```bash
npm run create-admin-cli -- --email=admin@example.com --password=SecurePass123! --firstname=John --lastname=Doe
```

**Arguments:**
- `--email`: Admin email address
- `--password`: Admin password
- `--firstname`: First name
- `--lastname`: Last name

**Example:**
```bash
npm run create-admin-cli -- \
  --email=super.admin@company.com \
  --password="MyS3cure!P@ssw0rd" \
  --firstname=Jane \
  --lastname=Smith
```

**Output:**
```
✅ Database connected

✅ Admin account created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:     super.admin@company.com
👤 Name:      Jane Smith
🆔 ID:        660f9511-f30c-52e5-b827-557766551111
🔑 Admin:     Yes
✓  Verified:  Yes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Features

### Existing User Handling
If a user with the provided email already exists, the script will:
1. **Interactive mode**: Ask if you want to promote them to admin
2. **CLI mode**: Automatically promote them to admin

### Auto-Verification
Admin accounts are automatically verified (`isVerified: true`), so no email verification is needed.

### Security
- Passwords are hashed with bcrypt (configurable salt rounds)
- Email validation
- Password strength validation
- Duplicate email detection

## Use Cases

### Development
```bash
# Quick admin for local development
npm run create-admin-cli -- \
  --email=dev@localhost \
  --password="DevPassword123!" \
  --firstname=Dev \
  --lastname=Admin
```

### Production Setup
```bash
# Interactive mode for secure password entry
npm run create-admin
```

### CI/CD Pipeline
```bash
# Automated admin creation in staging
npm run create-admin-cli -- \
  --email=$ADMIN_EMAIL \
  --password=$ADMIN_PASSWORD \
  --firstname=$ADMIN_FIRSTNAME \
  --lastname=$ADMIN_LASTNAME
```

## Admin Privileges

Admin accounts have access to:
- 👥 **User Management**: View all users, delete any user
- 📊 **Audit Logs**: Full access to security logs (`/admin/audit-logs`)
- 🔍 **System Monitoring**: View all sessions, activities
- 🛡️ **Security Controls**: Revoke any session

## Troubleshooting

### Database Connection Error
```
❌ Error creating admin: Unable to connect to database
```
**Solution**: Check your `.env` file and ensure PostgreSQL is running.

### Email Already Exists
```
⚠️  User with this email already exists.
Do you want to make this user admin? (y/n):
```
**Solution**: Type 'y' to promote existing user to admin, or 'n' to cancel.

### Password Validation Failed
```
❌ Password does not meet requirements:
   - Password must be at least 12 characters
   - Password must contain at least one uppercase letter
```
**Solution**: Use a stronger password that meets all requirements.

## Security Best Practices

1. **Never commit admin credentials** to version control
2. **Use strong passwords** in production (20+ characters)
3. **Rotate admin passwords** regularly
4. **Limit admin accounts** to essential personnel only
5. **Monitor admin actions** via audit logs
6. **Use MFA** for admin accounts (automatically enabled)

---

**For more information, see the main [README.md](./README.md)**

