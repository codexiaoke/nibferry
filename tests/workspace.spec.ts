import { expect, test, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { themeVariables } from '../packages/react/src/theme/tokens';

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.locator('html').evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

function workspaceWidth(page: Page) {
  return page.locator('[data-nf-workspace]').evaluate((el) => el.clientWidth);
}

async function openPreviewRightPane(page: Page) {
  await page.getByRole('button', { name: '展开右侧栏' }).click();
  const pane = page.getByRole('complementary', { name: '右侧' });
  await expect(pane).toBeVisible();
  await pane.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
}

test.describe('公开组件接入', () => {
  let script: string;
  test.beforeAll(async () => {
    const fromLibrary = createRequire(resolve('packages/react/package.json'));
    const { build } = fromLibrary('vite');
    const bundle = await build({
      root: resolve('packages/react'), configFile: false, logLevel: 'silent',
      define: { 'process.env.NODE_ENV': '"production"' },
      build: { write: false, lib: { entry: resolve('packages/react/tests/consumer.tsx'), formats: ['iife'], name: 'Consumer' } },
    });
    script = bundle[0].output[0].code;
  });

  async function mount(page: Page, fixture: string) {
    await page.setContent('<body data-fixture="' + fixture + '"><div id="root"></div></body>');
    await page.addStyleTag({ path: resolve('packages/react/dist/styles.css') });
    await page.addScriptTag({ content: script });
  }

  test('同组追加时保留第一项的输入与 DOM', async ({ page }) => {
    await mount(page, 'stream');
    const input = page.getByRole('textbox', { name: 'a' });
    await input.fill('已填写');
    const original = await input.elementHandle();
    await page.getByRole('button', { name: '追加' }).click();
    await expect(page.getByRole('textbox', { name: 'b' })).toBeVisible();
    await expect(input).toHaveValue('已填写');
    expect(await input.evaluate((el, before) => el === before, original)).toBe(true);
  });

  test('弹框内可操作模型与权限列表并继承局部颜色', async ({ page }) => {
    await mount(page, 'dialog');
    const dialog = page.locator('dialog');
    await dialog.getByRole('button', { name: '模型，A' }).click();
    const option = dialog.getByRole('option', { name: 'B' });
    expect(await option.evaluate(el => getComputedStyle(el).getPropertyValue('--nf-canvas').trim())).toBe('#facade');
    await option.click();
    await dialog.getByRole('button', { name: '权限，B' }).press('Enter');
    await dialog.getByRole('menuitemradio', { name: 'A' }).focus();
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('button', { name: '模型，A' })).toBeVisible();
  });

  test('多个符号菜单匹配最长前缀，卸载邻居后仍可输入', async ({ page }) => {
    await mount(page, 'menus');
    await page.addStyleTag({ content: '[data-nf-composer] { position: absolute; inset: auto 30px 20px 90px; }' });
    const input = page.getByRole('textbox');
    await input.pressSequentially('@');
    await expect(page.getByRole('menuitem', { name: '引用' })).toBeVisible();
    const composer = (await page.locator('[data-nf-composer]').boundingBox())!;
    await expect.poll(async () => {
      const menu = await page.getByRole('menu').boundingBox();
      return menu && Math.max(Math.abs(menu.x - composer.x), Math.abs(menu.y + menu.height + 4 - composer.y));
    }).toBeLessThanOrEqual(1);
    await input.pressSequentially('@x');
    await expect(page.getByRole('menuitem')).toHaveText('@@ x');
    await input.press('Escape');
    await input.fill('/');
    await expect(page.getByRole('menuitem')).toHaveText('/');
    await input.press('Escape');
    await page.getByRole('button', { name: '移除命令' }).click();
    await input.fill('@');
    await expect(page.getByRole('menuitem')).toHaveText('引用');
  });

  test('只有附件时发送按钮和回车共用宿主的发送条件', async ({ page }) => {
    await mount(page, 'attachment');
    const input = page.getByRole('textbox');
    await input.press('Enter');
    await expect(page.locator('output')).toHaveText('0');
    await page.getByRole('button', { name: '切换附件' }).click();
    await page.getByRole('button', { name: '发送消息' }).click();
    await input.press('Enter');
    await expect(page.locator('output')).toHaveText('2');
    await page.getByRole('button', { name: '切换附件' }).click();
    await expect(page.getByRole('button', { name: '语音' })).toBeVisible();
  });

  test('受控查询可显示宿主返回的结果并通过键盘选择自定义行', async ({ page }) => {
    await mount(page, 'search');
    await page.getByRole('combobox').fill('123');
    await expect(page.getByRole('option', { name: '照片' }).locator('strong')).toHaveText('照片');
    await page.getByRole('combobox').press('Enter');
    await expect(page.locator('output')).toHaveText('a');
  });

  test('标题容纳独立的操作，展开项目时显示指定图标', async ({ page }) => {
    await mount(page, 'headings');
    const toggle = page.getByRole('button', { name: '项目' });
    const glyph = toggle.locator('svg').first();
    const closed = await glyph.innerHTML();
    await page.getByRole('group', { name: '来源' }).getByRole('button').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(await glyph.innerHTML()).not.toBe(closed);
    await toggle.click();
    expect(await glyph.innerHTML()).toBe(closed);
  });
});

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
  await page.goto('./docs/theme/#variables');
  const preview = page.getByRole('region', { name: '主题变量' });
  await preview.getByRole('button', { name: '主操作', exact: true }).click();
  await expect(preview.getByRole('listitem').filter({ hasText: 'color.primary' })).toContainText(
    '#000000',
  );
  await preview.getByRole('button', { name: '石墨配色' }).click();
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
  await expectNoHorizontalOverflow(page);
  await menu.click();
  await page.getByRole('link', { name: '交互预览', exact: true }).click();
  await expect(page.getByRole('main')).toHaveText('主体', { useInnerText: true });
  await expect(page.locator('#preview-left')).toBeHidden();
  await expect(page.locator('#preview-right')).toBeHidden();
  await expectNoHorizontalOverflow(page);
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
  await expect(page).toHaveURL(/\/docs\/theme\/#variables$/);
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
  await expectNoHorizontalOverflow(page);
});

test('左侧、主体和右侧填满窗口内容区，主体接收剩余宽度', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./#playground');
  await expect(page).toHaveURL(/\/playground\/$/);
  await openPreviewRightPane(page);
  const left = page.getByRole('complementary', { name: '左侧' });
  const right = page.getByRole('complementary', { name: '右侧' });
  const main = page.getByRole('main');
  await expect(main).toHaveText('主体', { useInnerText: true });
  await expect(page.locator('.site-header')).toHaveCount(0);
  const { x, y, width, height } = (await page.locator('[data-nf-workspace]').boundingBox())!;
  expect(await left.boundingBox()).toEqual({ x, y, width: 240, height });
  expect(await main.boundingBox()).toEqual({ x: x + 240, y, width: width - 560, height });
  expect(await right.boundingBox()).toEqual({ x: x + width - 320, y, width: 320, height });

  const center = page.locator('[data-nf-pane="main"]');
  await center.evaluate((el) => {
    el.style.display = 'flex';
    el.hidden = true;
  });
  await expect(center).toBeHidden();
  expect((await right.boundingBox())?.x).toBe(x + width - 320);
  await center.evaluate((el) => {
    el.hidden = false;
  });

  await right.evaluate((el) => {
    el.style.width = '360px';
  });
  await expect(main).toHaveCSS('width', width - 240 - 360 + 'px');
  await left.evaluate((el) => {
    el.remove();
  });
  await expect(main).toHaveCSS('width', width - 360 + 'px');
  await right.evaluate((el) => {
    el.remove();
  });
  await expect(main).toHaveCSS('width', width + 'px');
});

test('窗口圆点、左栏开关和标题在同一行，分栏紧接工具栏', async ({ page }) => {
  await page.goto('./playground/');
  const toolbar = page.locator('.workspace-preview-titlebar');
  const lights = toolbar.locator('.mac-window-lights');
  const toggle = toolbar.getByRole('button', { name: /左侧栏/ });
  const title = toolbar.getByRole('button', { name: '梳理 Nibferry 项目交接' });
  await expect(toggle.locator('svg')).toHaveCSS('width', '16px');
  await expect(toggle).toHaveCSS('width', '28px');
  await expect(toolbar).toHaveCSS('height', '36px');
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    const bar = (await toolbar.boundingBox())!;
    const dots = (await lights.boundingBox())!;
    const button = (await toggle.boundingBox())!;
    const label = (await title.boundingBox())!;
    const content = (await page.locator('.mac-window-content').boundingBox())!;
    const panes = (await page.locator('[data-nf-workspace]').boundingBox())!;
    expect(dots.x + dots.width).toBeLessThanOrEqual(button.x);
    expect(button.x + button.width).toBeLessThanOrEqual(label.x);
    expect(Math.abs(dots.y + dots.height / 2 - button.y - button.height / 2)).toBeLessThan(1);
    expect(Math.abs(label.y + label.height / 2 - button.y - button.height / 2)).toBeLessThan(1);
    expect(bar.y).toBe(content.y);
    expect(panes.y).toBe(bar.y + bar.height);
    expect(panes.y + panes.height).toBe(content.y + content.height);
  }
});

