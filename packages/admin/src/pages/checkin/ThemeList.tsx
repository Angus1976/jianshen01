import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  DatePicker,
  Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getThemeList,
  createTheme,
  updateTheme,
  deleteTheme,
  CheckinTheme,
} from '@/services/checkin';
import { formatDate } from '@/utils';

const { Search } = Input;
const { RangePicker } = DatePicker;

const ThemeList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CheckinTheme[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CheckinTheme | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getThemeList({ page, pageSize, keyword, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取主题列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, status]);

  const handleCreate = () => {
    setEditingTheme(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: CheckinTheme) => {
    setEditingTheme(record);
    form.setFieldsValue({
      ...record,
      dateRange:
        record.startDate && record.endDate
          ? [dayjs(record.startDate), dayjs(record.endDate)]
          : undefined,
    });
    setModalOpen(true);
  };

  const handleDelete = async (themeId: string) => {
    try {
      await deleteTheme(themeId);
      message.success('删除成功');
      fetchData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: Partial<CheckinTheme> & { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] }) => {
    try {
      const { dateRange, ...rest } = values;
      const submitData = {
        ...rest,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      };

      if (editingTheme) {
        await updateTheme(editingTheme.themeId, submitData);
        message.success('更新成功');
      } else {
        await createTheme(submitData);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(editingTheme ? '更新失败' : '创建失败');
    }
  };

  const columns: ColumnsType<CheckinTheme> = [
    {
      title: '主题',
      key: 'theme',
      render: (_, record) => (
        <Space>
          {record.coverImage && (
            <Image src={record.coverImage} width={50} height={50} style={{ objectFit: 'cover' }} />
          )}
          <div>
            <div>{record.name}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.description}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '奖励积分',
      dataIndex: 'rewardPoints',
      key: 'rewardPoints',
      render: (points) => <span style={{ color: '#ff6b35' }}>{points}</span>,
    },
    {
      title: '活动时间',
      key: 'dateRange',
      render: (_, record) => (
        <span>
          {record.startDate ? formatDate(record.startDate, 'YYYY-MM-DD') : '无限制'} ~{' '}
          {record.endDate ? formatDate(record.endDate, 'YYYY-MM-DD') : '无限制'}
        </span>
      ),
    },
    {
      title: '要求',
      key: 'requirements',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>图片: {record.requiredPhotos} 张</span>
          <span>内容: {record.requiredContent ? '必填' : '可选'}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 1 ? 'success' : 'default'}>
          {s === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此主题吗？"
            onConfirm={() => handleDelete(record.themeId)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="打卡主题"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加主题
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索主题名称"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={(v) => {
              setKeyword(v);
              setPage(1);
            }}
          />
          <Select
            placeholder="状态"
            style={{ width: 100 }}
            allowClear
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <Select.Option value={1}>启用</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="themeId"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Modal
        title={editingTheme ? '编辑主题' : '添加主题'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="主题名称"
            rules={[{ required: true, message: '请输入主题名称' }]}
          >
            <Input placeholder="请输入主题名称" />
          </Form.Item>
          <Form.Item name="description" label="主题描述">
            <Input.TextArea rows={2} placeholder="请输入主题描述" />
          </Form.Item>
          <Form.Item name="coverImage" label="封面图片">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="dateRange" label="活动时间">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="rewardPoints"
              label="奖励积分"
              rules={[{ required: true, message: '请输入奖励积分' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="requiredPhotos" label="最少图片数" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="requiredContent" label="内容必填" style={{ flex: 1 }}>
              <Select>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue={1} style={{ flex: 1 }}>
              <Select>
                <Select.Option value={1}>启用</Select.Option>
                <Select.Option value={0}>禁用</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ThemeList;
