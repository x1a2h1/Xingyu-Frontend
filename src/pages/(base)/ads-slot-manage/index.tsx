import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchAdsSlotList } from '@/service/api/ads';
import { fetchGetAppList } from '@/service/api/application';

import TableCard from './modules/TableCard';

export default function AdsSlotManage() {
  const navigate = useNavigate();
  const [searchForm] = AForm.useForm();
  const [tableData, setTableData] = useState<Api.Ads.Slot[]>([]);

  // 获取应用列表
  const { data: appListData, loading: appLoading } = useRequest(fetchGetAppList, {
    defaultParams: [{ page: 1, pageSize: 100 }],
    onError: _err => {
      window.$message?.error('获取应用列表失败，请稍后重试');
    }
  });

  // 获取代码位列表 - 统一使用fetchAdsSlotList
  const { loading, run: getSlotList } = useRequest(fetchAdsSlotList, {
    onError: _err => {
      window.$message?.error('获取代码位列表失败，请稍后重试');
      setTableData([]);
    },
    onSuccess: res => {
      // 安全处理代码位数据
      let slotData: Api.Ads.Slot[] = [];
      try {
        // 检查数据结构并安全获取列表
        if (res?.data?.list) {
          slotData = Array.isArray(res.data.list) ? res.data.list : [];
        }
      } catch {
        slotData = [];
      }
      setTableData(slotData);
    }
  });

  // 组件初始化时加载数据
  useEffect(() => {
    getSlotList();
  }, [getSlotList]);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();

    // 构建搜索参数
    const params: Parameters<typeof fetchAdsSlotList>[0] = {};

    if (values.app_id) {
      params.id = values.app_id;
    }

    if (values.platform) {
      params.platform = values.platform;
    }

    if (values.type) {
      // 将字符串类型转换为数字
      const typeMap: Record<string, 1 | 2 | 3 | 4> = {
        flow: 1,
        interstitial: 4,
        reward: 3,
        splash: 2
      };
      params.type = typeMap[values.type];
    }

    if (values.bidding_type !== undefined && values.bidding_type !== null) {
      params.bid_type = values.bidding_type;
    }

    // 添加分页参数
    params.page = 1;
    params.pageSize = 100;

    getSlotList(params);
  };

  const handleReset = () => {
    searchForm.resetFields();
    getSlotList();
  };

  const handleAdd = () => {
    navigate('/slot-create');
  };

  const handleBatchAdd = () => {
    navigate('/batch-slot');
  };

  const handleDelete = (record: Api.Ads.Slot) => {
    // 实际项目中应该调用API删除数据
    setTableData(tableData.filter(item => item.ad_slot_id !== record.ad_slot_id));
    window.$message?.success('删除成功');
  };

  const handleEdit = (_record: Api.Ads.Slot) => {
    window.$message?.info('编辑功能待实现');
  };

  return (
    <div className="p-4">
      <ACard className="mb-4">
        <AForm
          form={searchForm}
          layout="inline"
        >
          <AForm.Item
            label="应用选择"
            name="app_id"
          >
            <ASelect
              allowClear
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              loading={appLoading}
              placeholder="请选择应用"
              style={{ width: 200 }}
              options={(appListData?.data?.list || []).map(app => ({
                label: app.app_name,
                value: app.id
              }))}
            />
          </AForm.Item>
          <AForm.Item
            label="广告平台"
            name="platform"
          >
            <ASelect
              allowClear
              placeholder="请选择广告平台"
              style={{ width: 200 }}
              options={[
                { label: '穿山甲', value: 'csj' },
                { label: '快手', value: 'kwai' },
                { label: '优量汇', value: 'adnetqq' }
              ]}
            />
          </AForm.Item>
          <AForm.Item
            label="广告类型"
            name="type"
          >
            <ASelect
              allowClear
              placeholder="请选择广告类型"
              style={{ width: 200 }}
              options={[
                { label: '信息流', value: 'flow' },
                { label: '开屏', value: 'splash' },
                { label: '激励视频', value: 'reward' },
                { label: '新插屏', value: 'interstitial' }
              ]}
            />
          </AForm.Item>
          <AForm.Item
            label="竞价类型"
            name="bidding_type"
          >
            <ASelect
              allowClear
              placeholder="请选择竞价类型"
              style={{ width: 200 }}
              options={[
                { label: '目标竞价', value: 0 },
                { label: '实时竞价', value: 1 }
              ]}
            />
          </AForm.Item>
          <AForm.Item>
            <ASpace>
              <AButton
                loading={loading}
                type="primary"
                onClick={handleSearch}
              >
                搜索
              </AButton>
              <AButton onClick={handleReset}>重置</AButton>
            </ASpace>
          </AForm.Item>
        </AForm>

        <div className="mt-4 flex justify-end">
          <ASpace>
            <AButton
              icon={<div className="i-carbon:add text-16px" />}
              type="primary"
              onClick={handleAdd}
            >
              新增
            </AButton>
            <AButton
              icon={<div className="i-carbon:batch-job text-16px" />}
              type="primary"
              onClick={handleBatchAdd}
            >
              批量创建
            </AButton>
          </ASpace>
        </div>
      </ACard>

      <TableCard
        dataSource={tableData}
        loading={loading}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