test('右栏标签与主标题共用一行，调宽、全屏和还原时跟随内容分界', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./playground/');
  const titlebar = page.locator('.workspace-preview-titlebar');
  const tab = titlebar.getByText('新标签页', { exact: true });
  const right = page.locator('#preview-right');
  const fullscreen = titlebar.getByRole('button', { name: /全屏/ });
  await expect(tab).toBeHidden();
  await openPreviewRightPane(page);
  await expect(tab).toBeVisible();

  async function expectAligned() {
    await expect.poll(() => titlebar.evaluate((bar) => {
      const title = bar.querySelector('header')!.getBoundingClientRect();
      const tools = bar.querySelector('[role="group"]')!.getBoundingClientRect();
      const pane = document.querySelector('#preview-right')!.getBoundingClientRect();
      return Math.max(
        Math.abs(title.right - pane.left), Math.abs(tools.left - pane.left),
        Math.abs(tools.right - pane.right), Math.abs(title.top - tools.top),
        Math.abs(bar.getBoundingClientRect().bottom - pane.top),
      );
    })).toBeLessThan(1);
  }

  await expectAligned();
  await page.getByRole('separator', { name: '调整右栏宽度' }).press('Shift+ArrowLeft');
  await expect(right).toHaveCSS('width', '352px');
  await expectAligned();
  await fullscreen.click();
  await expect(page.getByRole('main')).toBeHidden();
  await expectAligned();
  await fullscreen.click();
  await expect(right).toHaveCSS('width', '352px');
  await expectAligned();
  await titlebar.getByRole('button', { name: '收起右侧栏' }).click();
  await expect(tab).toBeHidden();
  await expect(right).toBeHidden();
});

test('快速开合右栏时窗口底部始终没有横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./playground/');
  const toggle = page.getByRole('button', { name: '展开右侧栏' });
  const overflow = await toggle.evaluate(async (button: HTMLButtonElement) => {
    const windowContent = button.closest('.mac-window-content')!;
    let peak = 0;
    for (let click = 0; click < 8; click++) {
      button.click();
      for (let frame = 0; frame < 3; frame++) {
        await new Promise(requestAnimationFrame);
        peak = Math.max(peak, windowContent.scrollWidth - windowContent.clientWidth);
      }
    }
    return peak;
  });
  expect(overflow).toBe(0);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('会话标题跟随左栏，操作始终在主体与右栏的交界处', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const header = page.getByRole('banner', { name: '主区域标题栏' });
  async function expectMainBounds() {
    await expect.poll(() => header.evaluate(el => {
      const bar = el.getBoundingClientRect();
      const main = document.querySelector('#content')!.getBoundingClientRect();
      return Math.max(Math.abs(bar.left - main.left), Math.abs(bar.right - main.right));
    })).toBeLessThan(1);
  }
  await expectMainBounds();
  await page.getByRole('separator', { name: '调整左栏宽度' }).press('Shift+ArrowRight');
  await page.getByRole('separator', { name: '调整右栏宽度' }).press('Shift+ArrowLeft');
  await expectMainBounds();
  await page.getByRole('button', { name: '收起左侧栏' }).click();
  await expect(page.locator('#preview-left')).toBeHidden();
  const chrome = (await page.locator('.workspace-preview-window-controls').boundingBox())!;
  expect((await header.boundingBox())!.x).toBe(chrome.x + chrome.width);
  await page.getByRole('button', { name: '全屏显示右侧栏' }).click();
  await expect(header).toHaveCount(0);
  await page.getByRole('button', { name: '退出全屏' }).click();
  await expect(header.getByRole('button', { name: '查看会话摘要' })).toBeVisible();
});

test('会话标题菜单支持键盘收展，窄标题栏仍可分享和切换主体摘要', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./playground/');
  const title = page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '梳理 Nibferry 项目交接' });
  const summary = page.getByRole('main').getByRole('complementary', { name: '会话摘要' });
  await page.getByRole('button', { name: '查看会话摘要' }).click();
  await expect(summary).toBeVisible();
  await expect(page.locator('#preview-right')).toBeHidden();
  await page.setViewportSize({ width: 375, height: 700 });
  await title.press('Enter');
  await expect(page.getByRole('menuitem', { name: '收起会话摘要' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(title).toBeFocused();
  await title.press('Space');
  await page.getByRole('menuitem', { name: '收起会话摘要' }).press('Enter');
  await expect(summary).toBeHidden();
  await expect(title).toBeFocused();
  await title.press('Enter');
  await page.getByRole('menuitem', { name: '复制', exact: true }).press('ArrowRight');
  await page.getByRole('menuitem', { name: '复制预览链接' }).press('Enter');
  await expect(page.getByRole('status').filter({ hasText: '已复制预览链接' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
});

for (const width of [1280, 390]) {
  test(`在 ${width}px 窗口从主体摘要打开来源，收起右栏后可继续查看摘要`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
    await page.goto('./playground/');
    if (width === 390) {
      await page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '梳理 Nibferry 项目交接' }).click();
      await page.getByRole('menuitem', { name: '查看会话摘要' }).press('Enter');
    } else {
      await page.getByRole('button', { name: '查看会话摘要' }).press('Space');
    }
    const main = page.getByRole('main');
    const card = main.getByRole('complementary', { name: '会话摘要' });
    const sources = card.getByRole('group', { name: '来源' });
    const doc = sources.getByRole('button', { name: '基础布局组件' });
    await expect(card.getByRole('group')).toHaveCount(3);
    const staticIcon = card.getByRole('group', { name: '侧边聊天' }).locator('svg');
    expect((await doc.locator('svg').boundingBox())!.x).toBe((await staticIcon.boundingBox())!.x);
    await expect(card).toHaveCSS('animation-name', 'none');
    await expect(page.getByRole('complementary', { name: '右侧' })).toBeHidden();
    await doc.press('Enter');
    const right = page.getByRole('complementary', { name: '右侧' });
    await expect(right.frameLocator('iframe').getByRole('heading', { level: 1 })).toHaveText('基础布局组件');
    if (width === 390) await expect(main).toBeHidden();
    else await expect(main).toBeVisible();
    await page.getByRole('button', { name: '收起右侧栏' }).press('Space');
    await expect(doc).toBeVisible();
  });
}

test('新增、选择与关闭工作区标签，最后一页关闭后仍可从右栏重新打开', async ({ page }) => {
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const add = page.getByRole('button', { name: '新增标签页' });
  const tabs = page.getByRole('tab');
  const active = page.getByRole('tab', { selected: true });
  const panel = page.getByRole('tabpanel');
  await panel.getByRole('button', { name: '基础布局组件' }).click();
  await expect(active).toHaveAccessibleName('基础布局组件');
  await add.press('Enter');
  await expect(tabs).toHaveCount(2);
  await expect(active).toHaveAccessibleName('新标签页');
  await expect(active).toBeFocused();
  await panel.getByRole('button', { name: '基础布局组件' }).click();
  await expect(active).toHaveAccessibleName('基础布局组件');
  await expect(tabs).toHaveCount(2);
  await active.press('End');
  await expect(active).toHaveAccessibleName('新标签页');
  await page.getByRole('button', { name: '关闭「基础布局组件」' }).click();
  await expect(active).toHaveAccessibleName('新标签页');
  await expect(tabs).toHaveCount(1);
  await active.press('Delete');
  await expect(page.locator('#preview-right')).toBeHidden();
  const reopen = page.getByRole('button', { name: '展开右侧栏' });
  await expect(reopen).toBeFocused();
  await reopen.press('Enter');
  await expect(tabs).toHaveCount(1);
  await expect(active).toHaveAccessibleName('新标签页');
});

test('指针和键盘可以重排标签，文档的阅读位置在排序和切换后保留', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  await page.getByRole('button', { name: '全屏显示右侧栏' }).click();
  const panel = page.getByRole('tabpanel');
  await panel.getByRole('button', { name: '组件与工作区设计规范' }).click();
  const first = page.getByRole('tab', { name: '组件与工作区设计规范' });
  const documentBody = page.frameLocator('iframe[title="组件与工作区设计规范"]').locator('body');
  const scroll = await documentBody.evaluate(() => {
    window.scrollTo(0, 240);
    return window.scrollY;
  });
  expect(scroll).toBeGreaterThan(0);
  await page.getByRole('button', { name: '新增标签页' }).click();
  await panel.getByRole('button', { name: '基础布局组件' }).click();
  const second = page.getByRole('tab', { name: '基础布局组件' });
  await first.dragTo(second);
  await expect(page.getByRole('tab')).toHaveText(['基础布局组件', '组件与工作区设计规范']);
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await second.press('Alt+ArrowRight');
  await expect(page.getByRole('tab')).toHaveText(['组件与工作区设计规范', '基础布局组件']);
  await expect(second).toBeFocused();
  const firstButton = page.locator('[role="tab"][title="组件与工作区设计规范"]');
  await firstButton.evaluate(el => { el.hidden = true; });
  await second.press('Home');
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await firstButton.evaluate(el => { el.hidden = false; });
  await second.press('Home');
  await expect(first).toBeFocused();
  expect(await documentBody.evaluate(() => window.scrollY)).toBe(scroll);
  await first.press('Delete');
  await expect(second).toBeFocused();
  await expect(panel).toHaveAccessibleName('基础布局组件');
});

