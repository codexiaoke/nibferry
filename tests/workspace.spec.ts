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

async function sendPreviewMessage(page: Page, message: string) {
  const input = page.getByRole('main').getByRole('textbox', { name: '消息', exact: true });
  await input.fill(message);
  await input.press('Enter');
}

function workspaceWidth(page: Page) {
  return page.locator('[data-nf-workspace]').evaluate((el) => el.clientWidth);
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
    await expect(dialog.getByRole('button', { name: '模型，B' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: '权限，B' })).toBeFocused();
    await page.keyboard.press('Enter');
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

test('执行过程按相邻动作分组，流中的草图在后续更新和切换会话后保留状态', async ({ page }) => {
  await page.goto('./playground/');
  const main = page.getByRole('main');
  await sendPreviewMessage(page, '给我一张布局草图');
  const turn = main.locator('[data-nf-turn]').last();
  const group = turn.getByRole('button', { name: '查看了 2 项布局设置' });
  await expect(group).toHaveAttribute('aria-expanded', 'false');
  await group.press('Enter');
  await turn.getByRole('button', { name: '查看工作区布局' }).press('Space');
  await expect(turn.getByText('左栏放项目和会话，中间保留对话，右栏用于查看资料。')).toBeVisible();
  await expect(turn.getByRole('button', { name: '查看窄屏布局' })).toBeVisible();
  const sketch = turn.getByRole('button', { name: '显示右栏' });
  await sketch.click();
  await expect(turn.getByRole('status', { name: '正在生成' })).toBeVisible();
  const summary = turn.getByRole('button', { name: /已处理/ });
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await expect(sketch).toHaveAttribute('aria-pressed', 'true');
  await summary.press('Enter');
  await expect(group).toHaveAttribute('aria-expanded', 'true');
  await expect(turn.getByRole('button', { name: '查看工作区布局' })).toHaveAttribute('aria-expanded', 'true');
  const body = turn.locator('[data-nf-assistant-message]');
  expect(await body.locator(':scope > *').evaluateAll(els => els.map(el => el.tagName)))
    .toEqual(['P', 'DIV', 'P', 'BUTTON']);
  await body.getByRole('button', { name: '打开布局文档' }).click();
  await expect(page.getByRole('tab', { name: /基础布局组件/ })).toBeVisible();
  const nav = page.getByRole('navigation', { name: '项目', exact: true });
  await nav.getByRole('button', { name: '讨论工作区布局', exact: true }).click();
  await expect(main.getByRole('heading', { name: '想先看什么？' })).toBeVisible();
  await nav.getByRole('button', { name: '梳理 Nibferry 项目交接', exact: true }).click();
  await expect(sketch).toHaveAttribute('aria-pressed', 'true');
});

test('耗时分隔线横跨摘要下方，动作组标题和条目的图标左对齐', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const process = page.locator('[data-nf-turn-process]').first();
  const summary = process.getByRole('button', { name: '已处理 4 秒' });
  await expect(summary).toHaveCSS('border-block-end-width', '1px');
  await expect(summary).toHaveCSS('border-block-end-style', 'solid');
  const bounds = (await process.boundingBox())!;
  const header = (await summary.boundingBox())!;
  expect(header.x).toBe(bounds.x);
  expect(header.width).toBe(bounds.width);
  const chevron = (await summary.locator('svg').boundingBox())!;
  expect(chevron.y + chevron.height).toBeLessThan(header.y + header.height - 1);

  await summary.press('Enter');
  const group = process.getByRole('button', { name: '查看了 2 项布局设置' });
  await group.press('Space');
  for (const button of [group, process.getByRole('button', { name: '查看工作区布局' }),
    process.getByRole('button', { name: '查看栏宽设置' })]) {
    const icon = button.locator('[data-nf-action-icon] svg');
    await expect(icon).toBeVisible();
    expect((await icon.boundingBox())!.x).toBe(bounds.x);
  }
});

test('收起的过程、动作组和工具行在悬停或键盘聚焦时显示箭头，展开后保留箭头', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const turn = page.locator('[data-nf-turn]').first();
  const summary = turn.getByRole('button', { name: '已处理 4 秒' });
  const group = turn.getByRole('button', { name: '查看了 2 项布局设置' });
  const row = turn.getByRole('button', { name: '查看工作区布局' });
  for (const button of [summary, group, row]) {
    const arrow = button.locator(':scope > svg:last-child');
    await expect(arrow).toHaveCSS('opacity', '0');
    const restingBounds = await button.boundingBox();
    await button.hover();
    await expect(arrow).toHaveCSS('opacity', '1');
    expect(await button.boundingBox()).toEqual(restingBounds);
    await button.click();
    await page.mouse.move(0, 0);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(arrow).toHaveCSS('opacity', '1');
  }
  await row.click();
  await page.mouse.move(0, 0);
  const arrow = row.locator(':scope > svg:last-child');
  await expect(arrow).toHaveCSS('opacity', '0');
  await expect(row.locator('[data-nf-action-icon]')).toHaveCSS('opacity', '1');
  await row.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(row).toBeFocused();
  await expect(arrow).toHaveCSS('opacity', '1');
  await row.press('Space');
  await expect(row).toHaveAttribute('aria-expanded', 'true');
});

test('工具结果整行展示 JSON，组内滚动只在还有内容的一侧渐隐', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  await sendPreviewMessage(page, '查一下 useState 文档');
  const turn = page.getByRole('main').locator('[data-nf-turn]').last();
  const group = turn.getByRole('button', { name: '已搜索网页、抓取网页' });
  const title = turn.getByRole('button', { name: /^已搜索 React/ });
  const list = turn.locator('[data-nf-action-scroll]');
  const result = list.getByRole('region', { name: '操作结果' });
  const answer = turn.locator('[data-nf-assistant-message]');
  await expect(answer.getByRole('link')).toHaveCount(2);
  await expect(group).toHaveAttribute('aria-expanded', 'true');
  await expect(title).toHaveAttribute('aria-expanded', 'false');
  await title.click();
  const code = await result.locator('pre').innerText();
  expect(JSON.stringify(JSON.parse(code), null, 2)).toBe(code);
  expect(JSON.parse(code).results[0].url).toBe('https://react.dev/reference/react/useState');

  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 850 });
    const card = (await result.boundingBox())!;
    expect(card.x).toBeCloseTo((await title.boundingBox())!.x, 0);
    expect(card.width).toBeCloseTo(await list.evaluate(el => el.clientWidth), 0);
    expect(await list.evaluate(el => el.clientHeight)).toBe(216);
    await expect(list).toHaveAttribute('data-below', 'true');
    await expect(list).not.toHaveAttribute('data-above');
    await expect(list).not.toHaveCSS('mask-image', 'none');
    await list.focus();
    const answerY = (await answer.boundingBox())!.y;
    // Wait for the browser's keyboard scroll to settle before reversing direction.
    await Promise.all([
      list.evaluate(el => new Promise<void>(resolve => el.addEventListener('scrollend', () => resolve(), { once: true }))),
      list.press('End'),
    ]);
    await expect(list).toHaveAttribute('data-above', 'true');
    await expect(list).not.toHaveAttribute('data-below');
    const thumb = turn.locator('[data-nf-action-area] > [data-nf-scrollbar] > [data-nf-scroll-thumb]');
    await expect(thumb).toBeVisible();
    await expect(thumb).toBeHidden();
    expect((await answer.boundingBox())!.y).toBeCloseTo(answerY, 0);
    await list.press('Home');
    await expect(list).not.toHaveAttribute('data-above');
    await expectNoHorizontalOverflow(page);
  }
  await title.press('Enter');
  await expect(list).toHaveCSS('mask-image', 'none');
  await expect(list).not.toHaveAttribute('tabindex');
  await expect(answer.getByRole('link').first()).toBeVisible();
});

