import type { AlignType, FixedType } from 'rc-table/lib/interface';
import React, { useState } from 'react';

import { fetchDeleteApp, fetchPutAppMediation, fetchUpdateAppConfig } from '@/service/api/application';

interface AppTableProps {
  readonly dataSource?: API.AppList[];
  readonly loading?: boolean;
  readonly onEdit?: (id: string) => void;
  readonly onPageChange?: (page: number, pageSize: number) => void;
  readonly onRefresh?: () => void; // 添加编辑回调
  readonly pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
}

// 平台配置信息
interface PlatformConfig {
  key: string;
  label: string;
  value: string;
}

export default function AppTable(props: AppTableProps) {
  const { dataSource = [], loading = false, onEdit, onPageChange, onRefresh, pagination } = props;

  // 状态管理
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentApp, setCurrentApp] = useState<API.AppList | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<string>('');
  const [configValue, setConfigValue] = useState<string>('');

  // 处理删除
  const { loading: deleteLoading, run: handleDelete } = useRequest(fetchDeleteApp, {
    manual: true,
    onSuccess: () => {
      onRefresh?.();
    }
  });

  // 处理配置更新
  const { loading: updateConfigLoading, run: updateConfig } = useRequest(fetchUpdateAppConfig, {
    manual: true,
    onError: error => {
      window.$message?.error(`配置更新失败: ${error.message}`);
    },
    onSuccess: () => {
      setModalVisible(false);
      onRefresh?.();
      window.$message?.success('配置更新成功');
    }
  });

  // 处理聚合工具变更
  const { loading: mediationLoading, run: updateMediation } = useRequest(fetchPutAppMediation, {
    manual: true,
    onError: error => {
      window.$message?.error(`更新聚合工具失败: ${error.message}`);
    },
    onSuccess: () => {
      window.$message?.success('更新聚合工具成功');
      onRefresh?.();
    }
  });

  // 准备平台配置数据
  const getPlatformConfigs = (record: API.AppList): PlatformConfig[] => [
    { key: 'taku', label: 'Taku平台', value: record.taku_app_id || '' },
    { key: 'kwai', label: '快手平台', value: record.kwai_app_id || '' },
    { key: 'csj', label: '穿山甲平台', value: record.csj_app_id || '' },
    { key: 'adnetqq', label: '优量汇平台', value: record.adnetqq_app_id || '' }
  ];

  // 获取已配置平台计数
  const getConfiguredCount = (record: API.AppList): number => {
    let count = 0;
    if (record.taku_app_id) count++;
    if (record.kwai_app_id) count++;
    if (record.csj_app_id) count++;
    if (record.adnetqq_app_id) count++;
    return count;
  };

  // 打开查看配置抽屉
  const openConfigDrawer = (record: API.AppList) => {
    setCurrentApp(record);
    setDrawerVisible(true);
  };

  // 打开编辑配置模态框
  const openEditModal = (record: API.AppList, platformKey: string) => {
    setCurrentApp(record);
    setCurrentPlatform(platformKey);

    // 设置当前值
    let currentValue = '';
    switch (platformKey) {
      case 'taku':
        currentValue = record.taku_app_id || '';
        break;
      case 'kwai':
        currentValue = record.kwai_app_id || '';
        break;
      case 'csj':
        currentValue = record.csj_app_id || '';
        break;
      case 'adnetqq':
        currentValue = record.adnetqq_app_id || '';
        break;
      default:
        currentValue = '';
        break;
    }
    setConfigValue(currentValue);
    setModalVisible(true);
  };

  // 提交更新配置
  const submitUpdateConfig = () => {
    if (!currentApp || !currentPlatform) return;

    updateConfig(currentApp.id.toString(), currentPlatform, {
      app_id: configValue
    });
  };

  const handleAggregationChange = (value: number, record: API.AppList) => {
    let platform: string | undefined;
    switch (value) {
      case 1:
        platform = 'taku';
        break;
      case 2:
        platform = 'gromore';
        break;
      default:
        window.$message?.warning('请选择正确的聚合工具');
        return;
    }

    if (!platform) return;

    updateMediation(record.id, platform);
  };

  const columns = [
    {
      dataIndex: 'index',
      key: 'index',
      render: (_: any, __: any, index: number) =>
        ((pagination?.current || 1) - 1) * (pagination?.pageSize || 10) + index + 1,
      title: '序号',
      width: 60
    },
    {
      dataIndex: 'app_name',
      ellipsis: {
        showTitle: false
      },
      key: 'app_name',
      render: (app_name: string) => (
        <ATooltip title={app_name}>
          <div className="truncate">{app_name}</div>
        </ATooltip>
      ),
      title: 'APP名称',
      width: '12%'
    },
    {
      dataIndex: 'package_name',
      ellipsis: {
        showTitle: false
      },
      key: 'package_name',
      render: (package_name: string) => (
        <ATooltip title={package_name}>
          <div className="truncate">{package_name}</div>
        </ATooltip>
      ),
      title: '包名',
      width: '14%'
    },
    {
      align: 'center' as AlignType,
      dataIndex: 'mediation',
      key: 'mediation',
      render: (platform: number, record: API.AppList) => {
        const options = [
          { label: '未知聚合', value: 0 },
          { label: 'Taku', value: 1 },
          { label: 'GroMore', value: 2 }
        ];
        const currentOption = options.find(opt => opt.value === platform) || options[0];
        return (
          <ASelect
            defaultValue={currentOption.value}
            loading={mediationLoading}
            options={options}
            style={{ width: '100%' }}
            onChange={value => handleAggregationChange(value, record)}
          />
        );
      },
      title: '聚合工具',
      width: '10%'
    },
    {
      align: 'center' as AlignType,
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => <ATag color={status ? 'green' : 'red'}>{status ? '已上线' : '未上线'}</ATag>,
      title: '状态',
      width: '6%'
    },
    {
      dataIndex: ['entity', 'name'],
      ellipsis: {
        showTitle: false
      },
      key: 'entity_name',
      render: (name: string) => (
        <ATooltip title={name}>
          <div className="truncate">{name}</div>
        </ATooltip>
      ),
      title: '公司主体',
      width: '10%'
    },
    {
      dataIndex: 'remarks',
      ellipsis: {
        showTitle: false
      },
      key: 'remarks',
      render: (remarks: string) => (
        <ATooltip title={remarks || '-'}>
          <div className="truncate">{remarks || '-'}</div>
        </ATooltip>
      ),
      title: '备注',
      width: '8%'
    },
    {
      dataIndex: 'platformConfigs',
      key: 'platformConfigs',
      render: (_: any, record: API.AppList) => {
        const configCount = getConfiguredCount(record);
        return (
          <ASpace
            wrap
            size={[4, 4]}
          >
            <ATag color={configCount > 0 ? 'blue' : 'default'}>{configCount} 个平台已配置</ATag>
            <ASpace size="small">
              <AButton
                icon={<div className="i-carbon:view" />}
                size="small"
                type="primary"
                onClick={() => openConfigDrawer(record)}
              >
                查看
              </AButton>
              <ADropdown
                menu={{
                  items: getPlatformConfigs(record).map(item => ({
                    key: item.key,
                    label: (
                      <span>
                        {item.label}
                        {item.value ? (
                          <ATag
                            className="ml-1"
                            color="green"
                            size="small"
                          >
                            已配置
                          </ATag>
                        ) : null}
                      </span>
                    ),
                    onClick: () => openEditModal(record, item.key)
                  }))
                }}
              >
                <AButton
                  icon={<div className="i-carbon:edit" />}
                  size="small"
                  type="primary"
                >
                  编辑 <div className="i-carbon:chevron-down ml-1 inline-block" />
                </AButton>
              </ADropdown>
            </ASpace>
          </ASpace>
        );
      },
      title: '平台配置',
      width: '16%'
    },
    {
      key: 'agreements',
      render: (_: any, record: Api.AppLication.Info) => (
        <ASpace
          wrap
          size={[4, 4]}
        >
          {record.user_agreement_short_code && (
            <AButton
              size="small"
              type="link"
              onClick={() => window.open(`https://md.crunl.cn/${record.user_agreement_short_code}`, '_blank')}
            >
              用户协议
            </AButton>
          )}
          {record.privacy_agreement_short_code && (
            <AButton
              size="small"
              type="link"
              onClick={() => window.open(`https://md.crunl.cn/${record.privacy_agreement_short_code}`, '_blank')}
            >
              隐私政策
            </AButton>
          )}
        </ASpace>
      ),
      title: '隐私&协议',
      width: '10%'
    },
    {
      align: 'center' as AlignType,
      fixed: 'right' as FixedType,
      key: 'action',
      render: (_: any, record: API.AppList) => (
        <ASpace>
          <AButton
            icon={<div className="i-carbon:edit" />}
            size="small"
            type="primary"
            onClick={() => onEdit?.(record.id.toString())}
          >
            编辑
          </AButton>
          <APopconfirm
            cancelText="取消"
            okText="确定"
            title="确定要删除该应用吗？"
            onConfirm={() => handleDelete(record.id.toString())}
          >
            <AButton
              danger
              icon={<div className="i-carbon:trash-can" />}
              loading={deleteLoading}
              size="small"
            >
              删除
            </AButton>
          </APopconfirm>
        </ASpace>
      ),
      title: '操作',
      width: '12%'
    }
  ];

  return (
    <>
      <ATable
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={
          pagination
            ? {
                current: pagination.current,
                onChange: onPageChange,
                pageSize: pagination.pageSize,
                showQuickJumper: true,
                showSizeChanger: true,
                showTotal: total => `共 ${total} 条记录`,
                total: pagination.total
              }
            : false
        }
      />

      {/* 查看配置抽屉 */}
      <ADrawer
        open={drawerVisible}
        title={`${currentApp?.app_name} 平台配置`}
        width={500}
        footer={
          <div className="text-right">
            <AButton onClick={() => setDrawerVisible(false)}>关闭</AButton>
          </div>
        }
        onClose={() => setDrawerVisible(false)}
      >
        {currentApp && (
          <ADescriptions
            bordered
            column={1}
          >
            {getPlatformConfigs(currentApp).map(config => (
              <ADescriptions.Item
                key={config.key}
                label={config.label}
              >
                {config.value ? (
                  <div className="flex items-center">
                    <span className="mr-2">{config.value}</span>
                    <ATag color="green">已配置</ATag>
                  </div>
                ) : (
                  <ATag color="red">未配置</ATag>
                )}
              </ADescriptions.Item>
            ))}
          </ADescriptions>
        )}
      </ADrawer>

      {/* 编辑配置模态框 */}
      <AModal
        confirmLoading={updateConfigLoading}
        open={modalVisible}
        title={
          <div>
            编辑平台配置
            <ATag className="ml-2">
              {getPlatformConfigs(currentApp || ({} as API.AppList)).find(item => item.key === currentPlatform)
                ?.label || currentPlatform}
            </ATag>
          </div>
        }
        onCancel={() => setModalVisible(false)}
        onOk={submitUpdateConfig}
      >
        <AForm layout="vertical">
          <AForm.Item
            required
            label="平台应用ID"
            tooltip="请输入在对应平台申请的应用ID"
          >
            <AInput
              allowClear
              placeholder="请输入平台应用ID"
              value={configValue}
              onChange={e => setConfigValue(e.target.value)}
            />
          </AForm.Item>
        </AForm>
      </AModal>
    </>
  );
}
