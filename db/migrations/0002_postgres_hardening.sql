BEGIN;

ALTER TABLE vacancies
  ADD CONSTRAINT vacancies_created_updated_ck
  CHECK (updated_at >= created_at);

ALTER TABLE offers
  ADD CONSTRAINT offers_decision_due_after_offer_ck
  CHECK (decision_due_at IS NULL OR offered_at IS NULL OR decision_due_at >= offered_at);

CREATE INDEX IF NOT EXISTS idx_vacancies_status_priority_next_action
  ON vacancies (status, priority, next_action_at);

CREATE INDEX IF NOT EXISTS idx_pipeline_events_vacancy_schedule
  ON pipeline_events (vacancy_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_interviews_vacancy_schedule
  ON interviews (vacancy_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_offers_vacancy_decision
  ON offers (vacancy_id, decision);

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vacancies_set_updated_at ON vacancies;
CREATE TRIGGER vacancies_set_updated_at
BEFORE UPDATE ON vacancies
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

COMMIT;