test('回复来源在右栏打开，重复选择复用原标签，窄屏收起后回到对话', async ({ page }) => {
  const en = 'https://react.dev/reference/react/useState';
  const zh = 'https://zh-hans.react.dev/reference/react/useState';
  for (const url of [en, zh]) {
    await page.route(url, route => route.fulfill({ contentType: 'text/html', body: '<h1>useState</h1>' }));
  }
  await page.goto('./playground/');
  const chatUrl = page.url();
  const main = page.getByRole('main');
  await sendPreviewMessage(page, '查一下 useState 文档');
  const draft = main.getByRole('textbox', { name: '消息', exact: true });
  await draft.fill('比较两份文档');
  const english = main.getByRole('link', { name: en, exact: true });
  const chinese = main.getByRole('link', { name: zh, exact: true });
  const tabs = page.getByRole('tablist', { name: '右侧工作区标签' });
  const panel = page.getByRole('tabpanel');
  await english.click();
  await expect(tabs.getByRole('tab', { selected: true })).toHaveAccessibleName('useState – React');
  await expect(panel.locator('iframe')).toHaveAttribute('src', en);
  await expect(panel.frameLocator('iframe').getByRole('heading')).toHaveText('useState');
  await expect(main).toBeVisible();
  await chinese.press('Enter');
  await expect(tabs.getByRole('tab', { selected: true })).toHaveAccessibleName('useState – React 中文文档');
  await expect(panel.locator('iframe')).toHaveAttribute('src', zh);
  await page.getByRole('button', { name: '收起右侧栏' }).click();
  await page.setViewportSize({ width: 390, height: 850 });
  await english.click();
  await expect(tabs.getByRole('tab', { selected: true })).toHaveAccessibleName('useState – React');
  await expect(tabs.getByRole('tab')).toHaveCount(2);
  await expect(main).toBeHidden();
  await page.getByRole('button', { name: '收起右侧栏' }).click();
  await expect(draft).toHaveValue('比较两份文档');
  await expect(english).toBeVisible();
  await expect(page).toHaveURL(chatUrl);
});

test('过程收起后，分隔线与回复首段只留一份回合间距', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const turn = page.locator('[data-nf-turn]').first();
  const summary = turn.getByRole('button', { name: '已处理 4 秒' });
  const firstParagraph = turn.locator('[data-nf-assistant-message] > p').first();
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 800 });
    await summary.press('Enter');
    await expect(turn.getByRole('button', { name: '查看了 2 项布局设置' })).toBeVisible();
    await summary.press('Enter');
    await expect(turn.locator('[data-nf-turn-process] > [data-nf-activity-body]')).toHaveCSS('height', '0px');
    await expect(firstParagraph).toHaveCSS('margin-block-start', '0px');
    const header = (await summary.boundingBox())!;
    const paragraph = (await firstParagraph.boundingBox())!;
    expect(paragraph.y - (header.y + header.height)).toBeCloseTo(14, 0);
  }
});

test('点击输入或用键盘聚焦时输入框外沿保持原样', async ({ page }) => {
  await page.goto('./playground/');
  const composer = page.getByRole('main').locator('[data-nf-composer]');
  const input = composer.getByRole('textbox');
  const add = composer.getByRole('button', { name: '添加内容' });
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.getByRole('button', { name: '查看会话摘要' }).focus();
    const border = await composer.evaluate(el => getComputedStyle(el).border);
    await input.click();
    await expect(composer).toHaveCSS('border', border);
    await add.press('Shift+Tab');
    await expect(input).toBeFocused();
    await expect(composer).toHaveCSS('border', border);
    await expect(input).toHaveCSS('outline-style', 'none');
  }
});

