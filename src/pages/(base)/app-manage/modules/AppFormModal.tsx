import TextArea from 'antd/lib/input/TextArea';
import { useEffect, useMemo } from 'react';

import { fetchCreateApp, fetchGetAppDetail, fetchUpdateApp } from '@/service/api/application';
import { fetchGetMyEntities } from '@/service/api/entity';

interface AppFormModalProps {
  readonly appId?: string | number;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
  // 如果有ID则为编辑模式，否则为新增模式
  readonly open: boolean;
}

export default function AppFormModal({ appId, onCancel, onSuccess, open }: AppFormModalProps) {
  const [form] = AForm.useForm();
  const isEdit = Boolean(appId);

  // 获取公司主体列表
  const { data: entitiesData, loading: entitiesLoading } = useRequest(fetchGetMyEntities, {
    onError: error => {
      window.$message?.error(`获取公司主体列表失败: ${error.message}`);
    },
    ready: open
  });

  // 编辑模式下获取应用详情
  const { data: appDetail, loading: detailLoading } = useRequest(() => fetchGetAppDetail(String(appId)), {
    onError: error => {
      window.$message?.error(`获取应用详情失败: ${error.message}`);
    },
    ready: open && isEdit
  });

  // 提交表单处理
  const { loading: updateLoading, run: updateApp } = useRequest(fetchUpdateApp, {
    manual: true,
    onError: error => {
      window.$message?.error(`${isEdit ? '更新' : '创建'}应用失败: ${error.message}`);
    },
    onSuccess: () => {
      window.$message?.success(`${isEdit ? '更新' : '创建'}应用成功`);
      form.resetFields();
      onSuccess();
    }
  });
  const { loading: createLoading, run: createApp } = useRequest(fetchCreateApp, {
    manual: true,
    onError: error => {
      window.$message?.error(`${isEdit ? '更新' : '创建'}应用失败: ${error.message}`);
    },
    onSuccess: () => {
      window.$message?.success(`${isEdit ? '更新' : '创建'}应用成功`);
      form.resetFields();
      onSuccess();
    }
  });
  // const { loading: submitLoading, run: submitForm } = useRequest(
  //   values => {
  //     if (isEdit) {
  //       return fetchUpdateApp(String(appId), values);
  //     }
  //     return fetchCreateApp(values);
  //   },
  //   {
  //     manual: true,
  //     onError: error => {
  //       window.$message?.error(`${isEdit ? '更新' : '创建'}应用失败: ${error.message}`);
  //     },
  //     onSuccess: () => {
  //       window.$message?.success(`${isEdit ? '更新' : '创建'}应用成功`);
  //       form.resetFields();
  //       onSuccess();
  //     }
  //   }
  // );

  // 表单加载状态
  const formLoading = useMemo(
    () => entitiesLoading || detailLoading || createLoading || updateLoading,
    [entitiesLoading, detailLoading, createLoading, updateLoading]
  );

  // 公司主体选项
  const entityOptions = useMemo(() => {
    if (!entitiesData?.data) return [];
    return entitiesData.data.map((entity: any) => ({
      label: entity.name,
      value: entity.id
    }));
  }, [entitiesData]);

  // 编辑模式下设置表单初始值
  useEffect(() => {
    if (appDetail?.data && open && isEdit) {
      form.setFieldsValue({
        entity_id: appDetail.data.entity_id,
        name: appDetail.data.app_name,
        package_name: appDetail.data.package_name,
        remarks: appDetail.data.remarks
      });
    }
  }, [appDetail, open, isEdit, form]);

  // 重置表单
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit) {
        await updateApp(String(appId), values);
      } else {
        await createApp(values);
      }
    } catch (error) {
      // 表单验证失败
      window.$message?.error(`表单验证失败，请检查输入 ${error}`);
    }
  };

  return (
    <AModal
      destroyOnClose
      confirmLoading={formLoading}
      maskClosable={false}
      open={open}
      title={isEdit ? '编辑应用' : '新增应用'}
      width={600}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <AForm
        disabled={formLoading}
        form={form}
        layout="vertical"
      >
        <AForm.Item
          label="公司主体"
          name="entity_id"
          rules={[{ message: '请选择公司主体', required: true }]}
          tooltip="选择应用关联的公司主体，创建后不可更改"
        >
          <ASelect
            disabled={isEdit} // 编辑模式下不允许修改公司主体
            loading={entitiesLoading}
            options={entityOptions}
            placeholder="请选择公司主体"
          />
        </AForm.Item>

        <AForm.Item
          label="应用名称"
          name="name"
          rules={[
            { message: '请输入应用名称', required: true },
            { max: 100, message: '应用名称不能超过100个字符' }
          ]}
        >
          <AInput placeholder="请输入应用名称" />
        </AForm.Item>

        <AForm.Item
          label="应用包名"
          name="package_name"
          tooltip="请输入符合Android包名格式的字符串，如：com.example.app"
          rules={[
            { message: '请输入应用包名', required: true },
            { max: 255, message: '应用包名不能超过255个字符' },
            {
              message: '包名格式不正确，应为有效的Android包名格式，如：com.example.app',
              pattern: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/
            }
          ]}
        >
          <AInput placeholder="请输入应用包名，如：com.example.app" />
        </AForm.Item>

        <AForm.Item
          label="备注"
          name="remarks"
          rules={[{ max: 500, message: '备注不能超过500个字符' }]}
        >
          <TextArea
            showCount
            autoSize={{ maxRows: 6, minRows: 3 }}
            maxLength={500}
            placeholder="请输入应用备注信息（选填）"
          />
        </AForm.Item>

        {isEdit && (
          <AAlert
            showIcon
            className="mb-4"
            message="平台配置信息请在应用详情页进行设置"
            type="info"
          />
        )}
      </AForm>
    </AModal>
  );
}
