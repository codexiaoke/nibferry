import { expect, test } from '@playwright/test';
import { themeVariables } from '../packages/react/src/theme/config';

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

test('换配色保留草稿、动效配置和外层官网的颜色', async ({ page }) => {
  await page.goto('/');
  const input = page.getByLabel('任务要求');
  const send = page.getByRole('button', { name: '发送任务' });
  await input.fill('保留我的草稿');
  const feedback = page.getByRole('slider', { name: '操作反馈时长' });
  await feedback.focus();
  await feedback.press('Home');
  await feedback.press('ArrowRight');
  await expect(send).toHaveCSS('transition-duration', '0.01s');
  await page.getByRole('combobox', { name: '配色' }).selectOption('graphite');
  await expect(input).toHaveValue('保留我的草稿');
  await expect(send).toHaveCSS('background-color', 'rgb(242, 242, 242)');
  await expect(send).toHaveCSS('color', 'rgb(18, 18, 18)');
  await expect(send).toHaveCSS('transition-duration', '0.01s');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.getByLabel('主操作颜色').fill('#204070');
  await expect(send).toHaveCSS('background-color', 'rgb(32, 64, 112)');
});

test('关闭动效跨配色生效，重新开启时保留设定并尊重系统偏好', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const toggle = page.getByRole('checkbox', { name: '关闭示例动效' });
  await toggle.check();
  const send = page.getByRole('button', { name: '发送任务' });
  await expect(send).toHaveCSS('transition-duration', '0s');
  await page.getByRole('combobox', { name: '配色' }).selectOption('graphite');
  await send.click();
  const surface = page.locator('[data-switching]');
  const steps = page.getByRole('button', { name: '已读完 3 份资料' });
  await expect(surface).toHaveCSS('animation-duration', '0s');
  await steps.click();
  await expect(page.locator('.steps-list')).toHaveCSS('transition-duration', '0s, 0s');
  await toggle.uncheck();
  await expect(surface).toHaveCSS('animation-duration', '0.24s');
  await expect(steps).toHaveAttribute('aria-expanded', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(surface).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.steps-list')).toHaveCSS('transition-duration', '0s');
  await expect(page.getByText('系统已启用减少动态效果。')).toBeVisible();
});

test('局部配置保留未指定项的继承，使用自定义缓动', () => {
  expect(
    themeVariables({
      colors: { accentText: '#185DB7' },
      motion: { surface: 180, easing: [0, 0, 1, 1] },
    }),
  ).toEqual({
    '--nf-accent-text': '#185DB7',
    '--nf-motion-surface': '180ms',
    '--nf-ease': 'cubic-bezier(0,0,1,1)',
  });
});

test('动效配置拒绝无效时长和贝塞尔横坐标', () => {
  expect(() => themeVariables({ motion: { surface: -1 } })).toThrow(RangeError);
  expect(() => themeVariables({ motion: { easing: [0.2, 0, 1.2, 1] } })).toThrow(RangeError);
});
