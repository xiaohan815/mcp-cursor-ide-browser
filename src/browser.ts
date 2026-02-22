import puppeteer, { Browser, Page, ConsoleMessage, HTTPRequest, LaunchOptions, KeyInput } from 'puppeteer';
import * as path from 'path';
import * as os from 'os';

export interface BrowserSnapshot {
  title: string;
  url: string;
  accessibilityTree: any;
  viewport: { width: number; height: number };
  timestamp: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TabInfo {
  id: number;
  url: string;
  title: string;
}

export interface ConsoleMessageInfo {
  type: string;
  text: string;
  timestamp: number;
}

export interface NetworkRequestInfo {
  url: string;
  method: string;
  status: number;
  resourceType: string;
  timestamp: number;
}

export class BrowserClient {
  private browser: Browser | null = null;
  private pages: Map<number, Page> = new Map();
  private currentPageId: number = 0;
  private consoleMessages: ConsoleMessageInfo[] = [];
  private networkRequests: NetworkRequestInfo[] = [];
  private locked: boolean = false;
  private nextTabId: number = 1;

  constructor() {}

  async launch(options?: LaunchOptions): Promise<void> {
    if (this.browser) {
      return;
    }

    // 设置用户数据目录，用于保存cookie、localStorage等数据
    const userDataDir = options?.userDataDir ?? path.join(os.homedir(), '.mcp-browser-data');

    this.browser = await puppeteer.launch({
      headless: options?.headless ?? false,
      defaultViewport: options?.defaultViewport ?? { width: 1280, height: 720 },
      args: options?.args ?? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      userDataDir: userDataDir,
    });

    const page = await this.browser.newPage();
    const tabId = this.nextTabId++;
    this.pages.set(tabId, page);
    this.currentPageId = tabId;

    this.setupPageListeners(page);
  }

  private setupPageListeners(page: Page): void {
    page.on('console', (msg: ConsoleMessage) => {
      this.consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
      });
      if (this.consoleMessages.length > 100) {
        this.consoleMessages.shift();
      }
    });

