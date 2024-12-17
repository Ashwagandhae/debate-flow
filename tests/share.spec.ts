import { test, expect } from '@playwright/test';

test('share', async ({ context }) => {
	const hostPage = await context.newPage();
	await hostPage.goto('/app');
	await hostPage.getByRole('button', { name: 'aff' }).click();
	await hostPage.getByPlaceholder('type name here').fill('test');
	await hostPage.getByPlaceholder('type name here').press('Enter');
	await hostPage.getByPlaceholder('type here').fill('test');
	await hostPage.getByRole('button', { name: 'neg' }).click();
	await hostPage.getByPlaceholder('type name here').fill('test 2');
	await hostPage.getByPlaceholder('type name here').press('Enter');
	await hostPage.getByPlaceholder('type here').fill('test 2');
	await hostPage.getByPlaceholder('type here').press('Shift+Enter');
	await hostPage.getByRole('textbox').nth(2).fill('test 3');
	await hostPage.getByRole('textbox').nth(2).press('ArrowLeft');
	await hostPage.locator('.sidebar .header .buttons div:nth-child(4) > .top').first().click();
	await hostPage.getByRole('button', { name: 'host new room' }).click();
	await hostPage.getByRole('button', { name: 'add guest' }).click();
	const joinLink = await hostPage.locator('.copyBox > .text').first().textContent();
	if (!joinLink) throw new Error('joinLink is null');
	expect(joinLink).toContain('/app?join=');

	const guestPage = await context.newPage();
	await guestPage.goto(joinLink);

	const confirmLink = await guestPage.locator('.copyBox > .text').first().textContent();
	if (!confirmLink) throw new Error('confirmLink is null');
	expect(confirmLink).toContain('/app?confirm=');

	const confirmPage = await context.newPage();
	await confirmPage.goto(confirmLink);

	expect(await confirmPage.getByRole('heading', { name: 'Close this tab' }).isVisible());
	expect(
		await confirmPage.getByText('confirm link information has been sent to host tab').isVisible()
	);

	expect(await guestPage.getByText('connected as guest 1').isVisible());

	expect(await hostPage.getByText('connected to guest 1').isVisible());

	// make flows are equal
	for (const page of [hostPage, guestPage]) {
		// close share modal
		await page.locator('.upper > .element > .top').click();

		// tabs
		expect(await page.getByRole('button', { name: 'test', exact: true }).isVisible());
		expect(await page.getByRole('button', { name: 'test 2' }).isVisible());
		// first tab
		await page.getByRole('button', { name: 'test', exact: true }).click();
		await page.waitForTimeout(2000);
		expect(await page.getByPlaceholder('type here').inputValue()).toBe('test');
		// second tab
		await page.getByRole('button', { name: 'test 2' }).click();
		expect(await page.getByPlaceholder('type here').inputValue()).toBe('test 2');
		expect(await page.getByRole('textbox').nth(2).inputValue()).toBe('test 3');
	}
	// see if edits go both ways
	let i = 0;
	for (const [page, otherPage] of [
		[hostPage, guestPage],
		[guestPage, hostPage]
	]) {
		// add tab on page
		await page.getByRole('button', { name: 'aff' }).click();
		await page.getByPlaceholder('type name here').first().fill(`share test ${i}`);
		await page.getByPlaceholder('type name here').first().press('Enter');
		// check if otherPage has the new tab
		expect(await otherPage.getByRole('button', { name: `share test ${i}` }).isVisible());
		i += 1;
	}
});