test('窄屏标签溢出时只滚动标签栏，新增和收起按钮仍可操作', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const add = page.getByRole('button', { name: '新增标签页' });
  const closePane = page.getByRole('button', { name: '收起右侧栏' });
  for (let i = 0; i < 4; i++) await add.click();
  const list = page.getByRole('tablist');
  expect(await list.evaluate(el => el.scrollWidth > el.clientWidth && el.scrollLeft > 0)).toBe(true);
  const window = (await page.locator('.mac-window').boundingBox())!;
  for (const button of [add, closePane]) {
    const box = (await button.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(window.x + window.width);
  }
  await closePane.click();
  await openPreviewRightPane(page);
  await expect(page.getByRole('tab')).toHaveCount(5);
  await expect(page.getByRole('tab').last()).toHaveAttribute('aria-selected', 'true');
});

test('会话操作菜单按组排列，键盘可进入子菜单并回到原位', async ({ page }) => {
  await page.goto('./playground/');
  const title = page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '梳理 Nibferry 项目交接' });
  await title.press('ArrowDown');
  const menu = page.getByRole('menu', { name: '梳理 Nibferry 项目交接' });
  const rename = menu.getByRole('menuitem', { name: '重命名' });
  await expect(rename).toBeFocused();
  await expect(rename.locator('kbd')).toHaveText('⌥⌘R');
  await expect(menu.getByRole('separator')).toHaveCount(4);
  await expect(menu.getByRole('group', { name: 'Nibferry' })).toBeVisible();
  expect(await menu.getByRole('menuitem', { name: '删除' }).evaluate(
    el => getComputedStyle(el).color,
  )).not.toBe(await rename.evaluate(el => getComputedStyle(el).color));
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: '置顶聊天' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const copy = menu.getByRole('menuitem', { name: '复制', exact: true });
  await expect(copy).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: '复制预览链接' })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(copy).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(title).toBeFocused();
  await expect(menu).toBeHidden();
  await title.click();
  await expect(menu).toBeFocused();
  await rename.evaluate(el => { el.hidden = true; });
  await page.keyboard.press('Home');
  await expect(menu.getByRole('menuitem', { name: '置顶聊天' })).toBeFocused();
});

test('主菜单和子菜单之间留出 8px，鼠标可穿过空隙进入分叉选项', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  await page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '梳理 Nibferry 项目交接' }).click();
  const parent = page.getByRole('menu', { name: '梳理 Nibferry 项目交接' });
  const trigger = parent.getByRole('menuitem', { name: '分叉', exact: true });
  await trigger.hover();
  const submenu = page.getByRole('menu', { name: '分叉', exact: true });
  const option = submenu.getByRole('menuitem', { name: '在新聊天中分叉' });
  await expect(option).toBeVisible();

  const panel = (await parent.boundingBox())!;
  const child = (await submenu.boundingBox())!;
  const row = (await option.boundingBox())!;
  expect(row.y).toBeCloseTo((await trigger.boundingBox())!.y, 1);
  const outerRadius = await submenu.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  const innerRadius = await option.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  expect(row.x + innerRadius).toBeCloseTo(child.x + outerRadius, 1);
  expect(row.y + innerRadius).toBeCloseTo(child.y + outerRadius, 1);
  const edge = panel.x + panel.width;
  expect(child.x - edge).toBeCloseTo(8, 0);
  const y = row.y + row.height / 2;
  await page.mouse.move((edge + child.x) / 2, y, { steps: 8 });
  await page.mouse.move(row.x + row.width / 2, y, { steps: 8 });
  await expect(option).toBeFocused();
});

test('小窗口菜单限制高度，可悬停打开子菜单并点击外部关闭', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 400 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('./playground/');
  await page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '梳理 Nibferry 项目交接' }).click();
  const menu = page.getByRole('menu', { name: '梳理 Nibferry 项目交接' });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS('animation-name', 'none');
  expect(await menu.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await menu.getByRole('menuitem', { name: '移至项目' }).hover();
  const current = page.getByRole('menuitem', { name: 'Nibferry（当前项目）' });
  await expect(current).toBeDisabled();
  const bounds = (await current.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await page.mouse.click(8, 8);
  await expect(page.getByRole('menu')).toHaveCount(0);
});

test('macOS 窗口为普通百分比内容提供完整的可用宽高', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./playground/');
  const stage = page.locator('.playground-desktop');
  const content = page.locator('.mac-window-content');
  const app = page.locator('.workspace-preview');
  const original = (await content.boundingBox())!;
  const frame = page.locator('.mac-window');
  expect(await frame.boundingBox()).toEqual({ x: 30, y: 30, width: 1220, height: 840 });
  expect(original.height).toBe(await frame.evaluate((el) => el.clientHeight));
  expect(original.width).toBe(await frame.evaluate((el) => el.clientWidth));
  expect(await app.boundingBox()).toEqual(original);
  await stage.evaluate((el) => {
    el.style.width = '680px';
    el.style.height = '400px';
  });
  const resized = (await content.boundingBox())!;
  expect(resized.width).toBeLessThan(original.width);
  expect(resized.height).toBeLessThan(original.height);
  expect(await app.boundingBox()).toEqual(resized);
  await expect(page.getByRole('main')).toHaveCSS('width', resized.width + 'px');
  await content.evaluate((el) => {
    const child = document.createElement('div');
    child.style.cssText = 'width: 100%; height: 100%';
    el.replaceChildren(child);
  });
  expect(await content.locator(':scope > div').boundingBox()).toEqual(resized);
});

test('按工作区自身宽度切换三栏和单栏', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const layout = page.locator('[data-nf-workspace]');
  const left = page.locator('#preview-left');
  const main = page.getByRole('main', { includeHidden: true });
  const right = page.locator('#preview-right');
  await layout.evaluate((el) => {
    el.style.width = '600px';
  });
  await expect(left).toBeHidden();
  await expect(right).toBeHidden();
  await expect(main).toHaveCSS('width', '600px');
  for (const [name, pane] of [
    ['left', left],
    ['right', right],
  ] as const) {
    await layout.evaluate((el, active) => {
      el.dataset.nfWorkspace = active;
    }, name);
    await expect(pane).toHaveCSS('width', '600px');
    await expect(main).toBeHidden();
  }
  await layout.evaluate((el) => {
    el.style.width = '768px';
  });
  await expect(left).toBeVisible();
  await expect(main).toHaveCSS('width', '208px');
  await expect(right).toBeVisible();
});

test('区域展开优先于窄屏选择，收起后恢复内容、宽度和滚动', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const workspace = page.locator('[data-nf-workspace]');
  const width = await workspaceWidth(page);
  const main = page.locator('[data-nf-pane="main"]');
  const right = page.locator('[data-nf-pane="right"]');
  await workspace.evaluate((el) => {
    el.style.setProperty('--nf-layout-right-pane-width', '25%');
  });
  await main.evaluate((el) => {
    el.style.display = 'flex';
    const field = document.createElement('textarea');
    field.style.height = '1400px';
    el.append(field);
  });
  const draft = main.locator('textarea');
  await draft.fill('草稿');
  const scroll = await main.evaluate((el) => {
    el.scrollTop = 160;
    return el.scrollTop;
  });
  expect(scroll).toBeGreaterThan(0);
  await expect(right).toHaveCSS('width', width / 4 + 'px');
  await workspace.evaluate((el) => {
    el.dataset.nfExpanded = 'right';
  });
  await expect(main).toBeHidden();
  await expect(right).toHaveCSS('width', width + 'px');

  await workspace.evaluate((el) => {
    el.style.width = '600px';
  });
  await expect(right).toHaveCSS('width', '600px');
  await expect(main).toBeHidden();
  await workspace.evaluate((el) => {
    delete el.dataset.nfExpanded;
  });
  await expect(right).toBeHidden();
  await expect(draft).toHaveValue('草稿');
  await expect.poll(() => main.evaluate((el) => el.scrollTop)).toBe(scroll);
  await workspace.evaluate((el) => {
    el.style.removeProperty('width');
  });
  await expect(right).toHaveCSS('width', width / 4 + 'px');
});

