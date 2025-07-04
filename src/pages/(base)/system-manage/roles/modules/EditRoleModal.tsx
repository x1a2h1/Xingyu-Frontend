import { useEffect } from "react";

import { Form, Input, InputNumber, message, Modal } from "antd";

import { fetchCreateRole, fetchUpdateRole } from "@/service/api/role";

interface EditRoleModalProps {
  readonly onCancel: () => void;
  readonly onOk: () => void;
  readonly open: boolean;
  readonly record?: Api.Role.Info | null;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  onCancel,
  onOk,
  open,
  record,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!record?.id;

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
        message.success("更新成功");
      } else {
        await fetchCreateRole(values);
        message.success("创建成功");
      }

      form.resetFields();
      onOk();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      message.error("操作失败，请重试");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      cancelText="取消"
      destroyOnClose
      okText={isEdit ? "保存" : "新增"}
      open={open}
      title={isEdit ? "编辑角色" : "新增角色"}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="角色名称"
          name="name"
          rules={[
            { required: true, message: "请输入角色名称" },
            { max: 50, message: "角色名称不能超过50个字符" },
          ]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item
          label="排序"
          name="sort_num"
          rules={[
            { required: true, message: "请输入排序数字" },
            { type: "number", min: 0, message: "排序数字不能小于0" },
          ]}
        >
          <InputNumber
            max={9999}
            min={0}
            placeholder="请输入排序数字"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
