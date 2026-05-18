-- Jobflow Postgres relational schema (Milestone 2 / step 1)
-- This schema mirrors current domain models and stable enum IDs.

BEGIN;

CREATE TABLE IF NOT EXISTS vacancies (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'wishlist', 'applied', 'screening', 'interviewing', 'offer',
    'accepted', 'rejected', 'archived', 'unknown'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'unknown')),
  format TEXT NOT NULL CHECK (format IN ('remote', 'hybrid', 'onsite', 'unknown')),
  source TEXT,
  location TEXT,
  level TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  salary_min NUMERIC(12, 2),
  salary_max NUMERIC(12, 2),
  currency TEXT,
  match_score NUMERIC(5, 2),
  applied_at DATE,
  next_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ,
  notes TEXT,
  CONSTRAINT vacancies_salary_range_ck CHECK (
    salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min
  )
);

CREATE TABLE IF NOT EXISTS pipeline_events (
  id TEXT PRIMARY KEY,
  vacancy_id TEXT NOT NULL REFERENCES vacancies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  stage TEXT NOT NULL CHECK (stage IN (
    'sourced', 'applied', 'recruiter_screen', 'technical_screen',
    'take_home', 'onsite', 'offer', 'decision', 'unknown'
  )),
  status TEXT NOT NULL CHECK (status IN ('planned', 'scheduled', 'completed', 'skipped', 'failed', 'unknown')),
  title TEXT,
  occurred_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  vacancy_id TEXT NOT NULL REFERENCES vacancies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  pipeline_event_id TEXT REFERENCES pipeline_events(id) ON UPDATE CASCADE ON DELETE SET NULL,
  stage TEXT NOT NULL CHECK (stage IN ('recruiter_screen', 'technical_screen', 'take_home', 'onsite', 'unknown')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('pending', 'passed', 'failed', 'cancelled', 'no_show', 'unknown')),
  interviewer_names TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  vacancy_id TEXT NOT NULL UNIQUE REFERENCES vacancies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  decision TEXT NOT NULL CHECK (decision IN ('pending', 'accepted', 'declined', 'expired', 'withdrawn', 'unknown')),
  offered_at TIMESTAMPTZ,
  decision_due_at TIMESTAMPTZ,
  salary_min NUMERIC(12, 2),
  salary_max NUMERIC(12, 2),
  currency TEXT,
  notes TEXT,
  CONSTRAINT offers_salary_range_ck CHECK (
    salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min
  )
);

CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);
CREATE INDEX IF NOT EXISTS idx_vacancies_priority ON vacancies(priority);
CREATE INDEX IF NOT EXISTS idx_vacancies_applied_at ON vacancies(applied_at);
CREATE INDEX IF NOT EXISTS idx_vacancies_next_action_at ON vacancies(next_action_at);

CREATE INDEX IF NOT EXISTS idx_pipeline_events_vacancy_id ON pipeline_events(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_stage ON pipeline_events(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_scheduled_at ON pipeline_events(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_interviews_vacancy_id ON interviews(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_interviews_pipeline_event_id ON interviews(pipeline_event_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_offers_vacancy_id ON offers(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_offers_decision ON offers(decision);

COMMIT;