test('分隔线悬停时以细线突出边界，移开后恢复', async ({ page }) => {
  await page.goto('./playground/');
  const handle = page.getByRole('separator', { name: '调整左栏宽度' });
  await expect(handle).not.toHaveAttribute('title');
  await expect(handle).toHaveCSS('width', '1px', { pseudo: 'before' });
  await expect(handle).toHaveCSS('content', 'none', { pseudo: 'after' });
  const idle = await handle.screenshot();
  await handle.hover();
  await expect(handle).toHaveCSS('cursor', 'col-resize');
  await expect(handle).toHaveCSS('width', '1px', { pseudo: 'before' });
  const hovered = await handle.screenshot();
  expect(hovered).not.toEqual(idle);
  await page.mouse.down();
  expect(await handle.screenshot()).toEqual(hovered);
  await page.mouse.up();
  await page.mouse.move(0, 0);
  expect(await handle.screenshot()).toEqual(idle);
});

test('工作区菜单紧接项目列表，快捷入口支持键盘选择会话和新建聊天', async ({ page }) => {
  await page.goto('./playground/');
  const shortcuts = page.getByRole('navigation', { name: '工作区菜单' });
  const projects = page.getByRole('navigation', { name: '项目', exact: true });
  await expect(shortcuts.locator('+ nav')).toHaveAccessibleName('项目');
  const todo = shortcuts.getByRole('button', { name: /待办/ });
  await expect(todo).toContainText('2');
  await todo.press('Enter');
  await expect(page.getByRole('menu', { name: '待办' }).getByRole('menuitem')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(todo).toBeFocused();
  await shortcuts.getByRole('button', { name: /消息通知/ }).click();
  await page.getByRole('menuitem', { name: '桌面端分析已更新' }).click();
  await expect(projects.locator('[aria-current="page"]')).toHaveText('分析 EU-OS 桌面端项目');
  await shortcuts.getByRole('button', { name: '新聊天' }).click();
  await expect(projects.getByRole('group', { name: 'EU OS', exact: true }).locator('[aria-current="page"]')).toHaveText('新聊天');
});

test('左栏搜索弹框按项目和标题匹配会话，支持方向键、Enter 和 Esc', async ({ page }) => {
  await page.goto('./playground/');
  const search = page.getByRole('button', { name: '搜索项目和会话' });
  const dialog = page.getByRole('dialog', { name: '搜索 Nibferry' });
  const field = dialog.getByRole('combobox');
  await search.press('Enter');
  await expect(page.locator('dialog:modal')).toHaveAccessibleName('搜索 Nibferry');
  await expect(field).toBeFocused();
  await expect(dialog.getByRole('option', { selected: true })).toContainText('新聊天');
  await field.fill('不存在的会话');
  await expect(dialog.getByRole('status')).toHaveText('没有找到匹配的结果');
  await field.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(search).toBeFocused();
  await search.press('Space');
  await expect(field).toHaveValue('');
  await expect(dialog.getByRole('button', { name: '全部' })).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('button', { name: '聊天', exact: true }).click();
  await field.fill('eu os');
  await expect(dialog.getByRole('option')).toHaveCount(4);
  await field.fill('eu os 桌面');
  await expect(dialog.getByRole('option')).toHaveCount(2);
  await field.press('ArrowDown');
  await expect(dialog.getByRole('option', { selected: true })).toContainText('分析 EU-OS 桌面端项目');
  await field.press('Enter');
  await expect(page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '分析 EU-OS 桌面端项目' })).toBeVisible();
  await expect(search).toBeFocused();
});

test('搜索弹框按分类打开本地文件和文档章节，并支持点击遮罩和快捷操作', async ({ page }) => {
  await page.goto('./playground/');
  const search = page.getByRole('button', { name: '搜索项目和会话' });
  const dialog = page.getByRole('dialog', { name: '搜索 Nibferry' });
  const field = dialog.getByRole('combobox');
  await search.click();
  await field.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(60, 80);
  await expect(dialog).toBeHidden();
  await expect(search).toBeFocused();
  await search.click();
  await field.fill('layout.txt');
  await dialog.getByRole('button', { name: '文件', exact: true }).click();
  await expect(field).toHaveValue('layout.txt');
  await expect(field).toBeFocused();
  await dialog.getByRole('option', { name: /layout\.txt/ }).click();
  await expect(page.getByRole('tab', { name: 'layout.txt' })).toBeFocused();
  await expect(page.locator('iframe[title="layout.txt"]')).toHaveAttribute('src', /\/markdown\/layout\.txt$/);
  await search.click();
  await dialog.getByRole('button', { name: '文本', exact: true }).click();
  await field.fill('工作区三栏');
  await dialog.getByRole('option', { name: '工作区三栏 基础布局组件' }).click();
  await expect(page.locator('iframe[title="工作区三栏"]')).toHaveAttribute('src', /\/docs\/layout\/#.+/);
  await search.click();
  await field.press('ControlOrMeta+n');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('banner', { name: '主区域标题栏' })).toContainText('新聊天');
});

test('窄屏搜索弹框留在窗口内，点选会话后回到主体', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 680 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const toggle = page.getByRole('button', { name: /左侧栏/ });
  await toggle.click();
  await page.getByRole('button', { name: '搜索项目和会话' }).click();
  const dialog = page.getByRole('dialog', { name: '搜索 Nibferry' });
  await expect(dialog).toHaveCSS('animation-name', 'none');
  const bounds = (await dialog.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(30);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(360);
  await dialog.getByRole('combobox').fill('启动桌面端');
  await dialog.getByRole('option', { name: '启动桌面端 EU OS' }).click();
  await expect(dialog).toBeHidden();
  await expect(toggle).toHaveAccessibleName('展开左侧栏');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('banner', { name: '主区域标题栏' })).toContainText('启动桌面端');
});

test('项目行的操作在悬停或键盘聚焦时淡入，标题保持原位', async ({ page }) => {
  await page.goto('./playground/');
  const group = page.getByRole('group', { name: 'Nibferry', exact: true });
  const disclosure = group.getByRole('button', { name: 'Nibferry', exact: true });
  const actions = group.locator('[data-nf-project-actions]');
  const title = disclosure.getByText('Nibferry', { exact: true });
  const offset = () => title.evaluate(el => el.getBoundingClientRect().left - el.closest("button")!.getBoundingClientRect().left);
  const initial = await offset();
  await expect(actions).toHaveCSS('opacity', '0');
  await disclosure.hover();
  await expect(actions).toHaveCSS('opacity', '1');
  expect(await offset()).toBeCloseTo(initial, 1);
  await group.getByRole('button', { name: '梳理 Nibferry 项目交接' }).hover();
  await expect(actions).toHaveCSS('opacity', '0');
  await disclosure.click();
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS('opacity', '0');
  await disclosure.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(actions).toHaveCSS('opacity', '1');
  await disclosure.press('Tab');
  await expect(group.getByRole('button', { name: '项目操作' })).toBeFocused();
});

