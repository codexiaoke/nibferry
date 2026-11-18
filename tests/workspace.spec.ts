import { expect, test } from '@playwright/test';
import { themeVariables } from '../packages/react/src/theme/config';

test('首页打开 Token 指南并加载包导出的 CSS 变量', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.getByRole('heading', { name: '设计 Token', level: 1 })).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
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