    page.on('requestfinished', (request: HTTPRequest) => {
      const response = request.response();
      if (response) {
        this.networkRequests.push({
          url: request.url(),
          method: request.method(),
          status: response.status(),
          resourceType: request.resourceType(),
          timestamp: Date.now(),
        });
        if (this.networkRequests.length > 100) {
          this.networkRequests.shift();
        }
      }
    });
  }

  private getCurrentPage(): Page {
    const page = this.pages.get(this.currentPageId);
    if (!page) {
      throw new Error('No active page');
    }
    return page;
  }

  async navigate(url: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
  }

  async navigateBack(): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.goBack();
  }

  async navigateForward(): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.goForward();
  }

  async reload(): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.reload({ waitUntil: 'networkidle2' });
  }

  async snapshot(): Promise<BrowserSnapshot> {
    const page = this.getCurrentPage();
    const accessibilityTree = await page.accessibility.snapshot();
    const title = await page.title();
    const url = page.url();
    const viewport = page.viewport() || { width: 0, height: 0 };

    return {
      title,
      url,
      accessibilityTree,
      viewport,
      timestamp: Date.now(),
    };
  }

  async click(selector: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
  }

  async type(selector: string, text: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.type(selector, text);
  }

  async fill(selector: string, text: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.$eval(selector, (el) => { (el as HTMLInputElement).value = ''; });
    await page.type(selector, text);
  }

  async fillForm(fields: Record<string, string>): Promise<void> {
    this.checkLock();
    for (const [selector, value] of Object.entries(fields)) {
      await this.fill(selector, value);
    }
  }

  async hover(selector: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.hover(selector);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.select(selector, value);
  }

  async pressKey(key: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.keyboard.press(key as KeyInput);
  }

  async waitForText(text: string, options: { timeout?: number; visible?: boolean } = {}): Promise<boolean> {
    const page = this.getCurrentPage();
    const timeout = options.timeout ?? 30000;
    const visible = options.visible ?? true;

    try {
      await page.waitForFunction(
        (t: string, v: boolean) => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.some((el: Element) => 
            el.textContent?.includes(t) && (v ? (el as HTMLElement).offsetParent !== null : true)
          );
        },
        { timeout },
        text,
        visible
      );
      return true;
    } catch {
      return false;
    }
  }

  async waitForTextGone(text: string, timeout: number = 30000): Promise<boolean> {
    const page = this.getCurrentPage();
    try {
      await page.waitForFunction(
        (t: string) => {
          const elements = Array.from(document.querySelectorAll('*'));
          return !elements.some((el: Element) => el.textContent?.includes(t));
        },
        { timeout },
        text
      );
      return true;
    } catch {
      return false;
    }
  }

  async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async scroll(options: { x?: number; y?: number; selector?: string }): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();

    if (options.selector) {
      await page.waitForSelector(options.selector, { timeout: 5000 });
      await page.evaluate((sel: string) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, options.selector);
    } else {
      await page.evaluate((x: number, y: number) => {
        window.scrollTo(x, y);
      }, options.x ?? 0, options.y ?? 0);
    }
  }

  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    return page.$eval(selector, (el: Element, attr: string) => el.getAttribute(attr), attribute);
  }

  async getInputValue(selector: string): Promise<string> {
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    return page.$eval(selector, (el) => (el as HTMLInputElement).value);
  }

  async isVisible(selector: string): Promise<boolean> {
    const page = this.getCurrentPage();
    try {
      await page.waitForSelector(selector, { timeout: 1000 });
      return page.$eval(selector, (el: Element) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (el as HTMLElement).offsetParent !== null;
      });
    } catch {
      return false;
    }
  }

  async isEnabled(selector: string): Promise<boolean> {
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    return page.$eval(selector, (el) => !(el as HTMLInputElement).disabled);
  }

  async isChecked(selector: string): Promise<boolean> {
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    return page.$eval(selector, (el) => (el as HTMLInputElement).checked);
  }

  async getBoundingBox(selector: string): Promise<BoundingBox> {
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    return page.$eval(selector, (el: Element) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
  }

  async highlight(selector: string): Promise<void> {
    const page = this.getCurrentPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.$eval(selector, (el: Element) => {
      (el as HTMLElement).style.outline = '3px solid red';
      (el as HTMLElement).style.outlineOffset = '2px';
    });
  }

  async drag(sourceSelector: string, targetSelector: string): Promise<void> {
    this.checkLock();
    const page = this.getCurrentPage();
    await page.waitForSelector(sourceSelector, { timeout: 5000 });
    await page.waitForSelector(targetSelector, { timeout: 5000 });

    const source = await page.$(sourceSelector);
    const target = await page.$(targetSelector);

    if (!source || !target) {
      throw new Error('Element not found');
    }

    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding box');
    }

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();
  }

  async handleDialog(accept: boolean, promptText?: string): Promise<void> {
    const page = this.getCurrentPage();
    page.on('dialog', async (dialog) => {
      if (accept) {
        await dialog.accept(promptText);
      } else {
        await dialog.dismiss();
      }
    });
  }

  async resize(width: number, height: number): Promise<void> {
    const page = this.getCurrentPage();
    await page.setViewport({ width, height });
  }

  async getConsoleMessages(): Promise<ConsoleMessageInfo[]> {
    return [...this.consoleMessages];
  }

  async clearConsoleMessages(): Promise<void> {
    this.consoleMessages = [];
  }

  async getNetworkRequests(): Promise<NetworkRequestInfo[]> {
    return [...this.networkRequests];
  }

  async clearNetworkRequests(): Promise<void> {
    this.networkRequests = [];
  }

  async getTabs(): Promise<TabInfo[]> {
    const tabs: TabInfo[] = [];
    for (const [id, page] of this.pages.entries()) {
      tabs.push({
        id,
        url: page.url(),
        title: await page.title(),
      });
    }
    return tabs;
  }

  async newTab(): Promise<number> {
    this.checkLock();
    if (!this.browser) {
      throw new Error('Browser not launched');
    }

    const page = await this.browser.newPage();
    const tabId = this.nextTabId++;
    this.pages.set(tabId, page);
    this.currentPageId = tabId;
    this.setupPageListeners(page);

    return tabId;
  }

  async closeTab(tabId: number): Promise<void> {
    this.checkLock();
    const page = this.pages.get(tabId);
    if (page) {
      await page.close();
      this.pages.delete(tabId);

      if (this.currentPageId === tabId && this.pages.size > 0) {
        const firstTab = this.pages.keys().next().value;
        if (firstTab !== undefined) {
          this.currentPageId = firstTab;
        }
      }
    }
  }

  async switchTab(tabId: number): Promise<void> {
    const page = this.pages.get(tabId);
    if (!page) {
      throw new Error(`Tab ${tabId} not found`);
    }
    this.currentPageId = tabId;
  }

  async takeScreenshot(options?: { path?: string; fullPage?: boolean }): Promise<Buffer> {
    const page = this.getCurrentPage();
    return page.screenshot({
      path: options?.path,
      fullPage: options?.fullPage ?? false,
      encoding: 'binary',
    }) as Promise<Buffer>;
  }

  async search(query: string): Promise<{ text: string; selector: string }[]> {
    const page = this.getCurrentPage();
    return page.evaluate((q: string) => {
      const results: { text: string; selector: string }[] = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Node | null;
      while (node = walker.nextNode()) {
        const text = node.textContent?.trim();
        if (text && text.toLowerCase().includes(q.toLowerCase())) {
          const parent = node.parentElement;
          if (parent) {
            results.push({
              text: text.substring(0, 100),
              selector: parent.tagName.toLowerCase() + (parent.id ? `#${parent.id}` : ''),
            });
          }
        }
      }
      return results.slice(0, 20);
    }, query);
  }

  lock(): void {
    this.locked = true;
  }

  unlock(): void {
    this.locked = false;
  }

  isLocked(): boolean {
    return this.locked;
  }

  private checkLock(): void {
    if (this.locked) {
      throw new Error('Browser is locked. Unlock it first.');
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.pages.clear();
      this.consoleMessages = [];
      this.networkRequests = [];
      this.locked = false;
    }
  }
}
