BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_events_id_vacancy
  ON pipeline_events (id, vacancy_id);

ALTER TABLE interviews
  DROP CONSTRAINT IF EXISTS interviews_pipeline_event_match_fk;

ALTER TABLE interviews
  ADD CONSTRAINT interviews_pipeline_event_match_fk
  FOREIGN KEY (pipeline_event_id, vacancy_id)
  REFERENCES pipeline_events(id, vacancy_id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

COMMIT;
