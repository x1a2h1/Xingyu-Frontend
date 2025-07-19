import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message
} from 'antd';
import { useEffect, useState } from 'react';

import { fetchDeleteUser, fetchDisableUser, fetchEnableUser, fetchGetUserList } from '@/service/api/user';

import { UserFormModal } from './modules/UserFormModal';

const Users = () => {
  const [form] = Form.useForm();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Api.User.Info | null>(null);

  const {
    data: response,
    loading,
    run: getList
  } = useRequest(fetchGetUserList, {
    manual: true
  });

  // 从响应中提取数据
  const data = response?.data || null;

  useEffect(() => {
    getList();
  }, [getList]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    // 构建搜索参数
    const searchParams: any = {};
    if (values.keyword) {
      searchParams.keyword = values.keyword;
    }
    if (values.status !== undefined) {
      searchParams.status = values.status;
    }
    if (values.dateRange && values.dateRange.length === 2) {
      searchParams.startTime = values.dateRange[0]?.format('YYYY-MM-DD');
      searchParams.endTime = values.dateRange[1]?.format('YYYY-MM-DD');
    }
    getList(searchParams);
  };

  const handleReset = () => {
    form.resetFields();
    getList();
  };

  const handleAdd = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleEdit = (record: Api.User.Info) => {
    setEditingUser(record);
    setUserModalOpen(true);
  };

  const handleToggleStatus = async (record: Api.User.Info) => {
    try {
      if (record.status === 0) {
        await fetchDisableUser(record.id.toString());
        message.success('用户已禁用');
      } else {
        await fetchEnableUser(record.id.toString());
        message.success('用户已启用');
      }
      getList();
    } catch {
      message.error('操作失败');
    }
  };

  const handleMoreAction = (key: string, record: Api.User.Info) => {
    switch (key) {
      case 'resetPassword':
        message.info('重置密码功能暂未实现');
        break;
      case 'delete':
        Modal.confirm({
          cancelText: '取消',
          content: `确定要删除用户 "${record.account}" 吗？此操作不可恢复！`,
          okText: '确定',
          onOk: async () => {
            try {
              await fetchDeleteUser(record.id.toString());
              message.success('删除用户成功');
              getList();
            } catch {
              message.error('删除用户失败');
            }
          },
          title: '确认删除',
          type: 'warning'
        });
        break;
      default:
        break;
    }
  };

  const handleUserModalSuccess = () => {
    setUserModalOpen(false);
    setEditingUser(null);
    getList();
  };

  const handleUserModalCancel = () => {
    setUserModalOpen(false);
    setEditingUser(null);
  };

  const columns = [
    {
      render: (_: any, __: any, index: number) => index + 1,
      title: '序号',
      width: 60
    },
    {
      dataIndex: 'account',
      key: 'account',
      title: '账号'
    },
    {
      dataIndex: 'nickname',
      key: 'nickname',
      title: '昵称'
    },
    {
      dataIndex: 'email',
      key: 'email',
      title: '邮箱'
    },
    {
      dataIndex: 'cellphone',
      key: 'cellphone',
      title: '手机号'
    },
    {
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 0 ? 'success' : 'error'}>{status === 0 ? '启用' : '禁用'}</Tag>
      ),
      title: '账号状态'
    },
    {
      dataIndex: 'root',
      key: 'root',
      render: (root: boolean) => <Tag color={root ? 'blue' : 'default'}>{root ? '是' : '否'}</Tag>,
      title: '超级用户'
    },
    {
      dataIndex: 'create_time',
      key: 'create_time',
      title: '创建时间'
    },
    {
      key: 'action',
      render: (_: any, record: Api.User.Info) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            cancelText="取消"
            okText="确定"
            title={`确定要${record.status === 0 ? '禁用' : '启用'}该用户吗？`}
            onConfirm={() => handleToggleStatus(record)}
          >
            <Button
              danger={record.status === 0}
              type={record.status === 0 ? 'default' : 'primary'}
            >
              {record.status === 0 ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'resetPassword',
                  label: '重置密码'
                },
                {
                  danger: true,
                  key: 'delete',
                  label: '删除用户'
                }
              ],
              onClick: ({ key }) => handleMoreAction(key, record)
            }}
          >
            <Button>更多</Button>
          </Dropdown>
        </Space>
      ),
      title: '操作'
    }
  ];

  return (
    <div className="p-4">
      <Card className="mb-4">
        <Form
          form={form}
          layout="inline"
        >
          <div className="flex flex-wrap gap-4">
            <Form.Item name="keyword">
              <Input
                allowClear
                placeholder="请输入账号/昵称"
                style={{ width: 200 }}
              />
            </Form.Item>
            <Form.Item name="status">
              <Select
                allowClear
                placeholder="账号状态"
                style={{ width: 200 }}
                options={[
                  { label: '启用', value: 0 },
                  { label: '禁用', value: 1 }
                ]}
              />
            </Form.Item>
            <Form.Item name="dateRange">
              <DatePicker.RangePicker
                placeholder={['开始时间', '结束时间']}
                style={{ width: 300 }}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  onClick={handleSearch}
                >
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
                <Button
                  type="primary"
                  onClick={handleAdd}
                >
                  新增
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.list || []}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            total: data?.total || 0
          }}
        />
      </Card>

      <UserFormModal
        editingUser={editingUser}
        open={userModalOpen}
        onCancel={handleUserModalCancel}
        onSuccess={handleUserModalSuccess}
      />
    </div>
  );
};

export default Users;
