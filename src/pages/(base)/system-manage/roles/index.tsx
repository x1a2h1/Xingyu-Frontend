import { useRequest } from 'ahooks';
import { Button, Card, Form, Input, Popconfirm, Space, Table, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { fetchDeleteRole, fetchGetRoleList, fetchUpdateRoleMenu } from '@/service/api/role';

import { AssignPermissionModal } from './modules/AssignPermissionModal';
import { EditRoleModal } from './modules/EditRoleModal';

const Roles = () => {
  const [searchForm] = Form.useForm();
  const [assignPermissionModalOpen, setAssignPermissionModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Api.Role.Info | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const {
    data: tableData,
    loading,
    run: getList
  } = useRequest(fetchGetRoleList, {
    manual: true
  });

  const handleSearch = useCallback(async () => {
    const values = searchForm.getFieldsValue();
    const searchParams: any = {
      current: 1,
      size: 10
    };
    if (values.keyword) {
      searchParams.keyword = values.keyword;
    }
    await getList(searchParams);
  }, [getList, searchForm]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleEdit = (record: Api.Role.Info) => {
    setCurrentRecord(record);
    setEditModalOpen(true);
  };

  const handleEditOk = async () => {
    setEditModalOpen(false);
    setCurrentRecord(null);
    await handleSearch();
    message.success('操作成功');
  };

  const handleDelete = async (record: Api.Role.Info) => {
    try {
      await fetchDeleteRole(record.id);
      message.success('删除成功');
      await handleSearch();
    } catch {
      message.error('删除失败');
    }
  };

  const handleAssignPermission = (record: Api.Role.Info) => {
    setCurrentRecord(record);
    setAssignPermissionModalOpen(true);
  };

  const handleAssignPermissionOk = async (selectedKeys: number[]) => {
    if (!currentRecord) return;

    try {
      await fetchUpdateRoleMenu(currentRecord.id, { menu_ids: selectedKeys });
      message.success('权限分配成功');
      setAssignPermissionModalOpen(false);
      await handleSearch();
    } catch {
      message.error('权限分配失败');
    }
  };

  const handleReset = async () => {
    searchForm.resetFields();
    await getList({
      current: 1,
      size: 10
    });
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    setEditModalOpen(true);
  };

  const handleModalCancel = () => {
    setAssignPermissionModalOpen(false);
    setEditModalOpen(false);
    setCurrentRecord(null);
  };

  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      title: '名称'
    },
    {
      dataIndex: 'sort_num',
      key: 'sort_num',
      title: '排序'
    },
    {
      dataIndex: 'create_time',
      key: 'create_time',
      title: '创建时间'
    },
    {
      key: 'action',
      render: (_: any, record: Api.Role.Info) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            cancelText="取消"
            description="确定要删除这个角色吗？"
            okText="确定"
            title="确认删除"
            onConfirm={() => handleDelete(record)}
          >
            <Button
              danger
              type="primary"
            >
              删除
            </Button>
          </Popconfirm>
          <Button
            type="default"
            onClick={() => handleAssignPermission(record)}
          >
            分配权限
          </Button>
        </Space>
      ),
      title: '操作'
    }
  ];

  return (
    <div className="p-4">
      <Card className="mb-4">
        <Form
          form={searchForm}
          layout="inline"
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder="请输入角色名称搜索"
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
                新增角色
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={tableData?.data?.list || []}
          loading={loading}
          rowKey="id"
          pagination={{
            current: 1,
            pageSize: 10,
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条记录`,
            total: tableData?.data?.total || 0
          }}
        />
      </Card>

      <AssignPermissionModal
        defaultCheckedKeys={currentRecord?.menu_list?.map(menu => menu.id) || []}
        open={assignPermissionModalOpen}
        onCancel={handleModalCancel}
        onOk={handleAssignPermissionOk}
      />

      <EditRoleModal
        open={editModalOpen}
        record={currentRecord}
        onCancel={handleModalCancel}
        onOk={handleEditOk}
      />
    </div>
  );
};

export default Roles;