test('输入框加号菜单可用鼠标和键盘插入内容，取消保留草稿', async ({ page }) => {
  await page.goto('./playground/');
  const composer = page.getByRole('main').locator('[data-nf-composer]');
  const input = composer.getByRole('textbox');
  const add = composer.getByRole('button', { name: '添加内容' });
  const menu = page.getByRole('menu', { name: '添加内容' });
  await input.fill('前后');
  await input.press('ArrowLeft');
  await add.click();
  await expect(menu).toHaveAttribute('data-side', 'top');
  await expect(menu.getByRole('menuitem')).toHaveText(['引用布局文档', '插入代码块']);
  await menu.getByRole('menuitem', { name: '引用布局文档' }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('前[基础布局组件](/docs/layout/)后');
  await input.fill('示例');
  await input.press('Tab');
  await expect(add).toBeFocused();
  await add.press('Enter');
  await expect(menu.getByRole('menuitem').first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: '插入代码块' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await page.keyboard.insertText('value');
  await expect(input).toHaveValue('示例\n```\nvalue\n```');
  await add.press('Space');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(add).toBeFocused();
  await expect(input).toHaveValue('示例\n```\nvalue\n```');
});

test('操作菜单在整个输入框上方齐边展开，并跟随输入框尺寸', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const composer = page.getByRole('main').locator('[data-nf-composer]');
  const menu = page.getByRole('menu', { name: '添加内容' });
  const add = composer.getByRole('button', { name: '添加内容' });
  const expectAligned = async () => {
    await expect(menu).toBeVisible();
    await expect.poll(async () => {
      const [box, popup] = await Promise.all([composer.boundingBox(), menu.boundingBox()]);
      if (!box || !popup) return Infinity;
      return Math.max(Math.abs(box.x - popup.x), Math.abs(box.width - popup.width),
        Math.abs(box.y - (popup.y + popup.height) - 4));
    }).toBeLessThan(1);
  };
  await add.click();
  await expectAligned();
  await expect(menu).toHaveCSS('box-shadow', 'none');
  await page.keyboard.press('Escape');
  await composer.getByRole('textbox').fill('第一行\n第二行\n第三行');
  await add.click();
  await expectAligned();
  await page.setViewportSize({ width: 900, height: 750 });
  await expectAligned();
});

test('输入 @ 引用文档，输入 / 选择操作，并在草稿原位替换触发词', async ({ page }) => {
  await page.goto('./playground/');
  const main = page.getByRole('main');
  const input = main.getByRole('textbox', { name: '消息', exact: true });
  const menu = page.getByRole('menu', { name: '添加内容' });
  await input.fill('见 后文');
  await input.press('ArrowLeft');
  await input.press('ArrowLeft');
  await page.keyboard.insertText('@');
  await expect(menu.getByRole('menuitem')).toHaveText(['引用布局文档']);
  await expect(input).toBeFocused();
  await page.keyboard.insertText('布局');
  await menu.getByRole('menuitem').click();
  await expect(input).toHaveValue('见 [基础布局组件](/docs/layout/)后文');
  await expect(input).toBeFocused();

  await input.fill('');
  await page.keyboard.insertText('/');
  await expect(menu.getByRole('menuitem')).toHaveText(['引用布局文档', '插入代码块']);
  await page.keyboard.insertText('代码');
  await expect(menu.getByRole('menuitem')).toHaveText(['插入代码块']);
  await input.press('Enter');
  await expect(input).toHaveValue('```\n\n```');
  await expect(menu).toBeHidden();
  await expect(input).toBeFocused();
  await expect(main.locator('[data-nf-user-message]')).toHaveCount(1);
});

test('符号菜单可用方向键选择或取消，邮箱和网址按普通文本编辑', async ({ page }) => {
  await page.goto('./playground/');
  const input = page.getByRole('main').getByRole('textbox', { name: '消息', exact: true });
  const menu = page.getByRole('menu', { name: '添加内容' });
  await input.fill('https:');
  await input.press('/');
  await expect(menu).toBeHidden();
  await input.fill('user');
  await input.press('@');
  await expect(menu).toBeHidden();
  await input.fill('下一步\n');
  await input.press('/');
  await expect(menu).toBeVisible();
  await input.press('ArrowDown');
  await expect(menu.getByRole('menuitem').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('下一步\n/');
  await input.press('Backspace');
  await input.press('@');
  await expect(menu).toBeVisible();
  await input.press('Backspace');
  await expect(menu).toBeHidden();
  await expect(input).toHaveValue('下一步\n');

  await page.keyboard.insertText('@布局');
  await expect(menu.getByRole('menuitem')).toHaveText(['引用布局文档']);
  await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  await expect(input).toHaveValue('下一步\n@布局');
  await page.keyboard.insertText('甲');
  await expect(menu).toBeHidden();
  await input.press('Backspace');
  await expect(menu.getByRole('menuitem')).toHaveText(['引用布局文档']);
});

test('输入框底栏分左右两组，权限和模型可独立选择', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 850 });
  await page.goto('./playground/');
  const composer = page.getByRole('main').locator('[data-nf-composer]');
  const left = composer.locator('[data-nf-composer-tools="start"]');
  const right = composer.locator('[data-nf-composer-tools="end"]');
  await expect(left.getByRole('button')).toHaveCount(2);
  const usage = right.getByRole('meter', { name: '上下文用量' });
  await expect(usage).toHaveAttribute('aria-valuenow', '38');
  const ring = (await usage.boundingBox())!;
  const mic = (await right.getByRole('button', { name: '语音输入' }).locator('svg').boundingBox())!;
  const model = (await right.getByRole('button', { name: /^模型，/ }).boundingBox())!;
  expect([ring.width, ring.height]).toEqual([16, 16]);
  expect([mic.width, mic.height]).toEqual([18, 18]);
  expect(ring.y + ring.height / 2).toBeCloseTo(mic.y + mic.height / 2, 1);
  expect(ring.y + ring.height / 2).toBeCloseTo(model.y + model.height / 2, 1);
  await expect(usage).toHaveCSS('margin-inline-end', '0px');
  const start = (await left.boundingBox())!;
  const end = (await right.boundingBox())!;
  expect(start.x + start.width).toBeLessThan(end.x);
  expect(Math.abs(start.y + start.height / 2 - end.y - end.height / 2)).toBeLessThan(1);
  await composer.getByRole('textbox').fill('未发送的草稿');
  await left.getByRole('button', { name: '权限，完全访问' }).click();
  await page.getByRole('menuitemradio', { name: '只读' }).click();
  await right.getByRole('button', { name: '模型，GPT-6.2 Astra 极高' }).press('Enter');
  const slider = page.getByRole('slider', { name: '推理强度' });
  await expect(slider).toBeFocused();
  await slider.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuetext', '高');
  await page.getByRole('button', { name: '选择模型，GPT-6.2 Astra' }).click();
  const list = page.getByRole('listbox', { name: '选择模型' });
  await expect(slider).toBeHidden();
  await expect(list.getByRole('option', { selected: true })).toBeFocused();
  await expect(list.getByRole('option', { selected: true })).toHaveText('GPT-6.2 Astra');
  await page.keyboard.press('End');
  await expect(list.getByRole('option', { name: 'GPT-5.6 Luna' })).toBeInViewport();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await expect(list.getByRole('option', { name: 'DeepSeek Chat' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(right.getByRole('button', { name: '模型，DeepSeek Chat 高' })).toBeFocused();
  await expect(left.getByRole('button', { name: '权限，只读' })).toBeVisible();
  await expect(composer.getByRole('textbox')).toHaveValue('未发送的草稿');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(right.getByRole('button', { name: '语音输入' })).toBeInViewport();
  expect(await composer.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
});

test('模型按供应商分组，方向键跨组切换后再次打开仍定位到所选模型', async ({ page }) => {
  await page.goto('./playground/');
  await page.getByRole('button', { name: '模型，GPT-6.2 Astra 极高' }).click();
  await page.getByRole('button', { name: '选择模型，GPT-6.2 Astra' }).click();
  const list = page.getByRole('listbox', { name: '选择模型' });
  const deepseek = list.getByRole('group', { name: 'DeepSeek' });
  const openai = list.getByRole('group', { name: 'OpenAI' });
  await expect(list.getByRole('option').first()).toHaveAccessibleName(/默认/);
  await expect(deepseek.getByRole('option')).toHaveText(['DeepSeek Chat', 'DeepSeek Reasoner']);
  await expect(openai.getByRole('option', { selected: true })).toHaveText('GPT-6.2 Astra');
  await page.keyboard.press('ArrowUp');
  await expect(openai.getByRole('option').first()).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(deepseek.getByRole('option').last()).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '模型，DeepSeek Reasoner 极高' }).click();
  await page.getByRole('button', { name: '选择模型，DeepSeek Reasoner' }).click();
  await expect(deepseek.getByRole('option', { selected: true })).toBeFocused();
  await expect(list.getByRole('option', { selected: true })).toHaveCount(1);
});

test('模型提示与强度面板锚定在底栏按钮上方，拖动、重置和快捷键可用', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 850 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const trigger = page.getByRole('button', { name: '模型，GPT-6.2 Astra 极高' });
  await trigger.hover();
  const tip = page.getByRole('tooltip', { name: /选择推理强度/ });
  await expect(tip).toBeVisible();
  expect(await trigger.locator('small').evaluate(el => getComputedStyle(el).color))
    .not.toBe(await trigger.evaluate(el => getComputedStyle(el).color));
  await trigger.click();
  await expect(tip).toBeHidden();
  const panel = page.getByRole('dialog', { name: '选择推理强度' });
  const bounds = (await panel.boundingBox())!;
  const button = (await trigger.boundingBox())!;
  expect(Math.abs(bounds.x + bounds.width - button.x - button.width)).toBeLessThan(2);
  expect(button.y - bounds.y - bounds.height).toBeCloseTo(4, 0);
  const slider = panel.getByRole('slider');
  await expect(panel.locator('.nf-model-fill')).toHaveCSS('transition-duration', '0s');
  const bar = (await slider.boundingBox())!;
  const y = bar.y + bar.height / 2;
  await page.mouse.move(bar.x + 14 + (bar.width - 28) * 3 / 5, y);
  await page.mouse.down();
  await page.mouse.move(bar.x + bar.width - 2, y, { steps: 8 });
  await page.mouse.up();
  await expect(slider).toHaveAttribute('aria-valuetext', '最高');
  await expect(panel.getByRole('button', { name: '使用最低推理强度' })).toHaveCount(0);
  const modelButton = (await panel.getByRole('button', { name: /选择模型/ }).boundingBox())!;
  expect(modelButton.x + modelButton.width / 2).toBeCloseTo(bounds.x + bounds.width / 2, 0);
  await panel.getByRole('button', { name: '恢复默认推理强度' }).click();
  await expect(slider).toHaveAttribute('aria-valuetext', '极高');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.getByRole('main').getByRole('textbox', { name: '消息', exact: true }).press('Control+Shift+m');
  await expect(slider).toBeFocused();
});

test('推理强度滑块连续跟随指针，填充同步，松手和点击刻度时平滑就位', async ({ page }) => {
  await page.goto('./playground/');
  await page.getByRole('button', { name: '模型，GPT-6.2 Astra 极高' }).click();
  const panel = page.getByRole('dialog', { name: '选择推理强度' });
  const slider = panel.getByRole('slider');
  await slider.hover();
  const thumb = panel.locator('.nf-model-thumb');
  const rail = panel.locator('.nf-model-stops');
  const fill = panel.locator('.nf-model-fill');
  const { x, y, width, height } = (await rail.boundingBox())!;
  const center = () => thumb.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return rect.x + rect.width / 2;
  });
  const yCenter = y + height / 2;
  const point = Math.round(x + width * .67);
  await page.mouse.move(await center(), yCenter);
  await page.mouse.down();
  await page.mouse.move(point, yCenter, { steps: 5 });
  await expect(slider).toHaveAttribute('aria-valuetext', '极高');
  expect(Math.abs(await center() - point)).toBeLessThan(1.5);
  expect(Math.abs(await fill.evaluate(el => el.getBoundingClientRect().right) - point)).toBeLessThan(1.5);
  await expect(fill).toHaveCSS('transition-duration', '0s');

  // Count actual transitions so an instant jump to the correct endpoint cannot pass.
  await fill.evaluate(el => el.addEventListener('transitionstart', event => {
    if ((event as TransitionEvent).propertyName === 'width') el.dataset.transitions = String(Number(el.dataset.transitions ?? 0) + 1);
  }));
  await page.mouse.up();
  await expect(fill).toHaveAttribute('data-transitions', '1');
  await expect.poll(async () => Math.abs(await center() - (x + width * .6))).toBeLessThan(1);
  await page.mouse.click(x + width * .2, yCenter);
  await expect(slider).toHaveAttribute('aria-valuetext', '中');
  await expect(fill).toHaveAttribute('data-transitions', '2');
  await expect.poll(async () => Math.abs(await center() - (x + width * .2))).toBeLessThan(1);
});

test('空草稿显示语音对话，听写插入草稿，发送时切换为停止', async ({ page }) => {
  await page.goto('./playground/');
  const main = page.getByRole('main');
  const composer = main.locator('[data-nf-composer]');
  const input = composer.getByRole('textbox');
  const voice = composer.getByRole('button', { name: '语音对话' });
  const send = composer.getByRole('button', { name: '发送消息' });
  await expect(voice).toBeVisible();
  await expect(send).toHaveCount(0);
  await input.fill('答：');
  await composer.getByRole('button', { name: '语音输入' }).click();
  await page.getByRole('menuitem', { name: '怎样收起侧栏？' }).click();
  await expect(input).toHaveValue('答：怎样收起侧栏？');
  await expect(input).toBeFocused();
  await expect(send).toBeEnabled();
  await input.fill('');
  await voice.click();
  await page.getByRole('menuitem', { name: '怎样收起侧栏？' }).click();
  await expect(main.locator('[data-nf-user-message]').last()).toHaveText('怎样收起侧栏？');
  await composer.getByRole('button', { name: '停止生成' }).click();
  await expect(voice).toBeVisible();
});

