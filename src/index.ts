#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { BrowserClient } from './browser.js';

const browser = new BrowserClient();

const server = new Server(
  {
    name: 'mcp-cursor-ide-browser',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'browser_navigate',
        description: '打开/跳转到指定URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: '要导航到的URL',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'browser_snapshot',
        description: '获取页面可访问性快照（比截图更适合自动化）',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'browser_click',
        description: '点击页面元素',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_type',
        description: '在输入框中输入文字（不清空现有内容）',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
            text: {
              type: 'string',
              description: '要输入的文字',
            },
          },
          required: ['selector', 'text'],
        },
      },
      {
        name: 'browser_fill',
        description: '清空并填入输入框',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
            text: {
              type: 'string',
              description: '要填入的文字',
            },
          },
          required: ['selector', 'text'],
        },
      },
      {
        name: 'browser_fill_form',
        description: '批量填写表单',
        inputSchema: {
          type: 'object',
          properties: {
            fields: {
              type: 'object',
              description: '表单字段映射，key为CSS选择器，value为填入的值',
              additionalProperties: { type: 'string' },
            },
          },
          required: ['fields'],
        },
      },
      {
        name: 'browser_hover',
        description: '鼠标悬停在元素上',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_select_option',
        description: '选择下拉选项',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
            value: {
              type: 'string',
              description: '要选择的选项值',
            },
          },
          required: ['selector', 'value'],
        },
      },
      {
        name: 'browser_press_key',
        description: '按键（支持组合键，如Enter, Ctrl+A, Meta+Enter等）',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: '按键名称或组合键',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'browser_wait_for',
        description: '等待文字出现、消失或等待指定时间',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: '要等待的文字（与timeout二选一）',
            },
            timeout: {
              type: 'number',
              description: '等待时间（毫秒，与text二选一）',
            },
            visible: {
              type: 'boolean',
              description: '文字是否可见（默认true）',
              default: true,
            },
            waitForGone: {
              type: 'boolean',
              description: '是否等待文字消失（默认false）',
              default: false,
            },
          },
          required: [],
        },
      },
      {
        name: 'browser_navigate_back',
        description: '后退到上一页',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'browser_navigate_forward',
        description: '前进到下一页',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'browser_reload',
        description: '刷新当前页面',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'browser_scroll',
        description: '滚动页面或元素',
        inputSchema: {
          type: 'object',
          properties: {
            x: {
              type: 'number',
              description: '水平滚动位置',
            },
            y: {
              type: 'number',
              description: '垂直滚动位置',
            },
            selector: {
              type: 'string',
              description: '滚动到指定元素（与x/y互斥）',
            },
          },
          required: [],
        },
      },
      {
        name: 'browser_get_attribute',
        description: '读取元素属性',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
            attribute: {
              type: 'string',
              description: '属性名称',
            },
          },
          required: ['selector', 'attribute'],
        },
      },
      {
        name: 'browser_get_input_value',
        description: '读取输入框的值',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_is_visible',
        description: '检查元素是否可见',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_is_enabled',
        description: '检查元素是否启用',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_is_checked',
        description: '检查复选框/单选框是否勾选',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_get_bounding_box',
        description: '获取元素边界框',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_highlight',
        description: '高亮元素（调试用）',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'browser_drag',
        description: '拖拽元素',
        inputSchema: {
          type: 'object',
          properties: {
            sourceSelector: {
              type: 'string',
              description: '源元素CSS选择器',
            },
            targetSelector: {
              type: 'string',
              description: '目标元素CSS选择器',
            },
          },
          required: ['sourceSelector', 'targetSelector'],
        },
      },
      {
        name: 'browser_handle_dialog',
        description: '处理alert/confirm/prompt对话框',
        inputSchema: {
          type: 'object',
          properties: {
            accept: {
              type: 'boolean',
              description: '是否接受对话框',
            },
            promptText: {
              type: 'string',
              description: 'prompt对话框的输入文本',
            },
          },
          required: ['accept'],
        },
      },
      {
        name: 'browser_resize',
        description: '调整浏览器窗口大小',
        inputSchema: {
          type: 'object',
          properties: {
            width: {
              type: 'number',
              description: '宽度（像素）',
            },
            height: {
              type: 'number',
              description: '高度（像素）',
            },
          },
          required: ['width', 'height'],
        },
      },
      {
        name: 'browser_console_messages',
        description: '获取控制台消息',
        inputSchema: {
          type: 'object',
          properties: {
            clear: {
              type: 'boolean',
              description: '是否清空消息列表',
              default: false,
            },
          },
          required: [],
        },
      },
      {
        name: 'browser_network_requests',
        description: '获取网络请求列表',
        inputSchema: {
          type: 'object',
          properties: {
            clear: {
              type: 'boolean',
              description: '是否清空请求列表',
              default: false,
            },
          },
          required: [],
        },
      },
      {
        name: 'browser_tabs',
        description: '标签页操作',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'new', 'close', 'switch'],
              description: '操作类型',
            },
            tabId: {
              type: 'number',
              description: '标签页ID（用于close和switch操作）',
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'browser_take_screenshot',
        description: '截图',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: '保存路径（可选）',
            },
            fullPage: {
              type: 'boolean',
              description: '是否截取整个页面',
              default: false,
            },
          },
          required: [],
        },
      },
      {
        name: 'browser_search',
        description: '页面内搜索（类似Ctrl+F）',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索关键词',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'browser_lock',
        description: '锁定浏览器（自动化时防误触）',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'browser_unlock',
        description: '解锁浏览器',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('No arguments provided');
  }

  try {
    switch (name) {
      case 'browser_navigate': {
        const url = args.url as string;
        await browser.launch();
        await browser.navigate(url);
        return { content: [{ type: 'text', text: `Navigated to: ${url}` }] };
      }

      case 'browser_snapshot': {
        await browser.launch();
        const snapshot = await browser.snapshot();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(snapshot, null, 2)
          }]
        };
      }

      case 'browser_click': {
        const selector = args.selector as string;
        await browser.click(selector);
        return { content: [{ type: 'text', text: `Clicked: ${selector}` }] };
      }

      case 'browser_type': {
        const selector = args.selector as string;
        const text = args.text as string;
        await browser.type(selector, text);
        return { content: [{ type: 'text', text: `Typed "${text}" into: ${selector}` }] };
      }

      case 'browser_fill': {
        const selector = args.selector as string;
        const text = args.text as string;
        await browser.fill(selector, text);
        return { content: [{ type: 'text', text: `Filled "${text}" into: ${selector}` }] };
      }

      case 'browser_fill_form': {
        const fields = args.fields as Record<string, string>;
        await browser.fillForm(fields);
        return {
          content: [{
            type: 'text',
            text: `Filled form with ${Object.keys(fields).length} fields`
          }]
        };
      }

      case 'browser_hover': {
        const selector = args.selector as string;
        await browser.hover(selector);
        return { content: [{ type: 'text', text: `Hovered over: ${selector}` }] };
      }

      case 'browser_select_option': {
        const selector = args.selector as string;
        const value = args.value as string;
        await browser.selectOption(selector, value);
        return { content: [{ type: 'text', text: `Selected "${value}" in: ${selector}` }] };
      }

      case 'browser_press_key': {
        const key = args.key as string;
        await browser.pressKey(key);
        return { content: [{ type: 'text', text: `Pressed key: ${key}` }] };
      }

      case 'browser_wait_for': {
        const text = args.text as string | undefined;
        const timeout = args.timeout as number | undefined;
        const visible = args.visible as boolean ?? true;
        const waitForGone = args.waitForGone as boolean ?? false;

        if (timeout !== undefined) {
          await browser.wait(timeout);
          return { content: [{ type: 'text', text: `Waited ${timeout}ms` }] };
        } else if (text !== undefined) {
          let result: boolean;
          if (waitForGone) {
            result = await browser.waitForTextGone(text);
          } else {
            result = await browser.waitForText(text, { visible });
          }
          return {
            content: [{
              type: 'text',
              text: result ? `Text "${text}" found` : `Text "${text}" not found`
            }]
          };
        } else {
          throw new Error('Either "text" or "timeout" must be provided');
        }
      }

      case 'browser_navigate_back': {
        await browser.navigateBack();
        return { content: [{ type: 'text', text: 'Navigated back' }] };
      }

      case 'browser_navigate_forward': {
        await browser.navigateForward();
        return { content: [{ type: 'text', text: 'Navigated forward' }] };
      }

      case 'browser_reload': {
        await browser.reload();
        return { content: [{ type: 'text', text: 'Page reloaded' }] };
      }

      case 'browser_scroll': {
        const x = args.x as number | undefined;
        const y = args.y as number | undefined;
        const selector = args.selector as string | undefined;
        await browser.scroll({ x, y, selector });
        return { content: [{ type: 'text', text: 'Scrolled' }] };
      }

      case 'browser_get_attribute': {
        const selector = args.selector as string;
        const attribute = args.attribute as string;
        const value = await browser.getAttribute(selector, attribute);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ selector, attribute, value }, null, 2)
          }]
        };
      }

      case 'browser_get_input_value': {
        const selector = args.selector as string;
        const value = await browser.getInputValue(selector);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ selector, value }, null, 2)
          }]
        };
      }

      case 'browser_is_visible': {
        const selector = args.selector as string;
        const visible = await browser.isVisible(selector);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ selector, visible }, null, 2)
          }]
        };
      }

      case 'browser_is_enabled': {
        const selector = args.selector as string;
        const enabled = await browser.isEnabled(selector);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ selector, enabled }, null, 2)
          }]
        };
      }

      case 'browser_is_checked': {
        const selector = args.selector as string;
        const checked = await browser.isChecked(selector);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ selector, checked }, null, 2)
          }]
        };
      }

      case 'browser_get_bounding_box': {
        const selector = args.selector as string;
        const box = await browser.getBoundingBox(selector);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ selector, box }, null, 2)
          }]
        };
      }

      case 'browser_highlight': {
        const selector = args.selector as string;
        await browser.highlight(selector);
        return { content: [{ type: 'text', text: `Highlighted: ${selector}` }] };
      }

      case 'browser_drag': {
        const sourceSelector = args.sourceSelector as string;
        const targetSelector = args.targetSelector as string;
        await browser.drag(sourceSelector, targetSelector);
        return {
          content: [{
            type: 'text',
            text: `Dragged from ${sourceSelector} to ${targetSelector}`
          }]
        };
      }

      case 'browser_handle_dialog': {
        const accept = args.accept as boolean;
        const promptText = args.promptText as string | undefined;
        await browser.handleDialog(accept, promptText);
        return {
          content: [{
            type: 'text',
            text: accept ? 'Dialog accepted' : 'Dialog dismissed'
          }]
        };
      }

      case 'browser_resize': {
        const width = args.width as number;
        const height = args.height as number;
        await browser.resize(width, height);
        return {
          content: [{
            type: 'text',
            text: `Resized to ${width}x${height}`
          }]
        };
      }

      case 'browser_console_messages': {
        const clear = args.clear as boolean ?? false;
        if (clear) {
          await browser.clearConsoleMessages();
        }
        const messages = await browser.getConsoleMessages();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(messages, null, 2)
          }]
        };
      }

      case 'browser_network_requests': {
        const clear = args.clear as boolean ?? false;
        if (clear) {
          await browser.clearNetworkRequests();
        }
        const requests = await browser.getNetworkRequests();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(requests, null, 2)
          }]
        };
      }

      case 'browser_tabs': {
        const action = args.action as string;
        const tabId = args.tabId as number | undefined;

        switch (action) {
          case 'list': {
            const tabs = await browser.getTabs();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(tabs, null, 2)
              }]
            };
          }
          case 'new': {
            const newTabId = await browser.newTab();
            return {
              content: [{
                type: 'text',
                text: `New tab created with ID: ${newTabId}`
              }]
            };
          }
          case 'close': {
            if (tabId === undefined) {
              throw new Error('tabId is required for close action');
            }
            await browser.closeTab(tabId);
            return {
              content: [{
                type: 'text',
                text: `Tab ${tabId} closed`
              }]
            };
          }
          case 'switch': {
            if (tabId === undefined) {
              throw new Error('tabId is required for switch action');
            }
            await browser.switchTab(tabId);
            return {
              content: [{
                type: 'text',
                text: `Switched to tab ${tabId}`
              }]
            };
          }
          default:
            throw new Error(`Unknown tab action: ${action}`);
        }
      }

      case 'browser_take_screenshot': {
        const path = args.path as string | undefined;
        const fullPage = args.fullPage as boolean ?? false;
        const buffer = await browser.takeScreenshot({ path, fullPage });
        
        if (path) {
          return {
            content: [{
              type: 'text',
              text: `Screenshot saved to: ${path}`
            }]
          };
        } else {
          return {
            content: [{
              type: 'text',
              text: `Screenshot taken (${buffer.length} bytes)`
            }]
          };
        }
      }

      case 'browser_search': {
        const query = args.query as string;
        const results = await browser.search(query);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(results, null, 2)
          }]
        };
      }

      case 'browser_lock': {
        browser.lock();
        return { content: [{ type: 'text', text: 'Browser locked' }] };
      }

      case 'browser_unlock': {
        browser.unlock();
        return { content: [{ type: 'text', text: 'Browser unlocked' }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Browser Server running...');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
