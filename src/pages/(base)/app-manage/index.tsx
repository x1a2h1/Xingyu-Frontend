import { fetchGetAppList } from '@/service/api/application';

import AppFormModal from './modules/AppFormModal';
import AppTable from './modules/AppTable';

const AppManage = () => {
  const [form] = AForm.useForm();

  // 分页和搜索参数
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    page: 1,
    pageSize: 10
  });

  // 模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  // 发起请求获取应用列表
  const {
    data,
    loading,
    run: getAppList
  } = useRequest(() => fetchGetAppList(searchParams), {
    refreshDeps: [searchParams]
  });

  // 处理搜索
  const handleSearch = () => {
    const values = form.getFieldsValue();
    setSearchParams({
      ...searchParams,
      keyword: values.keyword || '',
      page: 1 // 搜索时重置为第一页
    });
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setSearchParams({
      keyword: '',
      page: 1,
      pageSize: 10
    });
  };

  // 页码变化处理
  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      page,
      pageSize
    });
  };

  // 刷新列表
  const refreshList = () => {
    getAppList();
  };

  // 打开创建应用模态框
  const openCreateModal = () => {
    setEditingAppId(null);
    setModalVisible(true);
  };

  // 打开编辑应用模态框
  const openEditModal = (id: string) => {
    setEditingAppId(id);
    setModalVisible(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
  };

  // 模态框提交成功
  const handleModalSuccess = () => {
    closeModal();
    refreshList();
  };

  return (
    <div className="p-4">
      <ACard className="mb-4">
        <AForm
          form={form}
          layout="inline"
        >
          <div className="w-full flex flex-wrap justify-between gap-y-4">
            <div className="flex flex-wrap gap-4">
              <AForm.Item
                label="搜索"
                name="keyword"
              >
                <AInput
                  allowClear
                  placeholder="应用名称/包名"
                  style={{ width: 200 }}
                />
              </AForm.Item>
              <AForm.Item>
                <ASpace>
                  <AButton
                    icon={<div className="i-carbon:search" />}
                    type="primary"
                    onClick={handleSearch}
                  >
                    搜索
                  </AButton>
                  <AButton
                    icon={<div className="i-carbon:reset" />}
                    onClick={handleReset}
                  >
                    重置
                  </AButton>
                </ASpace>
              </AForm.Item>
            </div>
            <div className="flex gap-4">
              <AButton
                icon={<div className="i-carbon:add" />}
                type="primary"
                onClick={openCreateModal}
              >
                新增应用
              </AButton>
              <AButton
                icon={<div className="i-carbon:refresh" />}
                onClick={refreshList}
              >
                刷新
              </AButton>
            </div>
          </div>
        </AForm>
      </ACard>

      <ACard>
        <AppTable
          dataSource={data?.data?.list}
          loading={loading}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.pageSize,
            total: data?.data?.total || 0
          }}
          onEdit={openEditModal}
          onPageChange={handlePageChange}
          onRefresh={refreshList}
        />
      </ACard>

      {/* 应用表单模态框 */}
      <AppFormModal
        appId={editingAppId || undefined}
        open={modalVisible}
        onCancel={closeModal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AppManage;