test('悬停项目名可跨到信息卡，省略号独立打开菜单并保持折叠状态', async ({ page }) => {
  await page.goto('./playground/');
  const group = page.getByRole('group', { name: 'EU OS', exact: true });
  const disclosure = group.getByRole('button', { name: 'EU OS', exact: true });
  const card = group.getByRole('dialog', { name: 'EU OS 项目信息' });
  await disclosure.hover();
  await expect(card).toContainText('4 次聊天 · 1 个活跃聊天');
  await expect(card).toContainText('zh_genie/eu-os-desktop');
  await expect(card).toContainText('~/code/com/euos/eu-os-desktop');
  const row = (await group.locator('[data-nf-project-row]').boundingBox())!;
  const bounds = (await card.boundingBox())!;
  expect(bounds.x).toBeGreaterThan(row.x + row.width);
  expect(bounds.y).toBeCloseTo(row.y, 0);
  await card.getByRole('button', { name: '编辑项目' }).hover();
  await page.mouse.move(0, 0);
  await expect(card).toBeHidden();
  await disclosure.hover();
  await expect(card).toBeVisible();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await group.getByRole('button', { name: '项目操作' }).click();
  await expect(card).toBeHidden();
  await expect(page.getByRole('menuitem', { name: '置顶项目' })).toBeVisible();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Escape');
  await expect(group.getByRole('button', { name: '项目操作' })).toBeFocused();
  await disclosure.press('ArrowRight');
  await expect(card).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(card.getByRole('button', { name: '置顶项目' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
  await expect(disclosure).toBeFocused();
});

test('项目信息和菜单共用置顶与编辑状态，新建聊天加入对应项目', async ({ page }) => {
  await page.goto('./playground/');
  const list = page.getByRole('navigation', { name: '项目' });
  const group = list.getByRole('group', { name: 'EU OS', exact: true });
  const disclosure = group.getByRole('button', { name: 'EU OS', exact: true });
  await disclosure.hover();
  await group.getByRole('button', { name: '置顶项目' }).click();
  await expect(list.getByRole('group').first()).toHaveAccessibleName('EU OS');
  await disclosure.hover();
  await group.getByRole('button', { name: '项目操作' }).click();
  await expect(page.getByRole('menuitem', { name: '取消置顶项目' })).toBeVisible();
  await page.getByRole('menuitem', { name: '编辑项目' }).click();
  const editor = page.getByRole('dialog', { name: '编辑项目' });
  await editor.getByLabel('项目名称').fill('桌面项目');
  await editor.getByRole('button', { name: '保存' }).click();
  const renamed = list.getByRole('group', { name: '桌面项目', exact: true });
  await renamed.getByRole('button', { name: '桌面项目' }).hover();
  await renamed.getByRole('button', { name: '新建聊天' }).click();
  await expect(renamed.locator('[aria-current="page"]')).toHaveText('新聊天');
  await expect(page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '新聊天' })).toBeVisible();
  await renamed.getByRole('button', { name: '桌面项目' }).hover();
  await expect(renamed.getByRole('dialog')).toContainText('5 次聊天 · 1 个活跃聊天');
});

test('项目标题右键在指针处显示项目菜单，收起信息卡并保留展开状态', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const group = page.getByRole('group', { name: 'EU OS', exact: true });
  const title = group.getByRole('button', { name: 'EU OS', exact: true });
  await title.hover();
  const info = group.getByRole('dialog', { name: 'EU OS 项目信息' });
  await expect(info).toBeVisible();
  const bounds = (await title.boundingBox())!;
  await title.click({ button: 'right', position: { x: 22, y: 12 } });
  const menu = page.getByRole('menu', { name: '项目操作' });
  await expect(menu).toBeVisible();
  const placement = (await menu.boundingBox())!;
  expect(placement.x).toBeCloseTo(bounds.x + 22, 0);
  expect(placement.y).toBeCloseTo(bounds.y + 14, 0);
  await expect(info).toBeHidden();
  await expect(title).toHaveAttribute('aria-expanded', 'false');
  await menu.getByRole('menuitem', { name: '置顶项目' }).click();
  await title.hover();
  await group.getByRole('button', { name: '项目操作' }).click();
  await expect(page.getByRole('menuitem', { name: '取消置顶项目' })).toBeVisible();
  await page.keyboard.press('Escape');
  await title.press('Shift+F10');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(title).toBeFocused();
});