test('麦克风与模型文字、语音或发送按钮各留 16px', async ({ page }) => {
  await page.goto('./playground/');
  const composer = page.getByRole('main').locator('[data-nf-composer]');
  const toolbar = composer.locator('[data-nf-composer-tools="end"]');
  for (const draft of ['', '草稿']) {
    await composer.getByRole('textbox').fill(draft);
    const gaps = await toolbar.evaluate(el => {
      const label = el.querySelector('.nf-model-caption')!.getBoundingClientRect();
      const mic = el.querySelector<SVGSVGElement>('.preview-dictation svg')!;
      const bounds = mic.getBBox();
      const matrix = mic.getScreenCTM()!;
      const left = new DOMPoint(bounds.x, bounds.y).matrixTransform(matrix).x;
      const right = new DOMPoint(bounds.x + bounds.width, bounds.y).matrixTransform(matrix).x;
      const action = el.lastElementChild!.getBoundingClientRect();
      return [left - label.right, action.left - right];
    });
    for (const gap of gaps) expect(Math.abs(gap - 16)).toBeLessThan(1);
  }
});

test('输入框可单独提供右侧工具，省略空草稿操作时显示默认发送按钮', async ({ page }) => {
  const fromDocs = createRequire(resolve('apps/docs/package.json'));
  const { createElement: h } = fromDocs('react');
  const { renderToStaticMarkup } = fromDocs('react-dom/server');
  const { ConversationComposer } = await import('../packages/react/dist/index.js');
  await page.setContent(renderToStaticMarkup(h(ConversationComposer, {
    value: '', onSend() {}, onValueChange() {}, rightTools: h('button', null, '选择模型'),
  })));
  await expect(page.locator('[data-nf-composer-tools="start"]')).toHaveCount(0);
  const right = page.locator('[data-nf-composer-tools="end"]');
  await expect(right.getByRole('button', { name: '选择模型' })).toBeVisible();
  await expect(right.getByRole('button', { name: '发送消息' })).toBeDisabled();
});

test('普通回复逐段显示，输入框支持换行、输入法和停止生成', async ({ page }) => {
  await page.goto('./playground/');
  const main = page.getByRole('main');
  const input = main.getByRole('textbox', { name: '消息', exact: true });
  await expect(main.locator('[data-nf-composer]').getByRole('button', { name: /^(侧栏用法|查阅文档|生成布局草图)$/ })).toHaveCount(0);
  await input.fill('侧栏');
  await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  await expect(input).toHaveValue('侧栏');
  await input.press('Shift+Enter');
  await input.press('Enter');
  const turn = main.locator('[data-nf-turn]').last();
  await expect(turn.locator('[data-nf-user-message]')).toHaveText('侧栏');
  await expect(turn.locator('[data-nf-turn-process]')).toHaveCount(0);
  const reply = turn.locator('[data-nf-assistant-message] p');
  const appended = await reply.evaluate(el => new Promise<number>(resolve => {
    const length = el.textContent.length;
    const observer = new MutationObserver(() => {
      observer.disconnect();
      resolve(el.textContent.length - length);
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  }));
  expect(appended).toBe(1);
  await main.getByRole('button', { name: '停止生成' }).click();
  await expect(turn.getByText('已停止生成')).toBeVisible();
  await expect(input).toHaveValue('');
  await sendPreviewMessage(page, '怎样收起侧栏？');
  await expect(turn.locator('[data-nf-assistant-message]')).toContainText('再点一次，会回到刚才的会话。');
  await expect(turn.locator('[data-nf-turn-process]')).toHaveCount(0);
});

test('接入方可定义分组键与标题，在两个同类动作组之间插入独立审批组件', async ({ page }) => {
  const fromDocs = createRequire(resolve('apps/docs/package.json'));
  const { createElement: h } = fromDocs('react');
  const { renderToStaticMarkup } = fromDocs('react-dom/server');
  const { ActivitySequence, ActionGroup } = await import('../packages/react/dist/index.js');
  const items = ['read-a', 'read-b', 'approval', 'read-c', 'read-d', 'canvas'];
  await page.setContent(renderToStaticMarkup(h(ActivitySequence, {
    items, getKey: (id: string) => id,
    renderItem: (id: string) => h('button', null, id),
    group: { by: (id: string) => id.startsWith('read-') ? 'read' : undefined,
      render: (group: string[], children: unknown) => h(ActionGroup, {
        label: group.join(' / '),
        expanded: group.includes('read-a'),
        icon: group.includes('read-a') ? h('svg', { 'data-custom-icon': '' }) : null,
      }, children) },
  })));
  await expect(page.getByRole('button')).toHaveText([
    'read-a / read-b', 'read-a', 'read-b', 'approval', 'read-c / read-d', 'canvas',
  ]);
  await expect(page.getByRole('button', { name: 'read-a / read-b' }).locator('[data-custom-icon]')).toHaveCount(1);
  const closedGroup = page.getByRole('button', { name: 'read-c / read-d' });
  await expect(closedGroup).toHaveAttribute('aria-expanded', 'false');
  await expect(closedGroup.locator('[data-nf-action-icon]')).toHaveCount(0);
});

test('摘要外侧的悬浮滑块滚动对话，正文与输入框保持对齐', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 660 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const main = page.getByRole('main');
  const viewport = main.locator('[data-nf-thread-scroll]');
  const thumb = main.locator('[data-nf-thread-area] > [data-nf-scrollbar] > [data-nf-scroll-thumb]');
  await sendPreviewMessage(page, '查一下 useState 文档');
  await expect(main.getByRole('link', { name: /zh-hans.react.dev/ })).toBeVisible();
  const width = await viewport.evaluate(el => el.clientWidth);
  await page.getByRole('button', { name: '查看会话摘要' }).click();
  const card = main.getByRole('complementary', { name: '会话摘要' });
  await viewport.hover({ position: { x: 40, y: 50 } });
  await page.mouse.wheel(0, -48);
  await expect(thumb).toBeVisible();
  const summary = (await card.boundingBox())!;
  const slider = (await thumb.boundingBox())!;
  expect(slider.x).toBeGreaterThan(summary.x + summary.width);
  expect(await viewport.evaluate(el => el.clientWidth)).toBe(width);
  expect(await viewport.evaluate(el => el.clientWidth === (el as HTMLElement).offsetWidth)).toBe(true);
  const dock = (await main.locator('[data-nf-composer-dock]').boundingBox())!;
  const text = (await main.locator('[data-nf-transcript]').boundingBox())!;
  expect(text.x).toBeCloseTo(dock.x, 0);
  expect(text.width).toBeCloseTo(dock.width, 0);
  expect(dock.x + dock.width).toBeLessThanOrEqual(summary.x + 1);
  const start = await viewport.evaluate(el => el.scrollTop);
  await page.mouse.move(slider.x + slider.width / 2, slider.y + slider.height / 2);
  await page.mouse.down();
  await page.mouse.move(slider.x + slider.width / 2, slider.y + slider.height / 2 - 64, { steps: 6 });
  await page.mouse.up();
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeLessThan(start);
  await expect(thumb).toBeHidden();
  expect(await card.boundingBox()).toEqual(summary);
  expect(await main.locator('[data-nf-composer-dock]').boundingBox()).toEqual(dock);

  await page.getByRole('button', { name: '展开右侧栏' }).click();
  await expect(page.getByRole('separator', { name: '调整右栏宽度' })).toBeVisible();
  await viewport.hover({ position: { x: 40, y: 50 } });
  await page.mouse.wheel(0, await viewport.evaluate(el => el.scrollTop > 0 ? -48 : 48));
  await expect.poll(() => thumb.evaluate(el => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return document.elementFromPoint(x + width / 2, y + height / 2) === el;
  })).toBe(true);
});

