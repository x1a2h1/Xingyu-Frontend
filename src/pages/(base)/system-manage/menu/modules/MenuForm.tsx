import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Switch, TreeSelect } from 'antd';

import { DEFAULT_FORM_VALUES, FORM_RULES, getPageOptions } from '../constants';
import { transformFormDataForSubmit, transformMenuToTreeSelect } from '../utils';

import { IconModal } from './IconModal';

interface MenuFormProps {
  /** 表单实例 */
  form: any;
  /** 图标选择模态框状态 */
  iconModalOpen: boolean;
  /** 是否为编辑模式 */
  isEdit: boolean;
  /** 是否加载中 */
  loading: boolean;
  /** 删除菜单回调 */
  onDelete: () => Promise<void>;
  /** 重置表单回调 */
  onReset: () => void;
  /** 表单提交回调 */
  onSubmit: (values: any) => Promise<void>;
  /** 设置图标选择模态框状态 */
  setIconModalOpen: (open: boolean) => void;
  /** 菜单树数据 */
  treeData: Api.Menu.Tree[] | null;
}

export const MenuForm = ({
  form,
  iconModalOpen,
  isEdit,
  loading,
  onDelete,
  onReset,
  onSubmit,
  setIconModalOpen,
  treeData
}: MenuFormProps) => {
  const pageOptions = getPageOptions();
  const treeSelectData = transformMenuToTreeSelect(treeData);

  // 监听表单值变化，自动生成权限标识
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const currentSymbol = form.getFieldValue('symbol');

    // 如果权限标识为空或者是基于旧名称生成的，则自动生成新的
    if (!currentSymbol || !currentSymbol.includes(':')) {
      const symbol = name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      form.setFieldsValue({ symbol });
    }
  };

  // 设置图标
  const handleSetIcon = (icon: string) => {
    form.setFieldsValue({ icon });
    setIconModalOpen(false);
  };

  // 表单提交
  const handleSubmit = async (values: any) => {
    try {
      const submitData = transformFormDataForSubmit(values);
      await onSubmit(submitData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('表单提交失败:', error);
    }
  };

  // 获取当前图标值
  const currentIcon = Form.useWatch('icon', form);

  return (
    <ACard title={isEdit ? '编辑菜单' : '新增菜单'}>
      <Form
        autoComplete="off"
        form={form}
        initialValues={DEFAULT_FORM_VALUES}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="父级菜单"
              name="parent_id"
              rules={FORM_RULES.parent_id}
            >
              <TreeSelect
                showSearch
                treeDefaultExpandAll
                filterTreeNode={(search, node) => (node.title as string)?.toLowerCase().includes(search.toLowerCase())}
                placeholder="请选择父级菜单"
                treeData={treeSelectData}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="菜单名称"
              name="name"
              rules={FORM_RULES.name}
            >
              <Input
                placeholder="请输入菜单名称"
                onChange={handleNameChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="权限标识"
              name="symbol"
              rules={FORM_RULES.symbol}
            >
              <Input placeholder="如: menu:read" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="页面组件"
              name="page"
            >
              <Select
                allowClear
                showSearch
                options={pageOptions}
                placeholder="选择页面组件"
                filterOption={(input, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="访问路径"
              name="path"
              rules={FORM_RULES.path}
            >
              <Input placeholder="如: /system-manage/menu" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="菜单图标"
              name="icon"
            >
              <div className="flex gap-2">
                <Button
                  className="h-10 w-16 flex items-center justify-center"
                  type="default"
                  onClick={() => setIconModalOpen(true)}
                >
                  {currentIcon ? <div className={`${currentIcon} text-lg`} /> : <span className="text-xs">选择</span>}
                </Button>
                <Input
                  readOnly
                  placeholder="请选择图标"
                  value={currentIcon}
                />
              </div>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="外链地址"
              name="url"
              rules={FORM_RULES.url}
            >
              <Input placeholder="如: https://example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="菜单排序"
              name="sort_num"
            >
              <InputNumber
                max={9999}
                min={0}
                placeholder="请输入排序号"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <div className="flex gap-8 pt-8">
              <Form.Item
                label="是否可见"
                name="display"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="可见"
                  unCheckedChildren="隐藏"
                />
              </Form.Item>

              <Form.Item
                label="是否外链"
                name="external"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="外链"
                  unCheckedChildren="内部"
                />
              </Form.Item>

              <Form.Item
                label="外链方式"
                name="external_way"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="新窗口"
                  unCheckedChildren="当前窗口"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button
              htmlType="submit"
              icon={isEdit ? <SaveOutlined /> : <PlusOutlined />}
              loading={loading}
              type="primary"
            >
              {isEdit ? '保存' : '新增'}
            </Button>

            {isEdit && (
              <Popconfirm
                cancelText="取消"
                description="删除后不可恢复，确定要删除这个菜单吗？"
                okText="确定"
                title="确认删除"
                onConfirm={onDelete}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={loading}
                >
                  删除
                </Button>
              </Popconfirm>
            )}

            <Button onClick={onReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <IconModal
        isModalOpen={iconModalOpen}
        setIcon={handleSetIcon}
        setIsModalOpen={setIconModalOpen}
      />
    </ACard>
  );
};
