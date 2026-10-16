-- Optional seed for SMA e-Permit Portal (run after 001_initial_schema.sql)
-- Times and business rules use Asia/Dubai in application code.

update settings
set
  admin_name = 'EHS Officer',
  gate_pass_recipients = '',
  ptw_standard_recipients = '',
  ptw_emergency_recipients = '',
  weekend_days = '{6,0}',
  max_permit_days = 7,
  emergency_max_hours = 12
where id = (select id from settings limit 1);

-- Example UAE public holiday (edit in admin settings or extend holidays jsonb)
-- update settings set holidays = '[{"date":"2026-12-02","name":"UAE National Day"}]'::jsonb
-- where id = (select id from settings limit 1);
