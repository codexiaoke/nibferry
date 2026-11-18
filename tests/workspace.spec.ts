import { expect, test } from '@playwright/test';

test('编辑草稿，保留换行和输入法确认，空白内容不能发送', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('textbox', { name: '任务要求' });
  await input.fill(' ');
  await expect(page.getByRole('button', { name: '发送任务' })).toBeDisabled();
  await input.fill('整理笔记');
  await input.press('End');
  await input.press('Shift+Enter');
  await input.press('A');
  await expect(input).toHaveValue('整理笔记\nA');
  await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true });
  await expect(input).toBeVisible();
  await input.press('Enter');
  await expect(page.getByText('整理笔记\nA', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /合并到原笔记/ })).toBeFocused();
});

test('展开步骤，核对原文，合并后编辑保存', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '发送任务' }).click();
  const steps = page.getByRole('button', { name: '已读完 3 份资料' });
  await expect(steps).toHaveAttribute('aria-expanded', 'false');
  await steps.click();
  await expect(page.getByText('访谈逐字稿.txt', { exact: true })).toBeVisible();
  const original = page.getByRole('button', { name: /查看原文/ });
  await original.click();
  const reader = page.getByRole('complementary', { name: '原文' });
  await expect(reader).toBeVisible();
  await expect(original).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(original).toBeFocused();
  await page.getByRole('button', { name: /合并到原笔记/ }).click();
  const result = page.getByRole('button', { name: '《产品访谈笔记》' });
  await expect(result).toBeFocused();
  await result.click();
  const note = page.getByRole('complementary', { name: '整理结果' });
  await expect(note).toContainText('上次访谈发现');
  await expect(note).toContainText('我想知道这句话是谁说的');
  await note.getByRole('button', { name: '编辑笔记' }).click();
  await note.getByLabel('笔记正文').fill('核对完毕');
  await note.getByRole('button', { name: '保存', exact: true }).click();
  await page.getByRole('button', { name: '返回任务' }).click();
  await result.click();
  await expect(note).toContainText('核对完毕');
});

test('手机独立阅读后回到当前决定，另存保留独立结果', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: '发送任务' }).click();
  const first = page.getByRole('button', { name: /合并到原笔记/ });
  await expect(first).toBeFocused();
  await expect(page.locator('[data-switching]')).toHaveCSS('animation-name', 'none');
  const original = page.getByRole('button', { name: /查看原文/ });
  await original.click();
  await expect(first).toBeHidden();
  await page.getByRole('button', { name: '返回任务' }).click();
  await expect(original).toBeFocused();
  await first.press('2');
  await page.getByRole('button', { name: '《产品访谈笔记（新）》' }).click();
  const note = page.getByRole('complementary', { name: '整理结果' });
  await expect(note).not.toContainText('上次访谈发现');
  await expect(note).toContainText('逐字稿');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
});

test('接入指南由官网入口访问，设计变量对应真实主操作', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '发送任务' })).toHaveCSS(
    'background-color',
    'rgb(0, 0, 0)',
  );
  await page.getByRole('navigation').getByRole('link', { name: '接入指南' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '接入指南' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '从单个决策区开始' })).toBeVisible();
});