test('摘要内容溢出时可单独滚动，滑块显隐保持条目宽度', async ({ page }) => {
  await page.goto('./playground/');
  await page.getByRole('button', { name: '查看会话摘要' }).click();
  const card = page.getByRole('complementary', { name: '会话摘要' });
  const thumb = card.locator('[data-nf-scroll-thumb]');
  const viewport = card.locator('[data-nf-scroll-viewport]');
  const width = await viewport.evaluate(el => el.clientWidth);
  await expect(thumb).toHaveCount(0);
  await card.evaluate(el => { el.style.maxHeight = '120px'; });
  await card.hover();
  expect(await viewport.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await expect(thumb).toBeHidden();
  expect(await viewport.evaluate(el => el.clientWidth)).toBe(width);
  const chat = page.locator('[data-nf-thread-scroll]');
  const top = await chat.evaluate(el => el.scrollTop);
  await page.mouse.wheel(0, 180);
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect(thumb).toBeVisible();
  await thumb.hover();
  await expect(thumb).toBeHidden();
  expect(await chat.evaluate(el => el.scrollTop)).toBe(top);
});

test('阅读旧消息时保留滚动位置，返回最新后能继续跟随输出', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 550 });
  await page.goto('./playground/');
  const main = page.getByRole('main');
  const viewport = main.locator('[data-nf-thread-scroll]');
  await sendPreviewMessage(page, '给我一张布局草图');
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(60);
  await viewport.evaluate(el => { el.scrollTop = 0; });
  const latest = main.getByRole('button', { name: '返回最新消息' });
  await expect(latest).toBeVisible();
  await expect(main.locator('[data-nf-turn]').last().getByText('再看窄屏下怎样切换。')).toBeVisible();
  expect(await viewport.evaluate(el => el.scrollTop)).toBe(0);
  await latest.click();
  await expect(latest).toBeHidden();
  await expect(main.locator('[data-nf-turn]').last().getByRole('button', { name: /已处理/ })).toBeVisible();
  await expect.poll(() => viewport.evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(2);
});

test('读者展开已结束的过程时，标题保持在点击处', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 620 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const summary = page.getByRole('button', { name: '已处理 4 秒' });
  await summary.scrollIntoViewIfNeeded();
  const y = (await summary.boundingBox())!.y;
  await summary.click();
  await expect(page.getByRole('button', { name: '返回最新消息' })).toBeVisible();
  expect((await summary.boundingBox())!.y).toBeCloseTo(y, 0);
});

test('动作组的高度、文字和箭头同步过渡，可以在展开途中收回', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./playground/');
  await page.getByRole('button', { name: '已处理 4 秒' }).press('Enter');
  const group = page.getByRole('button', { name: '查看了 2 项布局设置' });
  const frame = await group.evaluate(async button => {
    const root = button.parentElement!;
    const body = root.querySelector<HTMLElement>('[data-nf-activity-body]')!;
    const arrow = button.lastElementChild!;
    root.style.setProperty('--nf-motion-reveal', '800ms');
    root.style.setProperty('--nf-ease', 'linear');
    button.click();
    await new Promise(requestAnimationFrame);
    const transitions = [...body.getAnimations(), ...arrow.getAnimations()];
    await Promise.all(transitions.map(t => t.ready));
    for (const t of transitions) t.currentTime = 400;
    const matrix = new DOMMatrix(getComputedStyle(arrow).transform);
    return {
      height: body.clientHeight, full: body.firstElementChild!.scrollHeight,
      opacity: Number(getComputedStyle(body).opacity), angle: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
    };
  });
  expect(frame.height).toBeGreaterThan(0);
  expect(frame.height).toBeLessThan(frame.full);
  expect(frame.opacity).toBeCloseTo(.5, 1);
  expect(frame.angle).toBeCloseTo(45, 0);
  await group.press('Space');
  await expect(group).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-nf-action-group] > [data-nf-activity-body]').first()).toHaveCSS('height', '0px');
});

test('生成结束时耗时标题逐渐出现，原有过程同时收起', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./playground/');
  await sendPreviewMessage(page, '给我一张布局草图');
  const process = page.locator('[data-nf-turn-process]').last();
  const frame = await process.evaluate(async el => {
    const heading = el.querySelector<HTMLElement>('[data-nf-process-heading]')!;
    const body = el.querySelector<HTMLElement>('[data-nf-activity-body]')!;
    el.style.setProperty('--nf-motion-reveal', '800ms');
    el.style.setProperty('--nf-ease', 'linear');
    await new Promise<void>(resolve => {
      const observer = new MutationObserver(() => {
        if (heading.dataset.open === 'true') { observer.disconnect(); resolve(); }
      });
      observer.observe(heading, { attributes: true, attributeFilter: ['data-open'] });
    });
    await new Promise(requestAnimationFrame);
    const transitions = [...heading.getAnimations(), ...body.getAnimations()];
    await Promise.all(transitions.map(t => t.ready));
    for (const t of transitions) t.currentTime = 400;
    return [heading, body].map(node => ({
      height: node.clientHeight, full: node.firstElementChild!.scrollHeight,
      opacity: Number(getComputedStyle(node).opacity),
    }));
  });
  for (const { height, full, opacity } of frame) {
    expect(height).toBeGreaterThan(0);
    expect(height).toBeLessThan(full);
    expect(opacity).toBeCloseTo(.5, 1);
  }
});

test('流中的草图从小到大展开，消息区跟随到草图底部', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 650 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./playground/');
  await sendPreviewMessage(page, '给我一张布局草图');
  const turn = page.locator('[data-nf-turn]').last();
  const sizes = await turn.evaluate(async el => {
    const card = await new Promise<HTMLElement>(resolve => {
      const find = () => {
        const node = el.querySelector<HTMLElement>('.preview-sketch');
        if (node) { observer.disconnect(); resolve(node); }
      };
      const observer = new MutationObserver(find);
      observer.observe(el, { childList: true, subtree: true });
      find();
    });
    const growth = card.getAnimations().find(a => a instanceof CSSTransition && a.transitionProperty === 'grid-template-rows')!;
    await growth.ready;
    growth.currentTime = Number(growth.effect!.getTiming().duration) / 3;
    const mid = card.clientHeight;
    await growth.finished;
    return [mid, card.clientHeight];
  });
  expect(sizes[0]).toBeGreaterThan(0);
  expect(sizes[0]).toBeLessThan(sizes[1]);
  await expect.poll(() => page.locator('[data-nf-thread-scroll]').evaluate(el =>
    el.scrollHeight - el.clientHeight - el.scrollTop)).toBeLessThan(2);
});

test('减少动效或关闭主题动效时，会话内容即时显示和收展', async ({ page }) => {
  await page.goto('./playground/');
  const main = page.getByRole('main');
  const process = main.locator('[data-nf-turn-process]').first();
  const body = process.locator(':scope > [data-nf-activity-body]');
  for (const preference of ['reduce', 'no-preference'] as const) {
    await page.emulateMedia({ reducedMotion: preference });
    if (preference === 'no-preference') {
      await main.evaluate(el => el.style.setProperty('--nf-motion-scale', '0'));
    }
    await process.getByRole('button', { name: '已处理 4 秒' }).press('Enter');
    await expect(body).toHaveCSS('opacity', '1');
    expect(await body.evaluate(el => el.getAnimations().length)).toBe(0);
    await expect(main.locator('[data-nf-assistant-message] p').first()).toHaveCSS('animation-duration', '0s');
    await process.getByRole('button', { name: '已处理 4 秒' }).press('Space');
    await expect(body).toHaveCSS('height', '0px');
  }
});

async function openPreviewRightPane(page: Page) {
  await page.getByRole('button', { name: '展开右侧栏' }).click();
  const pane = page.getByRole('complementary', { name: '右侧' });
  await expect(pane).toBeVisible();
  await pane.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
}

test('官网首页展示工作区，可切换代码示例并进入指南', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('界面组件库');
  await page.getByRole('button', { name: 'CSS', exact: true }).click();
  await expect(page.getByLabel('CSS 示例')).toContainText('--nf-canvas');
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: '指南', exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.getByRole('heading', { name: '使用指南', level: 1 })).toBeVisible();
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
  await page.getByRole('link', { name: '示例', exact: true }).click();
  await expect(page.getByRole('main').getByRole('textbox', { name: '消息', exact: true })).toBeVisible();
  await expect(page.locator('#preview-left')).toBeHidden();
  await expect(page.locator('#preview-right')).toBeHidden();
  await expectNoHorizontalOverflow(page);
});

