import { useEffect, useState } from "react";

import { Col, Form, Row, message } from "antd";
import { useRequest } from "@sa/hooks";

import {
  fetchDeleteMenu,
  fetchMenuTree,
  fetchPostMenu,
  fetchPutMenu,
} from "@/service/api/menu";

import { DEFAULT_FORM_VALUES } from "./constants";
import { MenuForm } from "./modules/MenuForm";
import { MenuTree } from "./modules/MenuTree";
import { findMenuNode, transformMenuDataForForm } from "./utils";

const MenuManage = () => {
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState("");

  // 获取菜单树
  const {
    data: menuTree,
    loading: treeLoading,
    run: getMenuTree,
  } = useRequest(fetchMenuTree, {
    manual: true,
  });

  // 处理重置表单
  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue(DEFAULT_FORM_VALUES);
    setIsEdit(false);
    setSelectedKeys([]);
    setCurrentMenuId("");
  };

  // 创建菜单
  const { loading: createLoading, run: createMenu } = useRequest(
    fetchPostMenu,
    {
      manual: true,
      onError: (error) => {
        message.error(`创建失败: ${error.message}`);
      },
      onSuccess: () => {
        message.success("菜单创建成功");
        getMenuTree();
        handleReset();
      },
    },
  );

  // 更新菜单
  const { loading: updateLoading, run: updateMenu } = useRequest(fetchPutMenu, {
    manual: true,
    onError: (error) => {
      message.error(`更新失败: ${error.message}`);
    },
    onSuccess: () => {
      message.success("菜单更新成功");
      getMenuTree();
    },
  });

  // 删除菜单
  const { loading: deleteLoading, run: deleteMenu } = useRequest(
    fetchDeleteMenu,
    {
      manual: true,
      onError: (error) => {
        message.error(`删除失败: ${error.message}`);
      },
      onSuccess: () => {
        message.success("菜单删除成功");
        getMenuTree();
        handleReset();
      },
    },
  );

  const loading = createLoading || updateLoading || deleteLoading;

  useEffect(() => {
    getMenuTree();
  }, [getMenuTree]);

  // 处理树节点选择
  const handleTreeSelect = (
    selectedKeysValue: string[],
    { node: _node }: { node: any },
  ) => {
    if (selectedKeysValue.length === 0) return;

    const selectedKey = selectedKeysValue[0];
    setSelectedKeys([selectedKey]);
    setCurrentMenuId(selectedKey);

    // 查找对应的菜单数据
    if (menuTree) {
      const menuData = findMenuNode(menuTree, selectedKey);
      if (menuData) {
        const formData = transformMenuDataForForm(menuData);
        form.setFieldsValue(formData);
        setIsEdit(true);
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: Api.Menu.Tree) => {
    try {
      if (isEdit && currentMenuId) {
        await updateMenu(currentMenuId, values);
      } else {
        await createMenu(values);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("表单提交失败:", error);
    }
  };

  // 处理删除菜单
  const handleDelete = async () => {
    if (!currentMenuId) {
      message.warning("请先选择要删除的菜单");
      return;
    }

    try {
      // 检查是否有子菜单
      if (menuTree) {
        const menuData = findMenuNode(menuTree, currentMenuId);
        if (menuData && menuData.children && menuData.children.length > 0) {
          message.warning("该菜单包含子菜单，请先删除子菜单");
          return;
        }
      }

      await deleteMenu(currentMenuId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("删除菜单失败:", error);
    }
  };

  // 处理新增菜单
  const handleAdd = () => {
    handleReset();
  };

  // 处理刷新菜单树
  const handleRefresh = () => {
    getMenuTree();
  };

  return (
    <div className="p-6">
      <Row gutter={24}>
        {/* 左侧菜单树 */}
        <Col lg={8} md={8} sm={24} xl={6} xs={24}>
          <MenuTree
            loading={treeLoading}
            selectedKeys={selectedKeys}
            treeData={menuTree}
            onAdd={handleAdd}
            onRefresh={handleRefresh}
            onSelect={handleTreeSelect}
          />
        </Col>

        {/* 右侧表单 */}
        <Col lg={16} md={16} sm={24} xl={18} xs={24}>
          <MenuForm
            form={form}
            iconModalOpen={iconModalOpen}
            isEdit={isEdit}
            loading={loading}
            setIconModalOpen={setIconModalOpen}
            treeData={menuTree}
            onDelete={handleDelete}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />
        </Col>
      </Row>
    </div>
  );
};

export default MenuManage;
