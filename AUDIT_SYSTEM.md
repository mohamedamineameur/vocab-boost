# 🔒 Audit System - Non-Repudiation Implementation

## Overview

This application implements a comprehensive audit logging system following the **non-repudiation** principle. Every critical security action is logged with WHO, WHAT, WHEN, WHERE, and RESULT.

## Database Schema

### `audit_logs` Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR,
  action VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id VARCHAR,
  ip VARCHAR NOT NULL,
  user_agent TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_email ON audit_logs(email);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);
```

## Logged Actions

### 🔐 Authentication & Security (Critical)

| Action | Controller | Trigger | Success/Failure |
|--------|------------|---------|-----------------|
| `LOGIN_SUCCESS` | `session.controller.ts` | MFA code verified, session created | ✅ |
| `LOGIN_FAILED` | `session.controller.ts` | Invalid credentials, user not found, unverified email | ❌ |
| `MFA_SENT` | `session.controller.ts` | 6-digit code generated and sent | ✅ |
| `MFA_VERIFIED` | `session.controller.ts` | MFA code validated | ✅ |
| `MFA_FAILED` | `session.controller.ts` | Invalid/expired code, user not found | ❌ |
| `LOGOUT` | `session.controller.ts` | User logs out | ✅ |
| `SESSION_REVOKED` | `session.controller.ts` | User revokes a session | ✅ |

### 👤 User Management

| Action | Controller | Trigger | Data Logged |
|--------|------------|---------|-------------|
| `USER_CREATED` | `user.controller.ts` | New user registration | email, userId |
| `USER_DELETED` | `user.controller.ts` | User deletes own account | userId, email, actorId |
| `ADMIN_USER_DELETED` | `user.controller.ts` | Admin deletes user account | userId, email, adminId |
| `EMAIL_VERIFIED` | `user.controller.ts` | User verifies email | userId, email |
| `EMAIL_VERIFICATION_RESENT` | `user.controller.ts` | Verification email resent | userId, email |

### 🔑 Password & Profile

| Action | Controller | Trigger | Data Logged |
|--------|------------|---------|-------------|
| `PASSWORD_CHANGED` | `user.controller.ts` | User updates password | userId, email |
| `PASSWORD_RESET_REQUESTED` | `user.controller.ts` | Password reset email sent | userId, email |
| `PASSWORD_RESET_COMPLETED` | `user.controller.ts` | Password reset via token | userId, email |
| `EMAIL_CHANGED` | `user.controller.ts` | User changes email | old email, new email |
| `PROFILE_UPDATED` | `user.controller.ts` | User updates profile info | changed fields |

## Data Captured for Each Log

### Mandatory Fields
- **userId**: User ID (null for anonymous actions like failed logins)
- **email**: Email address (preserved even if user deleted)
- **action**: Action type (enum)
- **ip**: Client IP address
- **userAgent**: Browser/device information
- **success**: true/false
- **createdAt**: Timestamp (immutable)

### Optional Fields
- **resourceType**: Type of resource affected (USER, SESSION, PASSWORD, etc.)
- **resourceId**: ID of affected resource
- **errorMessage**: Error description for failed actions
- **metadata**: Additional contextual data (JSON)

## Access Control

### Who Can View Logs?
- **Admins Only**: Full access to all audit logs via `/api/audit-logs`
- **Regular Users**: Cannot access audit logs (could be extended to show own logs)

## API Endpoints (Admin Only)

### `GET /api/audit-logs`
Retrieve audit logs with filtering and pagination.

**Query Parameters:**
- `userId`: Filter by user ID
- `action`: Filter by action type
- `success`: Filter by success status (true/false)
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `limit`: Results per page (default: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "logs": [...],
  "pagination": {
    "total": 1234,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### `GET /api/audit-logs/stats`
Get statistics about audit logs.

**Response:**
```json
{
  "stats": {
    "totalLogs": 1234,
    "successCount": 1100,
    "failedCount": 134,
    "successRate": 89,
    "loginAttempts": 456,
    "failedLogins": 23,
    "failedLoginRate": 5
  },
  "topActions": [...]
}
```

### `GET /api/audit-logs/user/:userId`
Get audit logs for a specific user.

## Frontend Admin Panel

### Route: `/admin/audit-logs`
- Real-time statistics dashboard
- Filterable logs table
- Search by email, IP, action
- Pagination support
- Color-coded success/failure indicators

### Features:
- 📊 Statistics cards (total, success, failed, login attempts)
- 🔍 Search and filter by action, status
- 📅 Date range filtering (coming soon)
- 📄 Pagination (50 logs per page)
- 🎨 Visual indicators for success/failure
- 👤 User information (name, email)
- 🌐 IP and device tracking

## Security Considerations

### Data Retention
- Logs are **never deleted** (unless manual database cleanup)
- User deletion sets `userId` to NULL but preserves log
- Email field preserved for traceability

### Privacy Compliance
- No sensitive data (passwords, tokens) logged
- Only metadata necessary for security auditing
- IP addresses stored for security analysis

### Performance
- Indexed on key fields (userId, email, action, createdAt, success)
- Pagination to prevent large result sets
- JSONB for flexible metadata storage

## Use Cases

### 1. Security Investigation
```sql
-- Find all failed login attempts for a user
SELECT * FROM audit_logs 
WHERE email = 'user@example.com' 
AND action = 'LOGIN_FAILED'
ORDER BY created_at DESC;
```

### 2. Account Compromise Detection
```sql
-- Find multiple failed logins from different IPs
SELECT email, ip, COUNT(*) as attempts
FROM audit_logs
WHERE action = 'LOGIN_FAILED'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY email, ip
HAVING COUNT(*) > 3;
```

### 3. Admin Activity Tracking
```sql
-- Find all admin deletions
SELECT * FROM audit_logs
WHERE action = 'ADMIN_USER_DELETED'
ORDER BY created_at DESC;
```

### 4. Password Reset Abuse
```sql
-- Find users with multiple password reset requests
SELECT email, COUNT(*) as reset_count
FROM audit_logs
WHERE action = 'PASSWORD_RESET_REQUESTED'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY email
HAVING COUNT(*) > 3;
```

## Implementation Details

### Centralized Audit Service
Location: `src/utils/auditService.ts`

All audit logging goes through centralized functions:
- `createAuditLog()`: Generic log creation
- `logLoginAttempt()`: Login-specific
- `logMFAVerification()`: MFA-specific
- `logPasswordChange()`: Password-specific
- `logProfileUpdate()`: Profile-specific
- `logUserManagement()`: User CRUD-specific
- `logSessionAction()`: Session-specific

### Error Handling
- Audit logging **never fails the main operation**
- Errors caught and logged to console only
- System remains operational even if audit logging fails

### Console Logging
Each audit log also prints to console for real-time monitoring:
```
✅ AUDIT [LOGIN_SUCCESS] User: user@example.com | IP: 192.168.1.1 | Success: true
❌ AUDIT [LOGIN_FAILED] User: hacker@evil.com | IP: 45.67.89.10 | Success: false | Error: Invalid password
```

## Compliance

This system helps with:
- **GDPR**: Tracking data access and modifications
- **SOC 2**: Security monitoring and incident response
- **PCI DSS**: Access logging for payment systems (if applicable)
- **HIPAA**: Audit trails for healthcare data (if applicable)
- **ISO 27001**: Information security management

## Non-Repudiation Benefits

1. **Accountability**: Every action traced to a user/IP
2. **Forensics**: Complete timeline for security investigations
3. **Compliance**: Proof of security controls
4. **Deterrence**: Users know actions are logged
5. **Incident Response**: Quick identification of security breaches

---

**Note**: This system is production-ready and follows industry best practices for audit logging and non-repudiation.


