import dayjs from 'dayjs';

// 使用API定义的Slot类型
interface SlotProps {
  readonly dataSource: Api.Ads.Slot[];
  readonly loading?: boolean;
  readonly onDelete: (record: Api.Ads.Slot) => void;
  readonly onEdit: (record: Api.Ads.Slot) => void;
}

const TableCard = ({ dataSource, loading, onDelete, onEdit }: SlotProps) => {
  const columns = [
    {
      render: (_: unknown, __: unknown, index: number) => index + 1,
      title: '序号',
      width: 60
    },
    {
      dataIndex: 'name',
      key: 'name',
      title: '代码位名称',
      width: 200
    },
    {
      dataIndex: 'app_name',
      key: 'app_name',
      title: 'APP应用',
      width: 150
    },
    {
      dataIndex: 'entity_name',
      key: 'entity_name',
      title: '客户名称',
      width: 150
    },
    {
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => {
        const platformMap = {
          adnetqq: '优量汇',
          csj: '穿山甲',
          kwai: '快手'
        };
        return platformMap[platform as keyof typeof platformMap] || platform;
      },
      title: '广告平台',
      width: 100
    },
    {
      dataIndex: 'type',
      key: 'type',
      render: (type: string | number) => {
        // 支持数字和字符串类型的转换
        const typeMap: Record<string | number, string> = {
          1: '信息流',
          2: '开屏',
          3: '激励视频',
          4: '新插屏',
          flow: '信息流',
          interstitial: '新插屏',
          reward: '激励视频',
          splash: '开屏'
        };
        return typeMap[type] || type;
      },
      title: '广告类型',
      width: 100
    },
    {
      dataIndex: 'bid_type',
      key: 'bid_type',
      render: (biddingType: number | string) => {
        // 支持数字和字符串类型的转换
        const biddingMap: Record<string | number, string> = {
          0: '目标竞价',
          1: '实时竞价',
          realtime: '实时竞价',
          target: '目标竞价'
        };
        return biddingMap[biddingType] || biddingType;
      },
      title: '竞价类型',
      width: 100
    },
    {
      dataIndex: 'ad_slot_id',
      key: 'ad_slot_id',
      title: '代码位ID',
      width: 120
    },
    {
      ellipsis: {
        showTitle: false
      },
      key: 'callback',
      render: (_: unknown, record: Api.Ads.Slot) => (
        <div>
          <div
            className="mb-1 truncate"
            title={record.callback_url}
          >
            {record.callback_url || '-'}
          </div>
          <div
            className="text-sm text-gray-500"
            title={record.key}
          >
            {record.key || '-'}
          </div>
        </div>
      ),
      title: '激励回调',
      width: 200
    },
    {
      dataIndex: 'ecpm',
      key: 'ecpm',
      render: (ecpm: string) => {
        // 处理空值情况
        if (!ecpm) return '-';

        // 确定标签颜色
        let color = 'default';
        const value = Number.parseFloat(ecpm);

        if (!Number.isNaN(value)) {
          if (value >= 1000) {
            color = 'success';
          } else if (value >= 500) {
            color = 'processing';
          } else if (value >= 100) {
            color = 'warning';
          } else if (value > 0) {
            color = 'default';
          }
        }

        return <ATag color={color}>{ecpm}</ATag>;
      },
      title: 'eCPM',
      width: 100
    },
    {
      dataIndex: 'create_time',
      key: 'create_time',
      render: (createTime: string) => {
        if (!createTime) return '-';
        return dayjs(createTime).format('YYYY-MM-DD HH:mm:ss');
      },
      title: '创建时间',
      width: 180
    },
    {
      key: 'action',
      render: (_: unknown, record: Api.Ads.Slot) => (
        <ASpace>
          <AButton
            size="small"
            type="primary"
            onClick={() => onEdit(record)}
          >
            编辑
          </AButton>
          <APopconfirm
            cancelText="取消"
            description="确定要删除这个代码位吗？"
            okText="确定"
            title="确认删除"
            onConfirm={() => onDelete(record)}
          >
            <AButton
              danger
              size="small"
              type="primary"
            >
              删除
            </AButton>
          </APopconfirm>
        </ASpace>
      ),
      title: '操作',
      width: 150
    }
  ];

  return (
    <ACard>
      <ATable
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="ad_slot_id"
        scroll={{ x: 1400 }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
        }}
      />
    </ACard>
  );
};

export default TableCard;
