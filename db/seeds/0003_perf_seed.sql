-- PERF profile: extended fixture set for heavier local checks
BEGIN;

INSERT INTO vacancies (
  id, company, role, status, priority, format, source, location, level, tech_stack,
  salary_min, salary_max, currency, match_score, applied_at, next_action_at, created_at, updated_at, notes
) VALUES
  ('vacancy-frontend-platform', 'Northstar Labs', 'Senior Frontend Engineer', 'interviewing', 'high', 'remote', 'referral', 'Berlin', 'senior', ARRAY['Vue', 'TypeScript', 'Nuxt'], 115000, 140000, 'EUR', 91, '2026-05-02', '2026-05-21T10:00:00Z', '2026-05-01T09:00:00Z', '2026-05-14T15:30:00Z', 'Strong product engineering fit.'),
  ('vacancy-product-crm', 'SignalWorks', 'Product Engineer', 'screening', 'medium', 'hybrid', 'linkedin', 'Amsterdam', 'middle', ARRAY['Vue', 'Node.js', 'PostgreSQL'], 90000, 115000, 'EUR', 78, '2026-05-08', '2026-05-18T13:00:00Z', '2026-05-07T11:20:00Z', '2026-05-11T08:00:00Z', NULL),
  ('vacancy-design-systems', 'Atlas Cloud', 'Design Systems Engineer', 'offer', 'urgent', 'remote', 'company_site', 'London', 'senior', ARRAY['Vue', 'Accessibility', 'Storybook'], 125000, 150000, 'GBP', 88, '2026-04-22', '2026-05-19T09:00:00Z', '2026-04-20T10:00:00Z', '2026-05-15T17:00:00Z', NULL),
  ('vacancy-legacy-modernization', 'BrightBank', 'Frontend Modernization Lead', 'rejected', 'low', 'onsite', 'recruiter', 'Prague', 'lead', ARRAY['Vue', 'Migration', 'Testing'], 100000, 120000, 'EUR', 64, '2026-04-10', NULL, '2026-04-09T07:30:00Z', '2026-04-30T16:00:00Z', NULL)
ON CONFLICT (id) DO UPDATE SET
  company = EXCLUDED.company,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  format = EXCLUDED.format,
  source = EXCLUDED.source,
  location = EXCLUDED.location,
  level = EXCLUDED.level,
  tech_stack = EXCLUDED.tech_stack,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  currency = EXCLUDED.currency,
  match_score = EXCLUDED.match_score,
  applied_at = EXCLUDED.applied_at,
  next_action_at = EXCLUDED.next_action_at,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at,
  notes = EXCLUDED.notes;

INSERT INTO pipeline_events (
  id, vacancy_id, stage, status, title, occurred_at, scheduled_at, completed_at, notes
) VALUES
  ('pipeline-platform-applied', 'vacancy-frontend-platform', 'applied', 'completed', NULL, '2026-05-02T09:00:00Z', NULL, NULL, NULL),
  ('pipeline-platform-technical', 'vacancy-frontend-platform', 'technical_screen', 'scheduled', 'Vue architecture interview', NULL, '2026-05-21T10:00:00Z', NULL, NULL),
  ('pipeline-crm-screen', 'vacancy-product-crm', 'recruiter_screen', 'scheduled', NULL, NULL, '2026-05-18T13:00:00Z', NULL, NULL),
  ('pipeline-systems-offer', 'vacancy-design-systems', 'offer', 'completed', NULL, NULL, NULL, '2026-05-15T17:00:00Z', NULL)
ON CONFLICT (id) DO UPDATE SET
  vacancy_id = EXCLUDED.vacancy_id,
  stage = EXCLUDED.stage,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  occurred_at = EXCLUDED.occurred_at,
  scheduled_at = EXCLUDED.scheduled_at,
  completed_at = EXCLUDED.completed_at,
  notes = EXCLUDED.notes;

INSERT INTO interviews (
  id, vacancy_id, pipeline_event_id, stage, scheduled_at, result, interviewer_names, location, notes
) VALUES
  ('interview-platform-technical', 'vacancy-frontend-platform', 'pipeline-platform-technical', 'technical_screen', '2026-05-21T10:00:00Z', 'pending', ARRAY['Maya', 'Oleg'], 'Google Meet', NULL),
  ('interview-crm-recruiter', 'vacancy-product-crm', 'pipeline-crm-screen', 'recruiter_screen', '2026-05-18T13:00:00Z', 'pending', ARRAY['Nina'], 'Zoom', NULL)
ON CONFLICT (id) DO UPDATE SET
  vacancy_id = EXCLUDED.vacancy_id,
  pipeline_event_id = EXCLUDED.pipeline_event_id,
  stage = EXCLUDED.stage,
  scheduled_at = EXCLUDED.scheduled_at,
  result = EXCLUDED.result,
  interviewer_names = EXCLUDED.interviewer_names,
  location = EXCLUDED.location,
  notes = EXCLUDED.notes;

INSERT INTO offers (
  id, vacancy_id, decision, offered_at, decision_due_at, salary_min, salary_max, currency, notes
) VALUES
  ('offer-design-systems', 'vacancy-design-systems', 'pending', '2026-05-15T17:00:00Z', '2026-05-22T00:00:00Z', 130000, 145000, 'GBP', NULL)
ON CONFLICT (id) DO UPDATE SET
  vacancy_id = EXCLUDED.vacancy_id,
  decision = EXCLUDED.decision,
  offered_at = EXCLUDED.offered_at,
  decision_due_at = EXCLUDED.decision_due_at,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  currency = EXCLUDED.currency,
  notes = EXCLUDED.notes;

COMMIT;

INSERT INTO vacancies (id, company, role, status, priority, format, tech_stack, created_at, updated_at) VALUES ('vacancy-perf-extra-1','Perf Labs','Frontend Engineer','applied','medium','remote',ARRAY['Vue'],'2026-05-01T00:00:00Z','2026-05-01T00:00:00Z') ON CONFLICT (id) DO UPDATE SET updated_at=EXCLUDED.updated_at;
