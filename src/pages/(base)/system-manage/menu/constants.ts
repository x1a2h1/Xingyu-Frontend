import { routeMap } from "@/router/elegant/routeMap";

/**
 * 获取所有页面路由选项
 */
export function getPageOptions() {
  const allPages = Object.keys(routeMap)
    .filter(
      (key) =>
        !key.includes("not-found") &&
        !key.includes("exception") &&
        key !== "root",
    )
    .map((key) => key.replace(/^\(base\)_|^\(blank\)_/, "").replace(/_/g, "/"));

  return allPages.map((page) => ({
    label: page,
    value: page,
  }));
}

/**
 * 菜单类型选项
 */
export const MENU_TYPE_OPTIONS = [
  { label: "目录", value: 1 },
  { label: "菜单", value: 2 },
];

/**
 * 图标类型选项
 */
export const ICON_TYPE_OPTIONS = [
  { label: "Iconify 图标", value: 1 },
  { label: "本地图标", value: 2 },
];

/**
 * 可用图标列表
 */
export const ICON_LIST = [
  "i-mage-dash-menu",
  "i-mage-bookmark-fill",
  "i-mage-dashboard-bar-notification",
  "i-mage-chart-15",
  "i-mage-dashboard",
  "i-mage-id-card",
  "i-mage-message",
  "i-mage-alarm-clock",
  "i-mage-align-center",
  "i-mage-align-left",
  "i-mage-settings",
  "i-ant-design-home-outlined",
  "i-ant-design-user-outlined",
  "i-ant-design-setting-outlined",
  "i-ant-design-file-outlined",
  "i-ant-design-folder-outlined",
];

/**
 * 表单验证规则
 */
export const FORM_RULES = {
  name: [
    { required: true, message: "请输入菜单名称" },
    { max: 50, message: "菜单名称不能超过50个字符" },
  ],
  parent_id: [{ required: true, message: "请选择父级菜单" }],
  path: [{ pattern: /^\//, message: "路径必须以 / 开头" }],
  url: [
    {
      pattern: /^https?:\/\//,
      message: "外链地址必须以 http:// 或 https:// 开头",
    },
  ],
  symbol: [
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_:]*$/,
      message: "权限标识格式不正确，应为字母开头的标识符",
    },
  ],
};

/**
 * 默认表单值
 */
export const DEFAULT_FORM_VALUES: Partial<Api.Menu.Tree> = {
  display: 1,
  external: 0,
  external_way: 0,
  sort_num: 1,
  parent_id: 0,
};
