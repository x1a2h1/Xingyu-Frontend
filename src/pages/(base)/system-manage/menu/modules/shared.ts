/**
 * 获取页面选项
 *
 * @param routeName 当前路由名称
 * @param allPages 所有页面列表
 */
export function getPageOptions(routeName: string, allPages: string[]) {
  if (routeName && !allPages.includes(routeName)) {
    allPages.unshift(routeName);
  }

  const opts: CommonType.Option[] = allPages.map(page => ({
    label: page,
    value: page
  }));

  return opts;
}

/** 验证菜单路径格式 */
export function validateMenuPath(path: string): boolean {
  return /^\/[a-z0-9\-/]*$/.test(path);
}

/** 验证外链URL格式 */
export function validateExternalUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}

/** 生成菜单路径建议 */
export function generateMenuPath(name: string, parentPath?: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (parentPath && parentPath !== '/') {
    return `${parentPath}/${cleanName}`;
  }

  return `/${cleanName}`;
}

/** 获取菜单层级 */
export function getMenuLevel(menu: Api.Menu.Tree, allMenus: Api.Menu.Tree[]): number {
  let level = 1;
  let currentParentId = menu.parent_id;

  while (currentParentId && currentParentId !== 0) {
    const parent = findMenuById(allMenus, currentParentId.toString());
    if (parent) {
      level += 1;
      currentParentId = parent.parent_id;
    } else {
      break;
    }
  }

  return level;
}

/** 根据ID查找菜单 */
export function findMenuById(menus: Api.Menu.Tree[], id: string): Api.Menu.Tree | null {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }
    if (menu.children) {
      const found = findMenuById(menu.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** 获取菜单的完整路径（面包屑） */
export function getMenuBreadcrumb(menu: Api.Menu.Tree, allMenus: Api.Menu.Tree[]): string[] {
  const breadcrumb: string[] = [menu.name];
  let currentParentId = menu.parent_id;

  while (currentParentId && currentParentId !== 0) {
    const parent = findMenuById(allMenus, currentParentId.toString());
    if (parent) {
      breadcrumb.unshift(parent.name);
      currentParentId = parent.parent_id;
    } else {
      break;
    }
  }

  return breadcrumb;
}

/** 检查菜单是否可以被删除（没有子菜单） */
export function canDeleteMenu(menu: Api.Menu.Tree): boolean {
  return !menu.children || menu.children.length === 0;
}

/** 排序菜单列表 */
export function sortMenus(menus: Api.Menu.Tree[]): Api.Menu.Tree[] {
  return menus
    .sort((a, b) => {
      // 先按 sort_num 排序，再按名称排序
      if (a.sort_num !== b.sort_num) {
        return a.sort_num - b.sort_num;
      }
      return a.name.localeCompare(b.name);
    })
    .map(menu => ({
      ...menu,
      children: menu.children ? sortMenus(menu.children) : undefined
    }));
}

/** 扁平化菜单树 */
export function flattenMenuTree(menus: Api.Menu.Tree[]): Api.Menu.Tree[] {
  const result: Api.Menu.Tree[] = [];

  const traverse = (items: Api.Menu.Tree[]) => {
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        traverse(item.children);
      }
    });
  };

  traverse(menus);
  return result;
}

/** 构建菜单映射表 */
export function buildMenuMap(menus: Api.Menu.Tree[]): Map<string, Api.Menu.Tree> {
  const map = new Map<string, Api.Menu.Tree>();
  const flatMenus = flattenMenuTree(menus);

  flatMenus.forEach(menu => {
    map.set(menu.id, menu);
  });

  return map;
}
