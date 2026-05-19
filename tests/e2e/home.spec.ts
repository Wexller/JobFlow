import { expect, test } from '@playwright/test'

test('renders the localized home page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /job-search CRM/i })).toBeVisible()
  await expect(page.getByText('Total applications')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Next actions' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Vacancies' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pipeline events' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Interviews' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Offers' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: 'EN' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: 'RU' })).toBeVisible()

  await page.getByRole('link', { name: 'Vacancies' }).click()
  await expect(page).toHaveURL(/\/vacancies$/)
  await expect(page.getByRole('heading', { name: 'Vacancies' })).toBeVisible()
  await expect(page.getByLabel('Vacancy status filter')).toBeEnabled()
  await page.getByLabel('Vacancy status filter').selectOption('offer')
  await expect(page.getByLabel('Vacancy status filter')).toHaveValue('offer')
  await expect(page.getByRole('table', { name: 'Vacancies table' }).getByRole('cell', { name: 'Atlas Cloud' })).toBeVisible()
})

test('switches locale between english and russian', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /job-search CRM/i })).toBeVisible()
  await page.getByRole('button', { exact: true, name: 'RU' }).click()
  await expect(page.getByRole('heading', { name: /CRM для поиска работы/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Сбросить фильтры' })).toBeVisible()

  await page.getByRole('button', { exact: true, name: 'EN' }).click()
  await expect(page.getByRole('heading', { name: /job-search CRM/i })).toBeVisible()
})
