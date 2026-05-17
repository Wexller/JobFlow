import { expect, test } from '@playwright/test'

test('renders the localized home page', async ({ page }) => {
  await page.goto('/')
  const vacanciesTable = page.getByRole('table', { name: 'Vacancies table' })

  await expect(page.getByRole('heading', { name: /job-search CRM/i })).toBeVisible()
  await expect(page.getByText('Total applications')).toBeVisible()
  await expect(vacanciesTable.getByRole('cell', { name: 'Northstar Labs' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Next actions' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Vacancies' })).toBeVisible()
  await expect(page.getByLabel('Vacancy status filter')).toBeEnabled()
  await page.getByLabel('Vacancy status filter').selectOption('offer')
  await expect(page.getByLabel('Vacancy status filter')).toHaveValue('offer')
  await expect(vacanciesTable.getByRole('cell', { name: 'Atlas Cloud' })).toBeVisible()
  await expect(vacanciesTable.getByRole('cell', { name: 'Northstar Labs' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(vacanciesTable.getByRole('cell', { name: 'Northstar Labs' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: 'EN' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: 'RU' })).toBeVisible()
})
