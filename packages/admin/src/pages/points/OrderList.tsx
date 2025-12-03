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
  Select,
  message,
  Image,
} from 'antd';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getOrderList, verifyOrder, ExchangeOrder } from '@/services/points';
import { formatDate } from '@/utils';

const { Search } = Input;

const OrderList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExchangeOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<number>();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<ExchangeOrder | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getOrderList({ page, pageSize, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, status]);

  const handleVerify = (record: ExchangeOrder) => {
    setVerifyingOrder(record);
    form.resetFields();
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async (values: { useStore?: string }) => {
    if (!verifyingOrder) return;
    try {
      await verifyOrder(verifyingOrder.orderId, values);
      message.success('核销成功');
      setVerifyModalOpen(false);
      fetchData();
    } catch (err) {
      message.error('核销失败');
    }
  };

  const statusMap: Record<number, { text: string; color: string }> = {
    0: { text: '待核销', color: 'warning' },
    1: { text: '已核销', color: 'success' },
    2: { text: '已过期', color: 'default' },
    3: { text: '已取消', color: 'error' },
  };

  const columns: ColumnsType<ExchangeOrder> = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 200,
    },
    {
      title: '商品',
      key: 'product',
      render: (_, record) => (
        <Space>
          {record.coverImage && (
            <Image src={record.coverImage} width={40} height={40} style={{ objectFit: 'cover' }} />
          )}
          <span>{record.productName}</span>
        </Space>
      ),
    },
    {
      title: '用户',
      dataIndex: 'userNickname',
      key: 'userNickname',
    },
    {
      title: '消耗积分',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (points) => <span style={{ color: '#ff6b35' }}>{points}</span>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={statusMap[s]?.color || 'default'}>
          {statusMap[s]?.text || '未知'}
        </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: '核销时间',
      dataIndex: 'usedAt',
      key: 'usedAt',
      render: (date) => (date ? formatDate(date) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 0 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleVerify(record)}
            >
              核销
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="兑换订单">
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索订单号"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Select
            placeholder="订单状态"
            style={{ width: 120 }}
            allowClear
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <Select.Option value={0}>待核销</Select.Option>
            <Select.Option value={1}>已核销</Select.Option>
            <Select.Option value={2}>已过期</Select.Option>
            <Select.Option value={3}>已取消</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="orderId"
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
        title="核销订单"
        open={verifyModalOpen}
        onCancel={() => setVerifyModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleVerifySubmit} layout="vertical">
          <Form.Item name="useStore" label="核销门店">
            <Input placeholder="请输入核销门店（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList;
