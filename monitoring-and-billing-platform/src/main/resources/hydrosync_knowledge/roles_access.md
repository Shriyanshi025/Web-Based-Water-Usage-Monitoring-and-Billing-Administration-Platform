# HydroSync Role-Based Access Control (RBAC)
- Public / Visitor: Views landing page, platform overview, features, and public tariff information. No access to private telemetry or billing.
- Resident (USER): Accesses personal household water usage, meters, current/past bills, online Razorpay payments, complaints, and threshold alerts for their own unit only.
- Community Admin: Manages their assigned community only (resident directory, meters, usage logging, billing cycles, payment ledger, support tickets, invitations, and community benchmarking). Cannot access other communities.
- Main Admin: Global platform owner. Manages all communities, approves community admins, oversees platform-wide billing, cross-community telemetry, and system reports.
