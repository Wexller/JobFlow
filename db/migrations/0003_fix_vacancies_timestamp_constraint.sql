BEGIN;

ALTER TABLE vacancies
  DROP CONSTRAINT IF EXISTS vacancies_created_updated_ck;

COMMIT;
