INSERT INTO tariff_plans (name, rate_per_unit, fixed_charge, active, created_at, updated_at) VALUES
('Standard', 2.50, 25.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO billing_cycles (name, period_start, period_end, active, generated_at, created_at, updated_at) VALUES
('July 2026', '2026-07-01', '2026-07-31', true, '2026-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
