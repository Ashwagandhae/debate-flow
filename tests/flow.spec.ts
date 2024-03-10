import { test, expect } from '@playwright/test';

test('add and delete flows', async ({ page }) => {
	await page.goto('/app');
	// create an aff flow
	await page.getByRole('button', { name: 'aff' }).click();
	await page.getByPlaceholder('type name here').fill('hello');
	// create a neg flow
	await page.getByRole('button', { name: 'neg' }).click();
	await page.getByPlaceholder('type name here').fill('hello');
	// create an aff flow
	await page.getByRole('button', { name: 'aff' }).click();
	await page.getByPlaceholder('type name here').fill('goodbye');
	// create an aff flow
	await page.getByRole('button', { name: 'aff' }).click();
	await page.getByPlaceholder('type name here').fill('delete me');
	// delete last flow
	await page.locator('.button > .element > .top').click();

	expect(await page.getByRole('button', { name: 'hello' }).count()).toEqual(2);
	expect(await page.getByRole('button', { name: 'goodbye' }).count()).toEqual(1);
	expect(await page.getByRole('button', { name: 'delete me' }).count()).toEqual(0);

	expect(await page.getByPlaceholder('type name here').inputValue()).toEqual('goodbye');
});

test('add box below', async ({ page }) => {
	await page.goto('/app');
	await page.getByRole('button', { name: 'aff' }).click();
	await page.getByPlaceholder('type name here').fill('test');
	await page.getByPlaceholder('type name here').press('Enter');
	await page.getByPlaceholder('type here').fill('hello');
	await page.getByPlaceholder('type here').press('Enter');
	await page.getByRole('textbox').nth(2).fill('hello');
	await page.getByRole('textbox').nth(2).press('Enter');
	await page.getByRole('textbox').nth(3).fill('goodbye');
	await page.locator('div:nth-child(5) > .top').first().click();
	await page.locator('div:nth-child(5) > .top').first().click();
	expect(await page.getByPlaceholder('type here').inputValue()).toEqual('hello');
	expect(
		await page
			.locator('div:nth-child(2) > .content > .barcontainer > .text > textarea')
			.inputValue()
	).toEqual('hello');
	expect(
		await page
			.locator('div:nth-child(3) > .content > .barcontainer > .text > textarea')
			.inputValue()
	).toEqual('goodbye');
	expect(
		await page
			.locator('div:nth-child(4) > .content > .barcontainer > .text > textarea')
			.inputValue()
	).toEqual('');
	expect(
		await page
			.locator('div:nth-child(5) > .content > .barcontainer > .text > textarea')
			.inputValue()
	).toEqual('');
});
