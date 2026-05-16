import { expect, test } from '@playwright/test'

test('renders the localized home page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /job-search CRM/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'EN' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'RU' })).toBeVisible()
})
