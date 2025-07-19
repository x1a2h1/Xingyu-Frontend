import { useRequest } from 'ahooks';
import { Form, InputNumber, Modal, message } from 'antd';
import React, { useEffect } from 'react';

import { fetchSetSetting } from '@/service/api';

interface ThresholdEditModalProps {
  currentValue: number;
  onCancel: () => void;
  onSuccess: () => void;
  open: boolean;
}

export const ThresholdEditModal: React.FC<ThresholdEditModalProps> = ({ currentValue, onCancel, onSuccess, open }) => {
  const [form] = Form.useForm();

  // 更新阈值的请求
  const { loading, run: updateThreshold } = useRequest(
    (value: number) => fetchSetSetting('withdrawal_threshold', { value: value.toString() }),
    {
      manual: true,
      onError: _error => {
        message.error('更新提现阈值失败，请稍后重试');
      },
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  // 当模态框打开时，设置表单初始值
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        threshold: currentValue
      });
    }
  }, [open, currentValue, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newThreshold = values.threshold;

      // 检查是否与当前值相同
      if (newThreshold === currentValue) {
        message.warning('新阈值与当前值相同，无需修改');
        return;
      }

      await updateThreshold(newThreshold);
    } catch (error) {
      // 表单验证失败时不需要额外处理，Ant Design 会自动显示错误信息
      console.log('Form validation failed:', error);
    }
  };

  // 处理模态框关闭
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      destroyOnClose
      confirmLoading={loading}
      open={open}
      title="修改提现阈值"
      onCancel={handleCancel}
      onOk={handleSubmit}
    >
      <div className="mb-4">
        <p className="text-gray-600">
          当前阈值: <span className="font-semibold">¥{currentValue}</span>
        </p>
      </div>

      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
      >
        <Form.Item
          extra="阈值范围：0.01 - 10000 元"
          label="新阈值金额"
          name="threshold"
          rules={[
            {
              message: '请输入阈值金额',
              required: true
            },
            {
              max: 10000,
              message: '阈值金额必须在 0.01 - 10000 之间',
              min: 0.01,
              type: 'number'
            }
          ]}
        >
          <InputNumber
            autoFocus
            addonBefore="¥"
            max={10000}
            min={0.01}
            placeholder="请输入新的阈值金额"
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
