-- HYDROSYNC DEVELOPMENT CLEANUP SCRIPT
BEGIN;
DELETE FROM payments WHERE bill_id IN (SELECT id FROM bills WHERE billing_cycle_id IN (SELECT id FROM billing_cycles WHERE name LIKE 'TEST-%' OR name LIKE 'Test%'));
DELETE FROM alerts WHERE billing_cycle_id IN (SELECT id FROM billing_cycles WHERE name LIKE 'TEST-%' OR name LIKE 'Test%');
DELETE FROM bulk_water_purchases WHERE billing_cycle_id IN (SELECT id FROM billing_cycles WHERE name LIKE 'TEST-%' OR name LIKE 'Test%');
DELETE FROM bills WHERE billing_cycle_id IN (SELECT id FROM billing_cycles WHERE name LIKE 'TEST-%' OR name LIKE 'Test%');
DELETE FROM billing_cycles WHERE name LIKE 'TEST-%' OR name LIKE 'Test%';
COMMIT;