test('会话右键操作命中的条目，切换右键目标与归档都保留当前会话', async ({ page }) => {
  await page.goto('./playground/');
  const group = page.getByRole('group', { name: 'Nibferry', exact: true });
  const project = group.getByRole('button', { name: 'Nibferry', exact: true });
  const first = group.getByRole('button', { name: '梳理 Nibferry 项目交接' });
  const row = group.getByRole('group', { name: '讨论工作区布局', exact: true });
  const chat = row.getByRole('button', { name: '讨论工作区布局' });
  await project.click({ button: 'right' });
  await expect(page.getByRole('menu', { name: '项目操作' })).toBeVisible();
  await chat.click({ button: 'right', position: { x: 10, y: 15 } });
  const menu = page.getByRole('menu', { name: '会话操作' });
  await expect(menu).toBeVisible();
  await expect(page.getByRole('menu')).toHaveCount(1);
  await menu.getByRole('menuitem', { name: '置顶聊天' }).click();
  await expect(group.locator('[data-nf-conversation-item]').first()).toHaveText('讨论工作区布局');
  await expect(first).toHaveAttribute('aria-current', 'page');
  await chat.press('Shift+F10');
  await expect(menu.getByRole('menuitem', { name: '取消置顶聊天' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(chat).toBeFocused();
  await chat.click({ button: 'right' });
  await menu.getByRole('menuitem', { name: '归档聊天' }).click();
  await expect(row).toHaveCount(0);
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-current', 'page');
  await expect(project).toHaveAttribute('aria-expanded', 'true');
});

test('项目可分别折叠，选择会话同步标题与摘要，折叠后保留选中项', async ({ page }) => {
  await page.goto('./playground/');
  const list = page.getByRole('navigation', { name: '项目' });
  const current = list.locator('[aria-current="page"]');
  await expect(current).toHaveText('梳理 Nibferry 项目交接');
  const group = list.getByRole('button', { name: 'EU OS' });
  await group.press('Enter');
  await expect(list.getByRole('button', { name: 'Nibferry', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await group.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const item = list.getByRole('button', { name: '查看技能与流程图' });
  await expect(item).toBeFocused();
  await item.press('Space');
  await expect(current).toHaveText('查看技能与流程图');
  const header = page.getByRole('banner', { name: '主区域标题栏' });
  await expect(header.getByRole('button', { name: '查看技能与流程图' })).toBeVisible();
  await header.getByRole('button', { name: '查看会话摘要' }).click();
  const card = page.getByRole('complementary', { name: '会话摘要' });
  await expect(card.getByRole('group', { name: 'EU OS' })).toBeVisible();
  await expect(card.getByRole('group', { name: '侧边聊天' })).toContainText('查看技能与流程图');
  await group.click();
  await expect(item).toBeHidden();
  await group.click();
  await expect(current).toHaveText('查看技能与流程图');
});

test('项目分组按内容高度淡出，中途展开会从当前高度还原', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./playground/');
  const group = page.getByRole('group', { name: 'Nibferry', exact: true });
  const toggle = group.getByRole('button', { name: 'Nibferry', exact: true });
  const body = group.locator('[data-nf-conversation-body]');
  const fullHeight = (await body.boundingBox())!.height;
  await group.evaluate(el => {
    el.style.setProperty('--nf-motion-reveal', '800ms');
    el.style.setProperty('--nf-ease', 'linear');
  });
  await toggle.press('Space');
  const midpoint = await body.evaluate(async (el: HTMLElement) => {
    const transitions = el.getAnimations();
    await Promise.all(transitions.map(transition => transition.ready));
    for (const transition of transitions) transition.currentTime = 400;
    return { height: el.getBoundingClientRect().height, opacity: Number(getComputedStyle(el).opacity), inert: el.inert };
  });
  expect(midpoint.inert).toBe(true);
  expect(midpoint.height).toBeCloseTo(fullHeight / 2, 0);
  expect(midpoint.opacity).toBeCloseTo(0.5, 1);
  await toggle.press('Enter');
  const reversingHeight = (await body.boundingBox())!.height;
  expect(reversingHeight).toBeGreaterThan(0);
  expect(reversingHeight).toBeLessThan(fullHeight);
  await expect(body).toHaveCSS('height', fullHeight + 'px');
  await expect(body).toHaveCSS('opacity', '1');
  await toggle.press('Enter');
  await expect(body).toHaveCSS('height', '0px');
  await expect(toggle).toBeFocused();
});

test('会话行悬停显示操作并给标题留出空间，置顶只调整组内顺序', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const group = page.getByRole('group', { name: 'Nibferry', exact: true });
  const row = group.getByRole('group', { name: '讨论工作区布局', exact: true });
  const title = row.getByRole('button', { name: '讨论工作区布局' }).locator('span');
  const actions = row.locator('[data-nf-conversation-actions]');
  await expect(actions).toHaveCSS('opacity', '0');
  const idle = (await title.boundingBox())!;
  await row.hover();
  await expect(actions).toHaveCSS('opacity', '1');
  const hovered = (await title.boundingBox())!;
  const tools = (await actions.boundingBox())!;
  expect(hovered.x).toBeCloseTo(idle.x, 0);
  expect(hovered.x + hovered.width).toBeLessThanOrEqual(tools.x + 1);
  expect(idle.width).toBeGreaterThan(hovered.width);
  await row.getByRole('button', { name: '置顶聊天' }).click();
  const titles = group.locator('[data-nf-conversation-item]');
  await expect(titles.first()).toHaveText('讨论工作区布局');
  await row.hover();
  await row.getByRole('button', { name: '取消置顶聊天' }).click();
  await expect(titles.first()).toHaveText('梳理 Nibferry 项目交接');
  await expect(titles.first()).toHaveAttribute('aria-current', 'page');
});

test('键盘可独立操作会话行，归档后焦点移至相邻会话', async ({ page }) => {
  await page.goto('./playground/');
  const row = page.getByRole('group', { name: '梳理 Nibferry 项目交接', exact: true });
  await row.getByRole('button', { name: '梳理 Nibferry 项目交接' }).press('Tab');
  await expect(row.getByRole('button', { name: '置顶聊天' })).toBeFocused();
  await expect(row.locator('[data-nf-conversation-actions]')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Tab');
  await expect(row.getByRole('button', { name: '归档聊天' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(row).toHaveCount(0);
  await expect(page.getByRole('button', { name: '讨论工作区布局' })).toBeFocused();
  await expect(page.getByRole('banner', { name: '主区域标题栏' })).toContainText('梳理 Nibferry 项目交接');
});

test.describe('触屏会话列表', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 812 } });

  test('打开左栏即可点按行尾操作', async ({ page }) => {
    await page.goto('./playground/');
    await page.getByRole('button', { name: '展开左侧栏' }).tap();
    const row = page.getByRole('group', { name: '讨论工作区布局', exact: true });
    await expect(row.locator('[data-nf-conversation-actions]')).toHaveCSS('opacity', '1');
    await row.getByRole('button', { name: '置顶聊天' }).tap();
    await expect(row.getByRole('button', { name: '取消置顶聊天' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test('鼠标选择会话时，旧行与新行的底色均按操作反馈时长过渡', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./playground/');
  const list = page.getByRole('navigation', { name: '项目' });
  await list.evaluate(el => el.style.setProperty('--nf-motion-feedback', '500ms'));
  const next = list.getByRole('button', { name: '讨论工作区布局' });
  const normalWeight = await next.evaluate(el => getComputedStyle(el).fontWeight);
  await next.hover();
  await next.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  await next.click();
  const fading = await list.evaluate(el =>
    Array.from(el.querySelectorAll('[data-nf-conversation-item]')).flatMap(item =>
      item.getAnimations().filter(a => a instanceof CSSTransition && a.transitionProperty === 'background-color')
        .map(a => ({ label: item.textContent, duration: a.effect!.getTiming().duration })),
    ),
  );
  expect(fading).toEqual([
    { label: '梳理 Nibferry 项目交接', duration: 500 },
    { label: '讨论工作区布局', duration: 500 },
  ]);
  await expect(next).toHaveCSS('font-weight', normalWeight);
});

test('减少动态效果或关闭主题动效时，项目显隐和会话选择即时完成', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const list = page.getByRole('navigation', { name: '项目' });
  const toggle = list.getByRole('button', { name: 'Nibferry', exact: true });
  const body = list.getByRole('group', { name: 'Nibferry' }).locator('[data-nf-conversation-body]');
  for (const preference of ['reduce', 'no-preference'] as const) {
    if (preference === 'no-preference') {
      await list.evaluate(el => el.style.setProperty('--nf-motion-scale', '0'));
      await page.emulateMedia({ reducedMotion: preference });
    }
    await toggle.press('Enter');
    expect(await body.evaluate(el => el.getBoundingClientRect().height)).toBe(0);
    await toggle.press('Enter');
    expect(await body.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(0);
    const item = list.getByRole('button', { name: preference === 'reduce' ? '讨论工作区布局' : '设计摘要面板' });
    await item.press('Space');
    await expect(item).toHaveAttribute('aria-current', 'page');
    expect(await list.evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  }
});

test('窄屏选择会话回到主体，再打开项目列表仍可找到当前会话', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./playground/');
  const toggle = page.getByRole('button', { name: /左侧栏/ });
  await toggle.click();
  const list = page.getByRole('navigation', { name: '项目' });
  await list.getByRole('button', { name: '讨论工作区布局' }).press('Enter');
  await expect(list).toBeHidden();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name: '讨论工作区布局' })).toBeVisible();
  await toggle.press('Enter');
  await expect(list.locator('[aria-current="page"]')).toHaveText('讨论工作区布局');
  await expectNoHorizontalOverflow(page);
});

test('右侧全屏时从左栏切换会话，回到并排布局并保留活动标签', async ({ page }) => {
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  await page.getByRole('button', { name: '全屏显示右侧栏' }).click();
  await expect(page.getByRole('main')).toBeHidden();
  await page.getByRole('navigation', { name: '项目' }).getByRole('button', { name: '讨论工作区布局' }).click();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('tab', { selected: true })).toHaveText('新标签页');
  await expect(page.getByRole('button', { name: '全屏显示右侧栏' })).toBeVisible();
});

test('接入方隐藏导航控件后，整项隐藏且 Tab 跳过这些控件', async ({ page }) => {
  const fromDocs = createRequire(resolve('apps/docs/package.json'));
  const { createElement: h } = fromDocs('react');
  const { renderToStaticMarkup } = fromDocs('react-dom/server');
  const { PaneButton, LeftPaneToggle, NavigationRailItem, SidebarMenu, ConversationItem, WorkspaceTabList, WorkspaceTab, CountBadge } =
    await import('../packages/react/dist/index.js');
  const icon = fromDocs('@hugeicons/core-free-icons/Search01Icon');
  await page.setContent(renderToStaticMarkup(h('main', null,
    h('button', null, '起点'),
    h(PaneButton, { hidden: true, icon, text: '搜索' }),
    h(LeftPaneToggle, { hidden: true, expanded: true, paneId: 'left' }),
    h(NavigationRailItem, { hidden: true, icon, label: '会话' }),
    h(SidebarMenu, { label: '菜单' }, h(PaneButton, { hidden: true, icon, text: '新聊天' })),
    h(ConversationItem, { hidden: true }, '历史会话'),
    h(ConversationItem, { hidden: true, actions: h('button', null, '归档') }, '当前会话'),
    h(WorkspaceTabList, null, h(WorkspaceTab, { hidden: true, id: 'tab', panelId: 'page', label: '文档', selected: true, onClose() {} })),
    h(WorkspaceTabList, { hidden: true }, h('button', null, '新增标签页')),
    h(CountBadge, { hidden: true, count: 2 }),
    h('button', null, '终点'),
  )));
  await page.addStyleTag({ path: resolve('packages/react/dist/styles.css') });
  for (const element of await page.locator('[hidden]').all()) await expect(element).toBeHidden();
  await expect(page.getByRole('button')).toHaveCount(2);
  await page.getByRole('button', { name: '起点' }).press('Tab');
  await expect(page.getByRole('button', { name: '终点' })).toBeFocused();
});

test('图标栏与项目列表并排，收起后仍能切换会话并恢复列表', async ({ page }) => {
  await page.goto('./playground/');
  const rail = page.getByRole('navigation', { name: '主导航' });
  const home = rail.getByRole('button', { name: '首页' });
  const list = page.getByRole('complementary', { name: '左侧' });
  const original = (await rail.boundingBox())!;
  expect(original.width).toBe(52);
  await expect.poll(async () => (await list.boundingBox())?.x).toBe(original.x + original.width);
  await expect(home).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: '收起左侧栏' }).click();
  await expect(list).toBeHidden();
  expect(await rail.boundingBox()).toEqual(original);
  await rail.getByRole('button', { name: '项目会话' }).press('Enter');
  await page.getByRole('menuitem', { name: '讨论工作区布局' }).press('Enter');
  await expect(page.getByRole('banner').getByRole('button', { name: '讨论工作区布局' })).toBeVisible();
  await expect(list).toBeHidden();
  await home.press('Enter');
  await expect(list.locator('[aria-current="page"]')).toHaveText('讨论工作区布局');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(rail).toBeHidden();
  await expect(page.getByRole('main')).toHaveCSS('width', await workspaceWidth(page) + 'px');
});

test('图标入口打开对应文档并跟随当前标签，摘要可在收起左栏后使用', async ({ page }) => {
  await page.goto('./playground/');
  const rail = page.getByRole('navigation', { name: '主导航' });
  const guide = rail.getByRole('button', { name: '布局组件指南' });
  await page.getByRole('button', { name: '收起左侧栏' }).click();
  await guide.click();
  await expect(page.getByRole('tab', { selected: true })).toHaveText('基础布局组件');
  await expect(guide).toHaveAttribute('aria-current', 'page');
  await rail.getByRole('button', { name: '更多导航' }).click();
  await page.getByRole('menuitem', { name: '接入项目' }).click();
  await expect(page.getByRole('tab', { selected: true })).toHaveText('接入项目');
  await expect(guide).not.toHaveAttribute('aria-current', 'page');
  await page.getByRole('tab', { name: '基础布局组件' }).click();
  await expect(guide).toHaveAttribute('aria-current', 'page');
  const summary = rail.getByRole('button', { name: '会话摘要' });
  await summary.click();
  await expect(page.locator('#preview-summary')).toBeVisible();
  await summary.press('Space');
  await expect(page.locator('#preview-summary')).toBeHidden();
  await expect(page.locator('#preview-left')).toBeHidden();
});

test('收起左栏释放空间，键盘展开恢复原栏宽和内容', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const toggle = page.getByRole('button', { name: /左侧栏/ });
  const width = await workspaceWidth(page);
  const left = page.locator('#preview-left');
  const handle = page.getByRole('separator', { name: '调整左栏宽度' });
  await handle.press('Shift+ArrowRight');
  await expect(left).toHaveCSS('width', '272px');
  await left.evaluate((el) => el.append(document.createElement('input')));
  const input = left.locator('input');
  await input.fill('保留草稿');
  const icon = toggle.locator('svg');
  const expandedGlyph = await icon.innerHTML();
  await toggle.click();
  await expect(toggle).toHaveAccessibleName('展开左侧栏');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(await icon.innerHTML()).not.toBe(expandedGlyph);
  await expect(toggle).toHaveAttribute('aria-controls', 'preview-left');
  await expect(handle).toBeHidden();
  await expect(left).toBeHidden();
  await expect(page.getByRole('main')).toHaveCSS('width', width - 320 + 'px');
  await expect(page.getByRole('complementary', { name: '右侧' })).toHaveCSS('width', '320px');
  await toggle.press('Space');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAccessibleName('收起左侧栏');
  expect(await icon.innerHTML()).toBe(expandedGlyph);
  await expect(handle).toBeVisible();
  await expect(page.getByRole('main')).toHaveCSS('width', width - 272 - 320 + 'px');
  await expect(input).toHaveValue('保留草稿');
  await expect(left).toHaveCSS('width', '272px');
});

test('左栏收起和展开时随位移渐隐渐显，中途可反向展开', async ({ page }) => {
  await page.goto('./playground/');
  const left = page.locator('#preview-left');
  const rail = page.getByRole('navigation', { name: '主导航' });
  const toggle = page.getByRole('button', { name: /左侧栏/ });
  await expect(left).toHaveCSS('opacity', '1');
  await left.evaluate(el => {
    el.style.setProperty('--nf-motion-reveal', '800ms');
    el.style.setProperty('--nf-ease', 'linear');
  });

  async function expectMidpoint() {
    const frame = await left.evaluate(async el => {
      const transitions = el.getAnimations();
      await Promise.all(transitions.map(t => t.ready));
      for (const t of transitions) t.currentTime = 400;
      const style = getComputedStyle(el);
      return { opacity: Number(style.opacity), offset: parseFloat(style.marginInlineStart), width: el.clientWidth };
    });
    expect(frame.opacity).toBeCloseTo(0.5, 1);
    expect(frame.offset).toBeCloseTo(-frame.width / 2, 0);
    await expect(rail).toHaveCSS('opacity', '1');
  }

  await toggle.press('Enter');
  await expectMidpoint();
  await toggle.press('Space');
  const reversing = await left.evaluate(el => Number(getComputedStyle(el).opacity));
  expect(reversing).toBeGreaterThan(0);
  expect(reversing).toBeLessThan(1);
  await expect(left).toHaveCSS('opacity', '1');
  await toggle.press('Enter');
  await expect(left).toBeHidden();
  await toggle.press('Enter');
  await expectMidpoint();
  await expect(left).toHaveCSS('opacity', '1');
});

test('窄屏可从主体进入左栏并返回，桌面展开状态独立保留', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const toggle = page.getByRole('button', { name: /左侧栏/ });
  const desktopWidth = await workspaceWidth(page);
  await toggle.click();
  await expect(page.locator('#preview-left')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  const compactWidth = await workspaceWidth(page);
  await expect(page.getByRole('main')).toHaveCSS('width', compactWidth + 'px');
  await toggle.click();
  await expect(page.getByRole('complementary', { name: '左侧' })).toHaveCSS(
    'width',
    compactWidth + 'px',
  );
  await expect(page.getByRole('main')).toBeHidden();
  await expect(page.getByRole('separator')).toHaveCount(0);
  await toggle.press('Enter');
  await expect(page.getByRole('main')).toBeVisible();
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(page.getByRole('main')).toHaveCSS('width', desktopWidth - 320 + 'px');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('右栏全屏保留左侧导航，还原和重新展开均保留栏宽与内容', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./playground/');
  const main = page.getByRole('main');
  const right = page.locator('#preview-right');
  const left = page.locator('#preview-left');
  const rightToggle = page.getByRole('button', { name: /^(展开|收起)右侧栏$/ });
  const fullToggle = page.getByRole('button', { name: /全屏/ });
  const available = await workspaceWidth(page);
  await expect(right).toBeHidden();
  await expect(rightToggle).toHaveAttribute('aria-controls', 'preview-right');
  await expect(rightToggle).toHaveAttribute('aria-expanded', 'false');
  const closedIcon = await rightToggle.locator('svg').innerHTML();
  await openPreviewRightPane(page);
  expect(await rightToggle.locator('svg').innerHTML()).not.toEqual(closedIcon);
  await page.getByRole('separator', { name: '调整右栏宽度' }).press('Shift+ArrowLeft');
  await expect(right).toHaveCSS('width', '352px');
  await right.evaluate((el) => {
    const field = document.createElement('textarea');
    field.style.height = '1800px';
    el.append(field);
  });
  const draft = right.locator('textarea');
  await draft.fill('当前内容');
  const position = await right.evaluate((el) => (el.scrollTop = 140));
  const splitIcon = await fullToggle.locator('svg').innerHTML();
  await fullToggle.press('Enter');
  await expect(fullToggle).toHaveAccessibleName('退出全屏');
  await expect(fullToggle).toBeFocused();
  expect(await fullToggle.locator('svg').innerHTML()).not.toEqual(splitIcon);
  await expect(main).toBeHidden();
  await expect(page.getByRole('separator')).toHaveCount(0);
  await expect(left).toHaveCSS('width', '240px');
  await expect(right).toHaveCSS('width', available - 240 + 'px');
  await fullToggle.press('Space');
  await expect(fullToggle).toBeFocused();
  await expect(right).toHaveCSS('width', '352px');
  await expect(main).toHaveCSS('width', available - 240 - 352 + 'px');
  await rightToggle.press('Enter');
  await expect(right).toBeHidden();
  await expect(rightToggle).toBeFocused();
  await rightToggle.press('Space');
  await expect(draft).toHaveValue('当前内容');
  await expect(right).toHaveCSS('width', '352px');
  await expect.poll(() => right.evaluate((el) => el.scrollTop)).toBe(position);
  await page.getByRole('button', { name: '收起左侧栏' }).click();
  await expect(left).toBeHidden();
  await fullToggle.click();
  await expect(right).toHaveCSS('width', available + 'px');
  await fullToggle.click();
  await expect(left).toBeHidden();
  await expect(right).toHaveCSS('width', '352px');
});

test('窄屏独立打开右栏并返回主体，恢复桌面时回到之前的模式', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  await page.getByRole('button', { name: '全屏显示右侧栏' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const right = page.locator('#preview-right');
  await expect(page.getByRole('main')).toBeVisible();
  await page.getByRole('button', { name: '展开右侧栏' }).press('Enter');
  await expect(right).toHaveCSS('width', (await workspaceWidth(page)) + 'px');
  await expect(page.getByRole('main')).toBeHidden();
  await expect(page.getByRole('button', { name: /全屏/ })).toHaveCount(0);
  await page.getByRole('button', { name: '收起右侧栏' }).press('Space');
  await expect(page.getByRole('main')).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('button', { name: '退出全屏' })).toBeVisible();
  await expect(right).toHaveCSS('width', (await workspaceWidth(page)) - 240 + 'px');
});

test('全屏过渡用主题时长移动分栏边界，中途可反向还原', async ({ page }) => {
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const layout = page.locator('[data-nf-workspace]');
  const toggle = page.getByRole('button', { name: /全屏/ });
  const right = page.locator('#preview-right');
  const left = page.locator('#preview-left');
  await page.getByRole('separator', { name: '调整右栏宽度' }).press('Shift+ArrowLeft');
  const split = (await right.boundingBox())!;
  const nav = (await left.boundingBox())!;
  const fullWidth = split.x + split.width - nav.x - nav.width;
  await layout.evaluate((el) => {
    el.style.setProperty('--nf-motion-reveal', '800ms');
    el.style.setProperty('--nf-ease', 'linear');
  });

  async function checkMidpoint() {
    const frame = await layout.evaluate(async (el) => {
      const pane = el.querySelector<HTMLElement>('#preview-right')!;
      const main = el.querySelector<HTMLElement>('#content')!;
      const animations = el.getAnimations({ subtree: true });
      const growth = pane.getAnimations().find(
        (a) => a instanceof CSSTransition && a.transitionProperty === 'flex-grow',
      )!;
      const duration = Number(growth.effect!.getTiming().duration);
      await Promise.all(animations.map((a) => a.ready));
      for (const animation of animations) animation.currentTime = duration / 2;
      return {
        width: pane.getBoundingClientRect().width,
        opacity: Number(getComputedStyle(main).opacity),
        duration,
      };
    });
    expect(frame.duration).toBe(800);
    expect(frame.width).toBeGreaterThan(split.width);
    expect(frame.width).toBeLessThan(fullWidth);
    expect(frame.opacity).toBeCloseTo(0.5, 1);
    expect(await left.boundingBox()).toEqual(nav);
  }

  await toggle.press('Enter');
  await checkMidpoint();
  await toggle.press('Space');
  await expect(right).toHaveCSS('width', split.width + 'px');
  await toggle.press('Enter');
  await expect(right).toHaveCSS('width', fullWidth + 'px');
  await toggle.press('Enter');
  await checkMidpoint();
  await expect(right).toHaveCSS('width', split.width + 'px');
  await expect(toggle).toBeFocused();
});

test('系统减少动效或主题关闭动效时右栏即时全屏和还原', async ({ page }) => {
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const layout = page.locator('[data-nf-workspace]');
  const toggle = page.getByRole('button', { name: /全屏/ });
  const right = page.locator('#preview-right');
  const split = (await right.boundingBox())!;
  const leftWidth = (await page.locator('#preview-left').boundingBox())!.width;
  const fullWidth = (await workspaceWidth(page)) - leftWidth;
  for (const preference of ['reduce', 'no-preference'] as const) {
    await page.emulateMedia({ reducedMotion: preference });
    if (preference === 'no-preference') {
      await layout.evaluate((el, variables) => {
        for (const [key, value] of Object.entries(variables)) el.style.setProperty(key, value);
      }, themeVariables({ motion: false }));
    }
    for (const width of [fullWidth, split.width]) {
      await toggle.press('Enter');
      expect((await right.boundingBox())!.width).toBe(width);
      expect(await layout.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    }
  }
});

test('工具栏按下时图标缩小，点击区域保持原尺寸', async ({ page }) => {
  await page.goto('./playground/');
  const button = page.getByRole('button', { name: '展开右侧栏' });
  const icon = button.locator('svg');
  const bounds = await button.boundingBox();
  await button.hover();
  await page.mouse.down();
  await expect(icon).toHaveCSS('scale', '0.92');
  expect(await button.boundingBox()).toEqual(bounds);
  await page.mouse.up();
  await expect(page.getByRole('button', { name: '收起右侧栏' }).locator('svg')).toHaveCSS('scale', 'none');
});

test('拖动左右分隔线时，另一侧保持原宽，主体接收差额', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const left = page.getByRole('complementary', { name: '左侧' });
  const right = page.getByRole('complementary', { name: '右侧' });
  for (const [label, movement] of [
    ['调整左栏宽度', 54],
    ['调整右栏宽度', -62],
  ] as const) {
    const handle = page.getByRole('separator', { name: label });
    const rect = (await handle.boundingBox())!;
    const x = rect.x + rect.width / 2,
      y = rect.y + rect.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + movement, y, { steps: 6 });
    await page.mouse.up();
    if (movement > 0) {
      await expect(left).toHaveCSS('width', '294px');
      await expect(right).toHaveCSS('width', '320px');
    }
  }
  await expect(left).toHaveCSS('width', '294px');
  await expect(right).toHaveCSS('width', '382px');
  const width = await workspaceWidth(page);
  await expect(page.getByRole('main')).toHaveCSS('width', width - 294 - 382 + 'px');
});

test('键盘调宽遵循两端边界，窄屏和单栏展开时让出焦点', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const left = page.getByRole('separator', { name: '调整左栏宽度' });
  const right = page.getByRole('separator', { name: '调整右栏宽度' });
  await expect(left).toHaveAttribute('aria-valuenow', '240');
  await page.getByRole('button', { name: '收起左侧栏' }).focus();
  for (const name of ['梳理 Nibferry 项目交接', '复制预览链接', '查看会话摘要']) {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('banner', { name: '主区域标题栏' }).getByRole('button', { name, exact: true })).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tab', { selected: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '新增标签页' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '全屏显示右侧栏' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '收起右侧栏' })).toBeFocused();
  await page.keyboard.press('Tab');
  const railButtons = page.getByRole('navigation', { name: '主导航' }).getByRole('button');
  await expect(railButtons.first()).toBeFocused();
  await railButtons.last().press('Tab');
  await expect(page.getByRole('button', { name: '搜索项目和会话' })).toBeFocused();
  await page.getByRole('navigation', { name: '工作区菜单' }).getByRole('button', { name: /消息通知/ }).press('Tab');
  const projectButtons = page.getByRole('navigation', { name: '项目' }).getByRole('button');
  await expect(projectButtons.first()).toBeFocused();
  await projectButtons.last().press('Tab');
  await expect(left).toBeFocused();
  await expect(left).toHaveCSS('width', '2px', { pseudo: 'before' });
  await left.press('ArrowRight');
  await expect(left).toHaveAttribute('aria-valuenow', '248');
  await left.press('Tab');
  await expect(right).toBeFocused();
  await right.press('Shift+ArrowLeft');
  await expect(right).toHaveAttribute('aria-valuenow', '352');
  await right.press('Home');
  await expect(right).toHaveAttribute('aria-valuenow', '128');
  await right.press('End');
  const maxRight = String((await workspaceWidth(page)) - 248 - 192);
  await expect(right).toHaveAttribute('aria-valuenow', maxRight);
  await expect(page.getByRole('main')).toHaveCSS('width', '192px');
  const workspace = page.locator('[data-nf-workspace]');
  await workspace.evaluate((el) => {
    el.dataset.nfExpanded = 'right';
  });
  await expect(page.getByRole('separator')).toHaveCount(0);
  await workspace.evaluate((el) => {
    delete el.dataset.nfExpanded;
  });
  await expect(right).toHaveAttribute('aria-valuenow', maxRight);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('separator')).toHaveCount(0);
  await expect(page.getByRole('main')).toHaveCSS('width', (await workspaceWidth(page)) + 'px');
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(right).toHaveAttribute('aria-valuenow', maxRight);
});

test('窗口缩窄压缩两侧后，继续调宽从可见边界开始', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const left = page.getByRole('separator', { name: '调整左栏宽度' });
  const right = page.getByRole('separator', { name: '调整右栏宽度' });
  await left.press('End');
  await expect(left).toHaveAttribute(
    'aria-valuenow',
    String((await workspaceWidth(page)) - 320 - 192),
  );
  await page.setViewportSize({ width: 850, height: 800 });
  const available = (await workspaceWidth(page)) - 192;
  await expect
    .poll(async () => Number(await left.getAttribute('aria-valuenow')))
    .toBeLessThan(available);
  const start = Number(await left.getAttribute('aria-valuenow'));
  const otherWidth = await right.getAttribute('aria-valuenow');
  await left.press('ArrowLeft');
  await expect(left).toHaveAttribute('aria-valuenow', String(start - 8));
  await expect(right).toHaveAttribute('aria-valuenow', otherWidth!);
});

