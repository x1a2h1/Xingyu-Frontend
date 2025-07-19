import { useRequest } from 'ahooks';
import { Button, Card, Statistic, message } from 'antd';
import { useState } from 'react';

import { fetchGetSetting } from '@/service/api';

import { ThresholdEditModal } from './modules/ThresholdEditModal';

const WithdrawalThresholdSettings = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);

  // 获取当前提现阈值
  const {
    data: response,
    loading,
    run: refreshThreshold
  } = useRequest(() => fetchGetSetting<string>('withdrawal_threshold'), {
    onError: _error => {
      message.error('获取提现阈值失败，请稍后重试');
    }
  });

  // 从响应中提取数据
  const currentThreshold = Number.parseFloat(response?.data || '0') || 0;

  // 处理阈值修改
  const handleEditThreshold = () => {
    setEditModalVisible(true);
  };

  // 处理模态框关闭
  const handleModalCancel = () => {
    setEditModalVisible(false);
  };

  // 处理阈值更新成功
  const handleModalSuccess = () => {
    setEditModalVisible(false);
    refreshThreshold();
    message.success('提现阈值修改成功');
  };

  return (
    <div className="p-4">
      <Card
        loading={loading}
        title="提现阈值设置"
        extra={
          <Button
            type="primary"
            onClick={handleEditThreshold}
          >
            修改阈值
          </Button>
        }
      >
        <div className="py-8 text-center">
          <Statistic
            className="mb-6"
            precision={2}
            prefix="¥"
            title="当前阈值金额"
            value={currentThreshold || 0}
            valueStyle={{ color: '#1890ff', fontSize: '32px' }}
          />
          <div className="text-base text-gray-500">
            <p className="mb-2">当用户提现金额小于该阈值时，系统将自动处理打款</p>
            <p className="text-sm">大于等于阈值的提现申请仍需人工审批</p>
          </div>
        </div>
      </Card>

      <ThresholdEditModal
        currentValue={currentThreshold || 0}
        open={editModalVisible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default WithdrawalThresholdSettings;
