import { Modal, Tree } from 'antd';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

import { fetchMenuTree } from '@/service/api/menu';

interface AssignPermissionModalProps {
  defaultCheckedKeys?: number[];
  onCancel: () => void;
  onOk: (selectedKeys: number[]) => void;
  open: boolean;
}

export const AssignPermissionModal: React.FC<AssignPermissionModalProps> = ({
  defaultCheckedKeys = [],
  onCancel,
  onOk,
  open
}) => {
  const [selectedKeys, setSelectedKeys] = useState<number[]>(defaultCheckedKeys);
  const [menuTree, setMenuTree] = useState<Api.Menu.Tree[]>([]);

  const loadMenuTree = useCallback(async () => {
    try {
      const res = await fetchMenuTree();
      if (res.data) {
        setMenuTree(res.data);
      }
    } catch {
      // 加载菜单树失败，静默处理
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadMenuTree();
      setSelectedKeys(defaultCheckedKeys);
    }
  }, [open, defaultCheckedKeys, loadMenuTree]);

  const handleOk = () => {
    onOk(selectedKeys);
  };

  const handleCheck = (checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    const checkedKeys = Array.isArray(checked) ? checked : checked.checked;
    setSelectedKeys(checkedKeys.map(key => Number(key)));
  };

  return (
    <Modal
      cancelText="取消"
      okText="确定"
      open={open}
      title="分配权限"
      width={600}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Tree
        checkable
        defaultExpandAll
        checkedKeys={selectedKeys}
        treeData={menuTree}
        fieldNames={{
          children: 'children',
          key: 'id',
          title: 'name'
        }}
        onCheck={handleCheck}
      />
    </Modal>
  );
};

AssignPermissionModal.propTypes = {
  defaultCheckedKeys: PropTypes.arrayOf(PropTypes.number),
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};
