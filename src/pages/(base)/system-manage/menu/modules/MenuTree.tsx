import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Tree } from 'antd';
import type { TreeProps } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';

import { transformMenuToTree } from '../utils';

const { Search } = Input;

interface MenuTreeProps {
  /** 是否加载中 */
  loading: boolean;
  /** 新增菜单回调 */
  onAdd: () => void;
  /** 刷新菜单树回调 */
  onRefresh: () => void;
  /** 树节点选择回调 */
  onSelect: (selectedKeys: string[], info: any) => void;
  /** 选中的菜单节点 */
  selectedKeys: string[];
  /** 菜单树数据 */
  treeData: Api.Menu.Tree[] | null;
}

export const MenuTree = ({ loading, onAdd, onRefresh, onSelect, selectedKeys, treeData }: MenuTreeProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // 转换菜单数据为树组件格式
  const transformedTreeData = transformMenuToTree(treeData);

  // 搜索功能
  const getParentKey = (key: string, tree: Api.Menu.Tree[]): string => {
    let parentKey = '';
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.id === key)) {
          parentKey = node.id;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    if (!transformedTreeData) return;

    const expandedKeySet = new Set<string>();

    if (value) {
      // 查找匹配的节点
      const findMatchedKeys = (data: Api.Menu.Tree[]): string[] => {
        const matchedKeys: string[] = [];
        const traverse = (nodes: Api.Menu.Tree[]) => {
          nodes.forEach(node => {
            if (node.name.toLowerCase().includes(value.toLowerCase())) {
              matchedKeys.push(node.id);
              // 展开父节点
              let parentKey = getParentKey(node.id, transformedTreeData);
              while (parentKey) {
                expandedKeySet.add(parentKey);
                parentKey = getParentKey(parentKey, transformedTreeData);
              }
            }
            if (node.children) {
              traverse(node.children);
            }
          });
        };
        traverse(data);
        return matchedKeys;
      };

      findMatchedKeys(transformedTreeData);
      setExpandedKeys(Array.from(expandedKeySet));
      setAutoExpandParent(true);
    } else {
      setExpandedKeys([]);
      setAutoExpandParent(false);
    }

    setSearchValue(value);
  };

  // 树节点展开
  const handleExpand = (expandedKeysValue: Key[]) => {
    setExpandedKeys(expandedKeysValue as string[]);
    setAutoExpandParent(false);
  };

  // 渲染树节点标题（高亮搜索关键词）
  const renderTitle = (node: Api.Menu.Tree) => {
    const title = node.name;
    if (!searchValue) return title;

    const index = title.toLowerCase().indexOf(searchValue.toLowerCase());
    if (index === -1) return title;

    const beforeStr = title.substring(0, index);
    const searchStr = title.substring(index, index + searchValue.length);
    const afterStr = title.substring(index + searchValue.length);

    return (
      <span>
        {beforeStr}
        <span className="bg-yellow-200 text-red-500">{searchStr}</span>
        {afterStr}
      </span>
    );
  };

  // 构建树数据
  const buildTreeData = (data: Api.Menu.Tree[]): any[] => {
    return data.map(item => ({
      children: item.children ? buildTreeData(item.children) : undefined,
      icon: item.icon ? <div className={`${item.icon} text-sm`} /> : null,
      key: item.id,
      title: renderTitle(item)
    }));
  };

  const finalTreeData = transformedTreeData ? buildTreeData(transformedTreeData) : [];

  const handleTreeSelect = (selectedKeysValue: Key[], info: any) => {
    onSelect(selectedKeysValue as string[], info);
  };

  const treeProps: TreeProps = {
    autoExpandParent,
    expandedKeys,
    onExpand: handleExpand,
    onSelect: handleTreeSelect,
    selectedKeys,
    showIcon: true,
    showLine: { showLeafIcon: false },
    treeData: finalTreeData
  };

  return (
    <Card
      title="菜单树"
      extra={
        <Space>
          <Button
            icon={<PlusOutlined />}
            size="small"
            type="primary"
            onClick={onAdd}
          >
            新增
          </Button>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            size="small"
            onClick={onRefresh}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <div className="mb-4">
        <Search
          allowClear
          placeholder="搜索菜单..."
          prefix={<SearchOutlined />}
          onChange={e => !e.target.value && handleSearch('')}
          onSearch={handleSearch}
        />
      </div>

      <div className="max-h-96 min-h-96 overflow-y-auto">
        {finalTreeData.length > 0 ? (
          <Tree {...treeProps} />
        ) : (
          <div className="py-8 text-center text-gray-500">{loading ? '加载中...' : '暂无菜单数据'}</div>
        )}
      </div>
    </Card>
  );
};
