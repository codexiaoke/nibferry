import { expect, test } from '@playwright/test';
import { themeVariables } from '../packages/react/src/theme/config';

test('官网首页展示工作区，可切换代码示例并进入指南', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('界面组件库');
  await page.getByRole('button', { name: 'CSS', exact: true }).click();
  await expect(page.getByLabel('CSS 示例')).toContainText('--nf-canvas');
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '文档' })
    .click();
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.getByRole('heading', { name: '文档概览', level: 1 })).toBeVisible();
});

test('搜索、分类和切换配色使用主题实际导出的值', async ({ page }) => {
  await page.goto('./');
  const preview = page.getByRole('region', { name: '设计 Token 交互预览' });
  await preview.getByRole('button', { name: '搜索变量', exact: true }).click();
  await preview.getByRole('button', { name: '主操作', exact: true }).click();
  await expect(preview.getByRole('listitem').filter({ hasText: 'color.primary' })).toContainText(
    '#000000',
  );
  await preview.getByRole('button', { name: '切换为深色预览' }).click();
  await expect(preview.getByRole('listitem').filter({ hasText: 'color.primary' })).toContainText(
    '#F2F2F2',
  );
  await preview.getByRole('button', { name: '动效时长' }).click();
  await expect(preview.getByRole('listitem')).toHaveCount(3);
  await preview.getByRole('textbox').fill('does-not-exist');
  await expect(preview.getByText('没有匹配的变量。')).toBeVisible();
});

test('手机导航可关闭，首屏无横向滚动', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./');
  const menu = page.getByRole('button', { name: '打开导航' });
  await menu.click();
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await page.getByLabel('选择变量分类').click();
  await page.getByRole('button', { name: '缓动曲线', exact: true }).first().click();
  await expect(page.getByRole('listitem')).toContainText('cubic-bezier(');
});

test('切换仓库命令后复制对应内容', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  const hero = page.locator('.hero');
  await hero.getByLabel('选择仓库命令').click();
  await hero.getByRole('button', { name: '启动官网' }).click();
  await hero.getByRole('button', { name: '复制命令 pnpm dev' }).click();
  await expect(hero.getByRole('status')).toHaveText('已复制命令');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('pnpm dev');
});

