import { expect, test } from '@playwright/test'

test('renders the localized home page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Keep your job search on track/i })).toBeVisible()
  await expect(page.getByText('Total applications')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Next actions' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Vacancies', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Hiring steps', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Interviews', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Offers', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: 'EN' })).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: 'RU' })).toBeVisible()

  await page.getByRole('link', { name: 'Vacancies', exact: true }).first().click()
  await expect(page).toHaveURL(/\/vacancies$/)
  await expect(page.getByRole('heading', { name: 'Vacancies' })).toBeVisible()
  await expect(page.getByLabel('Vacancy status filter')).toBeEnabled()
  await page.getByLabel('Vacancy status filter').selectOption('offer')
  await expect(page.getByLabel('Vacancy status filter')).toHaveValue('offer')
  await expect(page.getByRole('table', { name: 'Vacancies table' }).getByRole('cell', { name: 'Atlas Cloud' })).toBeVisible()
})

test('switches locale between english and russian', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Keep your job search on track/i })).toBeVisible()
  await page.getByRole('button', { exact: true, name: 'RU' }).click()
  await expect(page.getByRole('heading', { name: /Поиск работы под контролем/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Вакансии', exact: true })).toBeVisible()

  await page.getByRole('button', { exact: true, name: 'EN' }).click()
  await expect(page.getByRole('heading', { name: /Keep your job search on track/i })).toBeVisible()
})

test.describe('mobile home pipeline', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('shows active opportunities without horizontal table scrolling hints', async ({ page }) => {
    await page.goto('/')

    const activeSection = page.locator('section').filter({
      has: page.getByRole('heading', { level: 2, name: 'Active opportunities' }),
    })

    await expect(activeSection.last()).toBeVisible()
    await expect(activeSection.last()).not.toContainText('Swipe horizontally to view all table columns.')
    await expect(page.getByRole('table', { name: 'Active opportunities table' })).toBeHidden()
    const mobileList = activeSection.last().locator('ul')
    await expect(mobileList.getByText('Northstar Labs')).toBeVisible()
    await expect(mobileList.getByText('SignalWorks')).toBeVisible()
  })
})
