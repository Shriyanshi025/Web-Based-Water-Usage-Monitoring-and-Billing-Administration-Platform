# Rules for Water Usage Administration

- **NO AUTOMATIC EMAILS**: From now on, DO NOT send emails automatically unless explicitly instructed to implement, test, or verify email functionality.
- **NOTIFICATION DEFINITION**: "Notification" means ONLY the in-app notification system (Notification Bell, Notification Panel, Alert Dashboard, and unread badge).
- **PRIORITY ORDER**:
  1. In-App Notification (Highest Priority)
  2. Email Notification (Only when explicitly requested)
- **TESTING & QA RESTRICTION**:
  - Never trigger emails automatically just to verify functionality.
  - Never send test emails to the configured email address unless explicitly asked.
  - Skip email delivery verification completely unless "Test email notifications", "Verify email delivery", or "Enable email notifications" is requested.
  - Email functionality should remain implemented but stay dormant/inactive during development and verification unless explicitly requested.