test('从旧指南打开全局搜索，可以用键盘跳到另一篇文档的章节', async ({ page }) => {
  await page.goto('./guide');
  await expect(page).toHaveURL(/\/docs\/theme\/?$/);
  const trigger = page.getByRole('button', { name: '搜索文档' });
  await expect(trigger.locator('kbd')).toHaveText(/K$/);
  await trigger.focus();
  await page.keyboard.press('Control+k');
  const search = page.getByRole('combobox', { name: '搜索文档' });
  await expect(search).toBeFocused();
  await search.fill('no-result-xyz');
  await expect(page.getByRole('status')).toHaveText('没有找到匹配的文档');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await search.fill('border.input');
  await page.keyboard.press('ArrowDown');
  await expect(search).toHaveAttribute('aria-activedescendant', 'search-result-1');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/docs\/surfaces\/?#/);
  expect(decodeURIComponent(new URL(page.url()).hash)).toBe('#分隔线与控件轮廓');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('在 Token 预览中打开文档搜索会保留筛选和阅读位置', async ({ page }) => {
  await page.goto('./#tokens');
  const filter = page.getByRole('textbox', { name: '按名称、用途或值搜索' });
  await filter.fill('color.ink');
  const position = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Meta+k');
  await page.getByRole('combobox').fill('git clone');
  await expect(page.getByRole('option', { name: /本地运行/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(filter).toBeFocused();
  await expect(filter).toHaveValue('color.ink');
  await expect(page).toHaveURL(/#tokens$/);
  expect(await page.evaluate(() => window.scrollY)).toBe(position);
});

test('设计规范菜单、分组目录和相邻文档链接可导航', async ({ page }) => {
  await page.goto('./');
  const menu = page.getByRole('button', { name: '设计规范' });
  await menu.click();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await menu.click();
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '颜色与文字' })
    .click();
  const sidebar = page.getByRole('navigation', { name: '文档目录' });
  await expect(sidebar.getByRole('link', { name: '颜色与文字' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await sidebar.getByText('开始使用', { exact: true }).click();
  await expect(sidebar.getByRole('link', { name: '接入项目' })).toBeHidden();
  await page.getByRole('link', { name: '下一篇 边框与层级' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('边框与层级');
  await expect(sidebar.getByRole('link', { name: '接入项目' })).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1100 });
  const anchor = page
    .getByRole('navigation', { name: '本页内容' })
    .getByRole('link', { name: '键盘焦点环' });
  await anchor.click();
  await expect(anchor).toHaveAttribute('aria-current', 'location');
  await page.getByRole('link', { name: '上一篇 颜色与文字' }).click();
  await expect(page).toHaveURL(/\/docs\/colors\/?$/);
});

test('手机目录可切换、跟随章节并复制当前页 Markdown', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('./docs');
  await page.getByRole('button', { name: '文档目录' }).click();
  await page
    .getByRole('navigation', { name: '文档目录' })
    .getByRole('link', { name: '动效与过渡' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('动效与过渡');
  await expect(page.getByRole('navigation', { name: '文档目录' })).toBeHidden();
  const outline = page.getByRole('button', { name: '本页内容' });
  await outline.click();
  const nav = page.getByRole('navigation', { name: '本页内容' });
  await nav.getByRole('link', { name: '减少动态效果' }).click();
  expect(decodeURIComponent(new URL(page.url()).hash)).toBe('#减少动态效果');
  await expect(nav).toBeHidden();
  await outline.click();
  await page.getByRole('button', { name: '复制本页' }).click();
  await expect(page.getByRole('button', { name: '已复制 Markdown' })).toBeVisible();
  const raw = await page.request.get('./markdown/motion.txt');
  expect(raw.ok()).toBe(true);
  expect(await raw.text()).toBe(await page.evaluate(() => navigator.clipboard.readText()));
  await expect(page.getByRole('link', { name: '查看 Markdown' })).toHaveAttribute(
    'href',
    /\/markdown\/motion\.txt$/,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
});

test('交互预览默认可以播放，侧栏可收起，支持全屏', async ({ page }) => {
  await page.goto('./#playground');
  const preview = page.getByRole('region', { name: '设计 Token 交互预览' });
  await expect(preview.getByRole('button', { name: '播放动效' })).toBeVisible();
  await preview.getByRole('button', { name: '搜索变量' }).click();
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '交互预览' })
    .click();
  await expect(preview.getByRole('button', { name: '播放动效' })).toBeVisible();
  await preview.getByRole('button', { name: '收起预览侧栏' }).click();
  await expect(preview.getByRole('button', { name: '搜索变量' })).toBeHidden();
  await preview.getByRole('button', { name: '展开预览侧栏' }).click();
  await preview.getByRole('button', { name: '全屏预览' }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('playground');
  await preview.getByRole('button', { name: '退出全屏' }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBeUndefined();
});

test('动效预览使用选择的时长并尊重系统减少动效偏好', async ({ page }) => {
  await page.goto('./');
  const section = page.getByRole('region', { name: '动效预览' });
  await section.getByRole('button', { name: /内容展开/ }).click();
  await section.getByRole('button', { name: '播放动效' }).click();
  await expect(section.locator('.motion-track i')).toHaveCSS('animation-duration', '0.25s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(section.locator('.motion-track i')).toHaveCSS('animation-name', 'none');
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

test('代码块复制保留命令和换行', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./docs/installation');
  const block = page.locator('.doc-code').first();
  await block.getByRole('button', { name: '复制代码' }).click();
  await expect(block.getByRole('button', { name: '已复制代码' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await block.locator('code').textContent(),
  );
});

test('搜索面板、结果高度和键盘高亮在状态切换时过渡', async ({ page }) => {
  await page.goto('./docs/');
  const trigger = page.getByRole('button', { name: '搜索文档' });
  await expect(trigger.locator('kbd')).toHaveText(/K$/);
  const dialog = page.locator('.doc-search-dialog');
  // Record actual transitions even when the runner samples after an animation finishes.
  await dialog.evaluate((element) => {
    element.addEventListener('transitionrun', (event) => {
      const transition = event as TransitionEvent;
      const target = transition.target as HTMLElement;
      if (target === element && transition.propertyName === 'opacity') {
        element.dataset[element.hasAttribute('open') ? 'entered' : 'exited'] = 'true';
      }
      if (target.matches('.search-scroll') && transition.propertyName === 'height') {
        element.dataset.resized = 'true';
      }
      if (
        target.id === 'search-results' &&
        transition.pseudoElement === '::before' &&
        transition.propertyName === 'transform'
      ) {
        element.dataset.moved = 'true';
      }
    });
  });

  await trigger.click();
  await expect(dialog).toHaveAttribute('data-entered', 'true');
  const search = page.getByRole('combobox');
  await search.fill('border.input');
  await expect(dialog).toHaveAttribute('data-resized', 'true');
  await search.press('ArrowDown');
  await expect(dialog).toHaveAttribute('data-moved', 'true');
  const list = page.getByRole('listbox');
  await expect
    .poll(() =>
      list.evaluate((el) => {
        const option = el.querySelector<HTMLElement>('[aria-selected="true"]')!;
        const y = new DOMMatrixReadOnly(getComputedStyle(el, '::before').transform).m42;
        return Math.abs(y - option.offsetTop) < 1;
      }),
    )
    .toBe(true);
  await search.press('Escape');
  await expect(dialog).toHaveAttribute('data-exited', 'true');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
});

test('减少动态效果时搜索、筛选和目录切换即时完成', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./docs/');
  const trigger = page.getByRole('button', { name: '搜索文档' });
  await trigger.click();
  const search = page.getByRole('combobox');
  await search.fill('border.input');
  await search.press('ArrowDown');
  const dialog = page.locator('.doc-search-dialog');
  expect(await dialog.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
  await search.press('Escape');
  await expect(dialog).toHaveCSS('display', 'none');
  const menu = page.getByRole('button', { name: '设计规范' });
  await menu.click();
  await expect(page.locator('.nav-options:visible')).toHaveCSS('animation-name', 'none');
});
