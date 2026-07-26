INSERT INTO tariff_plans (name, rate_per_unit, fixed_charge, active, created_at, updated_at)
SELECT 'Standard', 2.50, 25.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariff_plans WHERE name = 'Standard');

INSERT INTO tariff_slabs (tariff_plan_id, min_units, max_units, rate_per_unit)
SELECT 1, 0.0, 10.0, 5.00 WHERE NOT EXISTS (SELECT 1 FROM tariff_slabs WHERE tariff_plan_id = 1 AND min_units = 0.0);

INSERT INTO tariff_slabs (tariff_plan_id, min_units, max_units, rate_per_unit)
SELECT 1, 10.0, 20.0, 8.00 WHERE NOT EXISTS (SELECT 1 FROM tariff_slabs WHERE tariff_plan_id = 1 AND min_units = 10.0);

INSERT INTO tariff_slabs (tariff_plan_id, min_units, max_units, rate_per_unit)
SELECT 1, 20.0, NULL, 12.00 WHERE NOT EXISTS (SELECT 1 FROM tariff_slabs WHERE tariff_plan_id = 1 AND min_units = 20.0);

INSERT INTO billing_cycles (name, period_start, period_end, active, generated_at, created_at, updated_at)
SELECT 'July 2026', '2026-07-01', '2026-07-31', true, '2026-07-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM billing_cycles WHERE name = 'July 2026');
