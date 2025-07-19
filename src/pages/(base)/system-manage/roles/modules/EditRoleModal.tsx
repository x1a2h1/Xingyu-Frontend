import { Form, Input, InputNumber, Modal, message } from 'antd';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

import { fetchCreateRole, fetchUpdateRole } from '@/service/api/role';

interface EditRoleModalProps {
  readonly onCancel: () => void;
  readonly onOk: () => void;
  readonly open: boolean;
  readonly record?: Api.Role.Info | null;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({ onCancel, onOk, open, record }) => {
  const [form] = Form.useForm();
  const isEdit = Boolean(record?.id);

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue(record);
      } else {
        form.setFieldsValue({ sort_num: 0 });
      }
    }
  }, [open, record, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (isEdit) {
        await fetchUpdateRole(record!.id, values);
        message.success('更新成功');
      } else {
        await fetchCreateRole(values);
        message.success('创建成功');
      }

      form.resetFields();
      onOk();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error('操作失败，请重试');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      destroyOnClose
      cancelText="取消"
      okText={isEdit ? '保存' : '新增'}
      open={open}
      title={isEdit ? '编辑角色' : '新增角色'}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="角色名称"
          name="name"
          rules={[
            { message: '请输入角色名称', required: true },
            { max: 50, message: '角色名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item
          label="排序"
          name="sort_num"
          rules={[
            { message: '请输入排序数字', required: true },
            { message: '排序数字不能小于0', min: 0, type: 'number' }
          ]}
        >
          <InputNumber
            max={9999}
            min={0}
            placeholder="请输入排序数字"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

EditRoleModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  record: PropTypes.object
};
