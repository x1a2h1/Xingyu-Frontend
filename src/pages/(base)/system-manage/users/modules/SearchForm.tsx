import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Input, Row, Select, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';

const { RangePicker } = DatePicker;

interface SearchFormProps {
  readonly handleAddUser: () => void;
  readonly handleReset: () => void;
  readonly handleSearch: () => void;
  readonly searchParams: {
    dateRange: [Dayjs | null, Dayjs | null] | null;
    keyword: string;
    status?: string;
  };
  readonly setSearchParams: (params: {
    dateRange: [Dayjs | null, Dayjs | null] | null;
    keyword: string;
    status?: string;
  }) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  handleAddUser,
  handleReset,
  handleSearch,
  searchParams,
  setSearchParams
}) => {
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ marginBottom: 16, width: '100%' }}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Input
            placeholder="请输入用户名/昵称"
            prefix={<SearchOutlined />}
            value={searchParams.keyword}
            onChange={e => setSearchParams({ ...searchParams, keyword: e.target.value })}
          />
        </Col>
        <Col span={2}>
          <Select
            allowClear
            placeholder="请选择状态"
            style={{ width: '100%' }}
            value={searchParams.status}
            options={[
              { label: '启用', value: '1' },
              { label: '禁用', value: '2' }
            ]}
            onChange={value => setSearchParams({ ...searchParams, status: value })}
          />
        </Col>
        <Col span={8}>
          <RangePicker
            style={{ width: '100%' }}
            value={searchParams.dateRange}
            onChange={dates => setSearchParams({ ...searchParams, dateRange: dates })}
          />
        </Col>
        <Col span={5}>
          <Space>
            <Button
              icon={<SearchOutlined />}
              type="primary"
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={handleAddUser}
            >
              新增
            </Button>
          </Space>
        </Col>
      </Row>
    </Space>
  );
};
