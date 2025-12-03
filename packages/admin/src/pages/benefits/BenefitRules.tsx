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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getBenefitList,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  BenefitRule,
} from '@/services/benefits';

const { Search } = Input;

const BenefitRules = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BenefitRule[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<string>();
  const [status, setStatus] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<BenefitRule | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getBenefitList({ page, pageSize, keyword, type, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取权益列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, type, status]);

  const handleCreate = () => {
    setEditingBenefit(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: BenefitRule) => {
    setEditingBenefit(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (benefitId: string) => {
    try {
      await deleteBenefit(benefitId);
      message.success('删除成功');
      fetchData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: Partial<BenefitRule>) => {
    try {
      if (editingBenefit) {
        await updateBenefit(editingBenefit.benefitId, values);
        message.success('更新成功');
      } else {
        await createBenefit(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(editingBenefit ? '更新失败' : '创建失败');
    }
  };

  const typeMap: Record<string, string> = {
    discount: '折扣券',
    gift: '赠品',
    service: '服务',
    voucher: '代金券',
  };

  const columns: ColumnsType<BenefitRule> = [
    {
      title: '权益名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.icon && <span>{record.icon}</span>}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (t) => typeMap[t] || t,
    },
    {
      title: '等级要求',
      dataIndex: 'levelRequirement',
      key: 'levelRequirement',
      render: (level) => (level ? `Lv.${level}` : '无限制'),
    },
    {
      title: '积分成本',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      render: (points) => (points ? `${points} 积分` : '免费'),
    },
    {
      title: '权益值',
      dataIndex: 'value',
      key: 'value',
      render: (value) => value || '-',
    },
    {
      title: '有效期',
      dataIndex: 'validDays',
      key: 'validDays',
      render: (days) => (days ? `${days} 天` : '永久'),
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
            title="确定要删除此权益吗？"
            onConfirm={() => handleDelete(record.benefitId)}
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
        title="权益规则"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加权益
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索权益名称"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={(v) => {
              setKeyword(v);
              setPage(1);
            }}
          />
          <Select
            placeholder="权益类型"
            style={{ width: 120 }}
            allowClear
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
          >
            <Select.Option value="discount">折扣券</Select.Option>
            <Select.Option value="gift">赠品</Select.Option>
            <Select.Option value="service">服务</Select.Option>
            <Select.Option value="voucher">代金券</Select.Option>
          </Select>
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
          rowKey="benefitId"
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
        title={editingBenefit ? '编辑权益' : '添加权益'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="权益名称"
            rules={[{ required: true, message: '请输入权益名称' }]}
          >
            <Input placeholder="请输入权益名称" />
          </Form.Item>
          <Form.Item name="description" label="权益描述">
            <Input.TextArea rows={2} placeholder="请输入权益描述" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="type"
              label="权益类型"
              rules={[{ required: true, message: '请选择权益类型' }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Select.Option value="discount">折扣券</Select.Option>
                <Select.Option value="gift">赠品</Select.Option>
                <Select.Option value="service">服务</Select.Option>
                <Select.Option value="voucher">代金券</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="value" label="权益值" style={{ flex: 1 }}>
              <Input placeholder="如 9折、50元" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="levelRequirement" label="等级要求" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示无限制" />
            </Form.Item>
            <Form.Item name="pointsCost" label="积分成本" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示免费" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="validDays" label="有效期(天)" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示永久" />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="icon" label="图标">
            <Input placeholder="图标" />
          </Form.Item>
          <Form.Item name="useRules" label="使用规则">
            <Input.TextArea rows={2} placeholder="请输入使用规则" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BenefitRules;