test('主题导出的栏宽可以单独覆盖并在变量文档中查到', async ({ page }) => {
  expect(themeVariables({ layout: { leftPaneWidth: 224 } })).toEqual({
    '--nf-layout-left-pane-width': '224px',
  });
  expect(() => themeVariables({ layout: { rightPaneWidth: -1 } })).toThrow(RangeError);
  await page.goto('./docs/theme/#variables');
  const explorer = page.getByRole('region', { name: '主题变量' });
  await explorer.getByRole('button', { name: '布局', exact: true }).click();
  await expect(
    explorer.getByRole('listitem').filter({ hasText: 'layout.leftPaneWidth' }),
  ).toContainText('240px');
  await expect(
    explorer.getByRole('listitem').filter({ hasText: 'layout.rightPaneWidth' }),
  ).toContainText('320px');
});

test('动效预览使用选择的时长并尊重系统减少动效偏好', async ({ page }) => {
  await page.goto('./docs/motion/');
  const section = page.getByRole('region', { name: '动效预览' });
  await page
    .getByRole('group', { name: '选择动效' })
    .getByRole('button', { name: '内容展开' })
    .click();
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

test('布局间距可以单独覆盖，并拒绝无效长度', () => {
  expect(themeVariables({ space: { md: 12 } })).toEqual({ '--nf-space-md': '12px' });
  expect(() => themeVariables({ space: { sm: -1 } })).toThrow(RangeError);
});

test('设计文档保留色板，布局文档连接桌面实例', async ({ page }) => {
  await page.goto('./docs/colors/');
  const color = page.locator('.pg-swatch').filter({ hasText: '强调色' });
  await expect(color).toContainText('#1677FF');
  await page.getByRole('button', { name: '石墨配色' }).click();
  await expect(color).toContainText('#74AAFF');
  await page.goto('./docs/layout/');
  await page.locator('.docs-prose').getByRole('link', { name: '交互预览' }).click();
  await expect(page.getByRole('main')).toHaveText('主体', { useInnerText: true });
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
