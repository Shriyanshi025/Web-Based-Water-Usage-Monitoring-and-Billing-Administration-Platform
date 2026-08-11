# HydroSync - Water Usage Monitoring & Billing Administration Platform

## Overview & Architecture
HydroSync is an enterprise web-based application designed to monitor water usage, manage billing cycles, track payments, benchmark household efficiency, detect outliers/leaks, and handle resident support complaints.

## Role-Based Access Control (RBAC) & Scopes
1. **Public / Visitor**: Can view landing pages, public tariff information, general features, and platform overview. Cannot access any private billing or resident data.
2. **Resident**: Can access their own unit's telemetry dashboard, view monthly water consumption, review current and historical bills/invoices, make online payments, raise support complaints/tickets, and configure alert thresholds.
3. **Community Admin**: Manages a specific community. Has access to all residents, water meters, billing generation, payment tracking, support ticket resolutions, benchmarking rankings, and water balance distribution for that community only.
4. **Main Admin**: Platform owner. Has global system visibility across all registered communities, community admins, aggregate consumption telemetry, system-wide billing, and cross-community performance benchmarking.

## Key Terminology & Concepts
- **NRW (Non-Revenue Water)**: Water that is supplied to a community but "lost" before it reaches the end customer (due to leaks, theft, or metering inaccuracies).
- **Water Balance**: The relationship between total bulk water supplied/purchased at the community inlet versus the sum of individual household water consumption. The difference is the distribution loss.
- **Distribution Loss**: Calculated as: `Water Supplied - Total Household Consumption`. High distribution loss indicates major pipe leaks or faulty master meters.
- **Outlier Detection**: Statistical process identifying households with abnormally high water consumption compared to their historical average or their occupancy peers, suggesting potential internal household leaks.
- **Efficiency Score**: A metric from 0 to 100 assigned to households based on their normalized consumption per resident. Higher scores indicate more water-efficient behavior.
- **Billing Cycle**: A monthly period where community admins review consumption logs, apply tariff rates, generate invoices, and dispatch billing notifications.

## Billing, Tariffs & Payments
- **Tariff Plans**: Tiered/slab-based structures where consumption per unit (kL) falls into defined brackets (e.g. 0-10 kL, 10-25 kL, >25 kL). Fixed base charges and municipal taxes may apply.
- **Invoice Generation**: Generated automatically or initiated by Community Admins per billing cycle. Includes breakdown of slab charges, shared common area water costs, and due dates.
- **Payment Gateway**: Integrated with Razorpay for secure online transactions via UPI, Credit/Debit Cards, and Net Banking. Once paid, the bill status is marked PAID immediately.

## Support & Alerts
- **Support Tickets**: Residents can file tickets categorized as Billing, Leakage, Water Quality, or Meter Malfunction. Community admins track, assign, and resolve tickets.
- **Leak & Overuse Alerts**: Automated system notifications triggered when telemetry detects continuous flow or sudden consumption spikes exceeding threshold limits.

## User Guidance & FAQs
- **How to pay a bill?** Residents can view bills in the "Bills" tab and pay online using integrated mock payment gateways (Razorpay).
- **How to raise a complaint?** Residents can navigate to the "Support Center", click "Raise Ticket", select a category (Billing, Leak, Quality, Meter), and submit.
- **Why is my bill high?** High consumption could be due to increased occupancy, seasonal usage, or a hidden leak. Check the dashboard's Outlier status or raise a Leak complaint.
