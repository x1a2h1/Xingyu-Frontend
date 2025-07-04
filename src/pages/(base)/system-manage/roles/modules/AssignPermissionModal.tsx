import { useEffect, useState } from "react";

import { Modal, Tree } from "antd";

import { fetchMenuTree } from "@/service/api/menu";

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
  open,
}) => {
  const [selectedKeys, setSelectedKeys] =
    useState<number[]>(defaultCheckedKeys);
  const [menuTree, setMenuTree] = useState<Api.Menu.Tree[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadMenuTree();
      setSelectedKeys(defaultCheckedKeys);
    }
  }, [open, defaultCheckedKeys]);

  const loadMenuTree = async () => {
    try {
      setLoading(true);
      const res = await fetchMenuTree();
      if (res.data) {
        setMenuTree(res.data);
      }
    } catch (error) {
      console.error("加载菜单树失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    onOk(selectedKeys);
  };

  const handleCheck = (
    checked: string[] | { checked: string[]; halfChecked: string[] },
  ) => {
    const checkedKeys = Array.isArray(checked) ? checked : checked.checked;
    setSelectedKeys(checkedKeys.map((key) => Number(key)));
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
        checkedKeys={selectedKeys}
        defaultExpandAll
        fieldNames={{
          children: "children",
          key: "id",
          title: "name",
        }}
        loading={loading}
        treeData={menuTree}
        onCheck={handleCheck}
      />
    </Modal>
  );
};
