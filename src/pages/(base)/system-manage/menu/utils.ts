import type { TreeDataNode } from 'antd';

// 扩展 TreeDataNode 类型以支持 value 属性
interface TreeSelectNode extends TreeDataNode {
  value: string;
}

/** 转换菜单数据为树形选择器数据 */
export function transformMenuToTreeSelect(menus: Api.Menu.Tree[] | null, includeRoot = true): TreeSelectNode[] {
  if (!menus) return [];

  const transformNode = (menu: Api.Menu.Tree): TreeSelectNode => ({
    children: menu.children ? menu.children.map(transformNode) : undefined,
    key: menu.id,
    title: menu.name,
    value: menu.id
  });

  const treeData = menus.map(transformNode);

  if (includeRoot) {
    return [
      {
        children: treeData,
        key: '0',
        title: '顶层菜单',
        value: '0'
      }
    ];
  }

  return treeData;
}

/** 转换菜单数据为树组件数据 */
export function transformMenuToTree(menus: Api.Menu.Tree[] | null): Api.Menu.Tree[] {
  if (!menus) return [];
  return menus;
}

/** 转换表单数据（布尔值转数字） */
export function transformFormDataForSubmit(formData: any): Api.Menu.Tree {
  return {
    ...formData,
    display: formData.display ? 1 : 0,
    external: formData.external ? 1 : 0,
    external_way: formData.external_way ? 1 : 0
  };
}

/** 转换菜单数据为表单数据（数字转布尔值） */
export function transformMenuDataForForm(menuData: Api.Menu.Tree): any {
  return {
    ...menuData,
    display: menuData.display === 1,
    external: menuData.external === 1,
    external_way: menuData.external_way === 1
  };
}

/** 查找菜单节点 */
export function findMenuNode(menus: Api.Menu.Tree[], id: string): Api.Menu.Tree | null {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }
    if (menu.children) {
      const found = findMenuNode(menu.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** 获取菜单的所有子节点 ID */
export function getChildrenIds(menu: Api.Menu.Tree): string[] {
  const ids: string[] = [menu.id];

  if (menu.children && menu.children.length > 0) {
    menu.children.forEach(child => {
      ids.push(...getChildrenIds(child));
    });
  }

  return ids;
}

/** 验证是否为有效的图标名称 */
export function isValidIcon(icon: string): boolean {
  return /^i-[a-z0-9-]+/.test(icon);
}

/** 生成菜单唯一标识 */
export function generateMenuSymbol(name: string, parentSymbol?: string): string {
  const baseSymbol = name.toLowerCase().replace(/\s+/g, '_');
  return parentSymbol ? `${parentSymbol}:${baseSymbol}` : baseSymbol;
}