test('首页默认复制 pnpm 安装命令，也可以切换为 npm', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  const commands = page.locator('.start-section');
  await commands.getByRole('button', { name: '复制命令 pnpm install nibferry' }).click();
  await expect(commands.getByRole('status')).toHaveText('已复制命令');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('pnpm install nibferry');
  await commands.getByLabel('选择包管理器').click();
  await commands.getByRole('button', { name: 'npm', exact: true }).click();
  await commands.getByRole('button', { name: '复制命令 npm install nibferry' }).click();
  await expect(commands.getByRole('status')).toHaveText('已复制命令');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install nibferry');
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

test('主题导航、分组目录和相邻文档链接可导航', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '主题' }).click();
  const sidebar = page.getByRole('navigation', { name: '文档目录' });
  await sidebar.getByRole('link', { name: '颜色与文字' }).click();
  await expect(sidebar.getByRole('link', { name: '颜色与文字' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(sidebar.getByRole('link', { name: '接入项目' })).toBeHidden();
  await sidebar.getByText('指南', { exact: true }).click();
  await expect(sidebar.getByRole('link', { name: '接入项目' })).toBeVisible();
  await sidebar.getByText('指南', { exact: true }).click();
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
  await page.getByRole('navigation', { name: '文档目录' }).getByText('主题', { exact: true }).click();
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
  await expect(main.getByRole('textbox', { name: '消息', exact: true })).toBeVisible();
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
  await page.getByRole('button', { name: '收起浮窗' }).click();
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
  const draft = main.getByRole('textbox', { name: '消息', exact: true });
  await draft.fill('草稿');
  const transcript = main.locator('[data-nf-transcript]');
  await transcript.evaluate(el => { el.style.minHeight = '1400px'; });
  const viewport = main.locator('[data-nf-thread-scroll]');
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  const scroll = await viewport.evaluate(el => {
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
  await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(scroll);
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
  await dialog.getByRole('option', { name: 'layout.txt 基础布局组件', exact: true }).click();
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

test('预览按钮切换常驻导航，保留项目、栏宽和已打开的文档', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 820 });
  await page.goto('./playground/');
  const switcher = page.getByRole('button', { name: '常驻导航栏' });
  const rail = page.getByRole('navigation', { name: '主导航' });
  const compactRail = page.getByRole('navigation', { name: '收起的工作区菜单' });
  const left = page.locator('#preview-left');
  const titlebar = page.getByRole('banner', { name: '主区域标题栏' });
  await expect(switcher).toHaveAttribute('aria-pressed', 'false');
  await left.getByRole('button', { name: '讨论工作区布局', exact: true }).click();
  await page.getByRole('separator', { name: '调整左栏宽度' }).press('Shift+ArrowRight');
  await switcher.press('Space');
  await expect(switcher).toHaveAttribute('aria-pressed', 'true');
  await expect(rail.getByRole('button', { name: '首页' })).toHaveAttribute('aria-current', 'page');
  await expect(left).toHaveCSS('width', '272px');
  const railBounds = (await rail.boundingBox())!;
  await expect.poll(async () => (await left.boundingBox())?.x).toBe(railBounds.x + railBounds.width);
  await expect.poll(async () => (await titlebar.boundingBox())?.x).toBe(railBounds.x + railBounds.width + 272);
  await page.getByRole('button', { name: '收起左侧栏' }).click();
  await expect(left).toBeHidden();
  await expect(compactRail).toBeHidden();
  await rail.getByRole('button', { name: '项目会话' }).click();
  await page.getByRole('menuitem', { name: '设计摘要面板' }).click();
  await rail.getByRole('button', { name: '布局组件指南' }).click();
  const source = page.getByRole('tab', { name: '基础布局组件', selected: true });
  await expect(source).toBeVisible();
  await switcher.press('Enter');
  await expect(rail).toBeHidden();
  await expect(compactRail.getByRole('button', { name: '会话', exact: true })).toBeVisible();
  await expect(source).toBeVisible();
  await page.getByRole('button', { name: '展开左侧栏' }).click();
  await expect(left).toHaveCSS('width', '272px');
  await expect(left.locator('[aria-current="page"]')).toHaveText('设计摘要面板');
});

test('常驻导航在窄窗口让出空间，回到桌面宽度后恢复', async ({ page }) => {
  await page.goto('./playground/');
  const switcher = page.getByRole('button', { name: '常驻导航栏' });
  const rail = page.getByRole('navigation', { name: '主导航' });
  await switcher.click();
  await rail.getByRole('button', { name: '更多导航' }).click();
  const menu = page.getByRole('menu', { name: '更多导航' });
  await expect(menu).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toBeHidden();
  await expect(rail).toBeHidden();
  await expect(switcher).toBeHidden();
  await expect(page.getByRole('main')).toHaveCSS('width', await workspaceWidth(page) + 'px');
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(switcher).toHaveAttribute('aria-pressed', 'true');
  await expect(rail).toBeVisible();
  await expect(menu).toBeHidden();
});

test('主体已到最小宽度时切换常驻导航，两侧仍恢复用户设置的宽度', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  await openPreviewRightPane(page);
  const left = page.getByRole('separator', { name: '调整左栏宽度' });
  const right = page.getByRole('separator', { name: '调整右栏宽度' });
  const switcher = page.getByRole('button', { name: '常驻导航栏' });
  await right.press('Shift+ArrowLeft');
  const rightWidth = 352;
  await expect(right).toHaveAttribute('aria-valuenow', String(rightWidth));
  await left.press('End');
  const leftWidth = await workspaceWidth(page) - rightWidth - 192;
  await expect(left).toHaveAttribute('aria-valuenow', String(leftWidth));
  await expect(page.getByRole('main')).toHaveCSS('width', '192px');
  await switcher.click();
  await expect.poll(async () => Number(await left.getAttribute('aria-valuenow'))).toBeLessThan(leftWidth);
  await expect.poll(async () => Number(await right.getAttribute('aria-valuenow'))).toBeLessThan(rightWidth);
  await switcher.click();
  await expect(left).toHaveAttribute('aria-valuenow', String(leftWidth));
  await expect(right).toHaveAttribute('aria-valuenow', String(rightWidth));
  await switcher.click();
  await expect.poll(async () => Number(await left.getAttribute('aria-valuenow'))).toBeLessThan(leftWidth);
  const compressed = Number(await left.getAttribute('aria-valuenow'));
  await left.press('ArrowLeft');
  await expect(left).toHaveAttribute('aria-valuenow', String(compressed - 8));
  await switcher.click();
  await expect(left).toHaveAttribute('aria-valuenow', String(compressed - 8));
  await expect(right).toHaveAttribute('aria-valuenow', String(rightWidth));
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

test('左栏收起后，会话浮层沿用原项目列表、栏宽和选中态', async ({ page }) => {
  await page.goto('./playground/');
  const rail = page.getByRole('navigation', { name: '收起的工作区菜单' });
  const left = page.locator('#preview-left');
  const toolbar = page.locator('.workspace-preview-titlebar');
  const toggle = toolbar.getByRole('button', { name: /左侧栏/ });
  const compose = toolbar.getByRole('button', { name: '新聊天', exact: true }).first();
  await expect(rail).toBeHidden();
  await expect(compose).toBeHidden();
  const window = (await page.locator('.mac-window-content').boundingBox())!;
  await expect.poll(async () => (await left.boundingBox())?.x).toBe(window.x);
  await page.getByRole('separator', { name: '调整左栏宽度' }).press('Shift+ArrowRight');
  const listWidth = (await left.boundingBox())!.width;
  await toggle.click();
  await expect(left).toBeHidden();
  await expect(rail).toHaveCSS('width', '52px');
  await expect.poll(async () => (await rail.boundingBox())?.x).toBe(window.x);
  const sessions = rail.getByRole('button', { name: '会话', exact: true });
  await sessions.press('Enter');
  const popup = page.getByRole('dialog', { name: '会话', exact: true });
  const list = popup.getByRole('navigation', { name: '项目' });
  await expect(list.locator('[aria-current="page"]')).toHaveText('梳理 Nibferry 项目交接');
  await expect(popup).toHaveCSS('width', listWidth + 'px');
  expect((await popup.boundingBox())!.x).toBeGreaterThan((await sessions.boundingBox())!.x);
  const folder = list.getByRole('button', { name: 'EU OS', exact: true });
  await expect(folder).toHaveAttribute('aria-expanded', 'false');
  await folder.press('Enter');
  await list.getByRole('button', { name: '启动桌面端', exact: true }).press('Enter');
  await expect(popup).toBeHidden();
  await expect(toolbar.getByRole('button', { name: '启动桌面端' })).toBeVisible();
  await expect(sessions).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await compose.click();
  await expect(page.getByRole('banner', { name: '主区域标题栏' })).toContainText('新聊天');
  await toggle.press('Enter');
  await expect(left.getByRole('group', { name: 'EU OS', exact: true }).locator('[aria-current="page"]')).toHaveText('新聊天');
  await expect(rail).toBeHidden();
});

test('窄栏浮层的会话置顶和项目折叠同步到展开侧栏', async ({ page }) => {
  await page.goto('./playground/');
  const toggle = page.getByRole('button', { name: /左侧栏/ });
  await toggle.click();
  const trigger = page.getByRole('button', { name: '会话', exact: true });
  await trigger.click();
  const popup = page.getByRole('dialog', { name: '会话', exact: true });
  const chat = popup.getByRole('button', { name: '设计摘要面板', exact: true });
  await chat.click({ button: 'right' });
  await page.getByRole('menuitem', { name: '置顶聊天' }).click();
  await expect(popup.locator('[data-nf-conversation-item]').first()).toHaveText('设计摘要面板');
  await popup.getByRole('button', { name: 'Nibferry', exact: true }).click();
  await expect(chat).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await toggle.click();
  const list = page.getByRole('navigation', { name: '项目' });
  const folder = list.getByRole('button', { name: 'Nibferry', exact: true });
  await expect(folder).toHaveAttribute('aria-expanded', 'false');
  await folder.click();
  await expect(list.locator('[data-nf-conversation-item]').first()).toHaveText('设计摘要面板');
});

test('会话浮层内按 Esc 逐层关闭项目信息和编辑框', async ({ page }) => {
  await page.goto('./playground/');
  await page.getByRole('button', { name: '收起左侧栏' }).click();
  const trigger = page.getByRole('button', { name: '会话', exact: true });
  await trigger.press('Enter');
  const popup = page.getByRole('dialog', { name: '会话', exact: true });
  const folder = popup.getByRole('button', { name: 'EU OS', exact: true });
  await folder.press('ArrowRight');
  const details = popup.getByRole('dialog', { name: 'EU OS 项目信息' });
  await expect(details).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(details).toBeHidden();
  await expect(folder).toBeFocused();
  await folder.press('Shift+F10');
  await page.getByRole('menuitem', { name: '编辑项目' }).press('Enter');
  const editor = popup.getByRole('dialog', { name: '编辑项目' });
  await expect(editor.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(editor).toBeHidden();
  await expect(popup.getByRole('group', { name: 'EU OS', exact: true }).getByRole('button', { name: '项目操作' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('收起和展开共用搜索弹框与待办通知，窄屏回到单栏', async ({ page }) => {
  await page.goto('./playground/');
  const expanded = page.getByRole('navigation', { name: '工作区菜单', exact: true });
  const rail = page.getByRole('navigation', { name: '收起的工作区菜单' });
  await expect(expanded.getByRole('button', { name: /消息通知/ })).toContainText('2');
  await page.getByRole('button', { name: '收起左侧栏' }).click();
  const search = rail.getByRole('button', { name: '搜索项目和会话' });
  await search.click();
  const dialog = page.getByRole('dialog', { name: '搜索 Nibferry' });
  await expect(dialog.getByRole('combobox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(search).toBeFocused();
  const notifications = rail.getByRole('button', { name: /消息通知/ });
  await expect(notifications.locator('[data-nf-pane-badge]')).toHaveCSS('position', 'absolute');
  await notifications.click();
  await page.getByRole('menuitem', { name: '桌面端分析已更新' }).click();
  await expect(page.getByRole('banner', { name: '主区域标题栏' })).toContainText('分析 EU-OS 桌面端项目');
  await rail.getByRole('button', { name: /待办/ }).click();
  await expect(page.getByRole('menu', { name: '待办' }).getByRole('menuitem')).toHaveCount(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(rail).toBeHidden();
  await expect(page.getByRole('menu', { name: '待办' })).toBeHidden();
  await expect(page.getByRole('main')).toHaveCSS('width', await workspaceWidth(page) + 'px');
  await page.getByRole('button', { name: '展开左侧栏' }).click();
  await expect(expanded.getByRole('button', { name: '新聊天' })).toBeVisible();
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
  await expect(page.getByRole('main')).toHaveCSS('width', width - 320 - 52 + 'px');
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
  await expect(page.getByRole('main')).toHaveCSS('width', desktopWidth - 320 - 52 + 'px');
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
  await expect(right).toHaveCSS('width', available - 52 + 'px');
  await fullToggle.click();
  await expect(left).toBeHidden();
  await expect(right).toHaveCSS('width', '352px');
});

test('全屏浮窗复用同一份对话，收起和恢复时文档可操作且焦点正确', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./playground/');
  const input = page.getByRole('textbox', { name: '消息', exact: true });
  await sendPreviewMessage(page, Array.from({ length: 80 }, (_, i) => '段落 ' + i).join('\n'));
  await expect(page.getByRole('button', { name: '语音对话' })).toBeVisible();
  await input.fill('留在当前会话的草稿');
  const original = await input.elementHandle();
  await openPreviewRightPane(page);
  const viewport = page.locator('[data-nf-thread-scroll]').first();
  await viewport.evaluate(el => { el.scrollTop = 150; });
  await expect(page.getByRole('button', { name: '返回最新消息' })).toBeVisible();
  await page.getByRole('button', { name: '全屏显示右侧栏' }).press('Enter');
  const panel = page.locator('[data-nf-floating-panel]');
  await expect(panel.getByRole('textbox')).toHaveValue('留在当前会话的草稿');
  expect(await viewport.evaluate(el => el.scrollTop)).toBe(150);
  await panel.getByRole('textbox').fill('浮窗中的编辑');
  await viewport.evaluate(el => { el.scrollTop = 185; });
  await panel.getByRole('button', { name: '收起浮窗' }).press('Enter');
  const restore = page.getByRole('button', { name: '恢复浮动对话' });
  await expect(restore).toBeFocused();
  await expect(panel).toBeHidden();
  await page.locator('#preview-right').getByRole('button', { name: '基础布局组件' }).click();
  const document = page.frameLocator('#preview-right iframe').locator('html');
  await expect(document).toBeVisible();
  const top = await document.evaluate(el => { el.scrollTop = 150; return el.scrollTop; });
  expect(top).toBeGreaterThan(0);
  await restore.press('Enter');
  await expect(panel).toBeFocused();
  await expect(input).toHaveValue('浮窗中的编辑');
  expect(await viewport.evaluate(el => el.scrollTop)).toBe(185);
  await page.getByRole('button', { name: '退出全屏' }).click();
  await expect(page.getByRole('main').getByRole('textbox')).toHaveValue('浮窗中的编辑');
  expect(await input.evaluate((el, before) => el === before, original)).toBe(true);
  expect(await viewport.evaluate(el => el.scrollTop)).toBe(185);
  expect(await document.evaluate(el => el.scrollTop)).toBe(top);
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
  await expect(page.getByRole('button', { name: '已处理 4 秒' })).toBeFocused();
  await page.getByRole('main').getByRole('textbox', { name: '消息', exact: true }).press('Tab');
  for (const name of ['添加内容', '权限，完全访问', '模型，GPT-6.2 Astra 极高', '语音输入', '语音对话']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
  }
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
  await expect(page.getByRole('main').getByRole('textbox', { name: '消息', exact: true })).toBeVisible();
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
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: '打开导航' }).click();
  await expect(page.getByRole('navigation', { name: '主导航' })).toHaveCSS('animation-name', 'none');
});

test('从首页筛选公开组件并跳到部件说明', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: '浏览组件' }).click();
  const catalog = page.locator('.component-catalog');
  const exports = await import('../packages/react/dist/index.js');
  const links = catalog.locator('.catalog-links a');
  await expect(links).toHaveCount(16);
  const urls = await links.evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
  expect(new Set(urls).size).toBe(16);
  const documents = await Promise.all(urls.map(async url => (await page.request.get(url)).text()));
  const names = await page.evaluate(pages => pages.flatMap(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (doc.querySelectorAll('article .component-demo').length !== 1) throw new Error(doc.title);
    return Array.from(doc.querySelectorAll('article .component-export, article section > h2[id] > code'),
      code => code.textContent);
  }), documents);
  expect(names.sort()).toEqual(Object.keys(exports).filter(name => /^[A-Z]/.test(name)).sort());
  await catalog.getByRole('button', { name: '菜单与浮层' }).click();
  const input = catalog.getByRole('textbox', { name: '筛选组件' });
  await input.fill('菜单项');
  await expect(catalog.getByRole('link')).toHaveCount(1);
  await input.fill('WorkspaceTabClose');
  await expect(catalog.getByRole('status')).toHaveText('没有找到匹配的组件。');
  await catalog.getByRole('button', { name: '全部' }).click();
  await catalog.getByRole('link', { name: /关闭标签按钮/ }).click();
  await expect(page).toHaveURL(/\/components\/workspace\/workspace-tab-list\/#WorkspaceTabClose$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('工作区标签栏');
  const sidebar = page.getByRole('navigation', { name: '文档目录' });
  await expect(sidebar.getByRole('link', { name: '工作区标签栏' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#WorkspaceTabClose')).toBeInViewport();

  await page.getByRole('button', { name: '搜索文档' }).click();
  const search = page.getByRole('combobox');
  await search.fill('MenuItem');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/dropdown-menu\/#MenuItem$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('下拉菜单');
  await expect(page.locator('#MenuItem')).toBeInViewport();
  await page.getByRole('button', { name: '会话操作' }).click();
  await expect(page.getByRole('menuitem', { name: '置顶' })).toBeVisible();
});

test('图标导航项旧地址定位到导航栏的部件说明，侧栏只列组合', async ({ page }) => {
  await page.goto('./docs/components/workspace/navigation-rail-item/');
  await expect(page).toHaveURL(/\/navigation-rail\/#NavigationRailItem$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('图标导航栏');
  await expect(page.locator('#NavigationRailItem')).toBeInViewport();
  const sidebar = page.getByRole('navigation', { name: '文档目录' });
  await expect(sidebar.getByRole('link', { name: '图标导航栏' })).toHaveAttribute('aria-current', 'page');
  await expect(sidebar.getByRole('link', { name: '图标导航项' })).toHaveCount(0);
  const demo = page.locator('.docs-prose .component-demo');
  await demo.getByRole('button', { name: '文档', exact: true }).press('Enter');
  await expect(demo.getByRole('button', { name: '接入指南' })).toBeVisible();
});

test('手机从组件分类进入部件页面，Markdown 与正文都链接到关联组件', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./docs/components/');
  await page.getByRole('button', { name: '文档目录' }).click();
  const nav = page.getByRole('navigation', { name: '文档目录' });
  await nav.getByText('导航与工作区', { exact: true }).click();
  await nav.getByRole('link', { name: '工作区布局', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('工作区布局');
  await expect(nav).toBeHidden();
  const body = page.locator('.docs-prose');
  await expect(body.getByRole('heading', { name: '参数与交互', level: 2 })).toBeVisible();
  const handle = body.locator('section[aria-labelledby="LeftPane"]').getByRole('link', { name: 'PaneResizeHandle' });
  await expect(handle).toHaveAttribute('href', /\/components\/workspace\/workspace-layout\/#PaneResizeHandle$/);
  const response = await request.get('./markdown/components/workspace/workspace-layout.txt');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toMatch(/\[PaneResizeHandle\]\([^)]*\/docs\/components\/workspace\/workspace-layout\/#PaneResizeHandle\)/);
});

test('应用入口统一加载样式，组件示例只导入所用部件', async ({ page }) => {
  await page.goto('./docs/installation/');
  const setup = page.locator('.docs-prose pre').filter({ hasText: 'nibferry/styles.css' });
  await expect(setup).toHaveCount(1);
  for (const slug of ['model-select', 'dropdown-menu']) {
    await page.goto('./docs/' + slug + '/');
    const example = page.locator('.docs-prose pre').filter({ hasText: "from 'nibferry'" }).first();
    await expect(example).toBeVisible();
    await expect(example).not.toContainText('nibferry/styles.css');
  }
  await page.getByRole('button', { name: '会话操作' }).click();
  await expect(page.getByRole('menuitem', { name: '置顶' })).toHaveCSS('display', 'flex');
});

test('在组件文档中调整强度和切换模型提供商', async ({ page }) => {
  await page.goto('./docs/model-select/');
  const trigger = page.getByRole('button', { name: '模型，GPT-6.2 Astra 高' });
  await trigger.click();
  const slider = page.getByRole('slider', { name: '推理强度' });
  await slider.press('Home');
  await expect(slider).toHaveAttribute('aria-valuetext', '低');
  await page.getByRole('button', { name: '选择模型，GPT-6.2 Astra' }).click();
  await page.getByRole('group', { name: 'DeepSeek' }).getByRole('option').click();
  await expect(page.getByRole('button', { name: '模型，DeepSeek Reasoner 低' })).toBeVisible();
});

test('在下拉菜单文档中操作菜单项和键盘子菜单', async ({ page }) => {
  await page.goto('./docs/dropdown-menu/');
  const demo = page.getByRole('group', { name: '下拉菜单示例' });
  const trigger = demo.getByRole('button', { name: '会话操作' });
  await trigger.press('Enter');
  await page.getByRole('menuitem', { name: '置顶' }).press('Enter');
  await expect(demo.getByLabel('已置顶')).toBeVisible();
  await trigger.press('Enter');
  await page.getByRole('menuitem', { name: '显示密度' }).press('ArrowRight');
  await page.getByRole('menuitem', { name: '紧凑' }).press('Enter');
  await expect(demo.locator('.demo-conversation')).toHaveCSS('padding-block-start', '4px');
  await expect(trigger).toBeFocused();
});

test('组件目录的每个条目都有实物预览，筛选后可以直接操作', async ({ page }) => {
  await page.goto('./docs/components/');
  const catalog = page.locator('.component-catalog');
  const cards = catalog.locator('.catalog-example');
  await expect(cards).toHaveCount(16);
  for (const card of await cards.all()) {
    await expect(card.locator('.component-demo')).toBeVisible();
    await expect(card.locator('.component-demo > :first-child')).toBeVisible();
  }
  await catalog.getByRole('textbox', { name: '筛选组件' }).fill('WorkspaceTab');
  await expect(cards).toHaveCount(1);
  await catalog.getByRole('button', { name: '新增标签页' }).click();
  await expect(catalog.getByRole('tabpanel')).toHaveText('新文档 3');
  await catalog.getByRole('button', { name: '关闭「文档 3」' }).click();
  await expect(catalog.getByRole('tab', { selected: true })).toHaveText('变更');
  await expect(page).toHaveURL(/\/components\/$/);
});

test('直达部件文档时可在原地预览输入框并发送引用', async ({ page }) => {
  await page.goto('./docs/conversation/#ConversationComposer');
  await expect(page).toHaveURL(/\/components\/input\/conversation-composer\/$/);
  const preview = page.locator('.docs-prose .component-demo');
  const input = preview.getByRole('textbox', { name: '示例消息' });
  await input.pressSequentially('@');
  await page.getByRole('menuitem', { name: '引用组件指南' }).click();
  await expect(input).toHaveValue('《组件指南》');
  await input.press('Enter');
  await expect(input).toHaveValue('');
  await expect(preview.locator('[data-nf-user-message]')).toHaveText('《组件指南》');

  await page.getByRole('button', { name: '搜索文档', exact: true }).click();
  const search = page.getByRole('combobox');
  await search.fill('UserMessage');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/components\/messages\/conversation-view\/#UserMessage$/);
  await expect(page.locator('.docs-prose .component-demo [data-nf-user-message]')).toBeVisible();
});

test('工作区布局示例支持宽屏拖动分栏和窄屏切换面板', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./docs/layout/');
  await page.getByRole('button', { name: '放大工作区示例' }).click();
  const dialog = page.getByRole('dialog', { name: '工作区布局示例' });
  const resize = dialog.locator('[data-nf-resize="right"]');
  await resize.hover();
  const right = dialog.locator('[data-nf-pane="right"]');
  const before = (await right.boundingBox())!.width;
  const handle = (await resize.boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x - 48, handle.y + handle.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => (await right.boundingBox())!.width).toBeGreaterThan(before + 30);
  await dialog.getByRole('button', { name: '关闭预览' }).click();
  await page.setViewportSize({ width: 375, height: 812 });
  const inline = page.locator('.example-workspace-stage > .example-workspace');
  await inline.locator('button[aria-controls$="-right"][aria-expanded]').click();
  await expect(inline.locator('[data-nf-pane="right"]')).toBeVisible();
  await expect(inline.locator('[data-nf-pane="main"]')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
