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
  Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getProductList,
  createProduct,
  updateProduct,
  deleteProduct,
  PointsProduct,
} from '@/services/points';

const { Search } = Input;

const ProductList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PointsProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>();
  const [status, setStatus] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PointsProduct | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getProductList({ page, pageSize, keyword, category, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, category, status]);

  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: PointsProduct) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      message.success('删除成功');
      fetchData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: Partial<PointsProduct>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.productId, values);
        message.success('更新成功');
      } else {
        await createProduct(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(editingProduct ? '更新失败' : '创建失败');
    }
  };

  const columns: ColumnsType<PointsProduct> = [
    {
      title: '商品',
      key: 'product',
      render: (_, record) => (
        <Space>
          {record.coverImage && (
            <Image src={record.coverImage} width={50} height={50} style={{ objectFit: 'cover' }} />
          )}
          <div>
            <div>{record.name}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.category}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '积分价格',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      render: (points) => <span style={{ color: '#ff6b35' }}>{points} 积分</span>,
    },
    {
      title: '原价',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      render: (price) => (price ? `¥${price}` : '-'),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <span>
          {stock} / {record.totalStock}
        </span>
      ),
    },
    {
      title: '商品类型',
      dataIndex: 'productType',
      key: 'productType',
      render: (type) => {
        const typeMap: Record<string, string> = {
          physical: '实物商品',
          virtual: '虚拟商品',
          coupon: '优惠券',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 1 ? 'success' : 'default'}>
          {s === 1 ? '上架' : '下架'}
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
            title="确定要删除此商品吗？"
            onConfirm={() => handleDelete(record.productId)}
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
        title="积分商品"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加商品
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索商品名称"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={(v) => {
              setKeyword(v);
              setPage(1);
            }}
          />
          <Select
            placeholder="商品分类"
            style={{ width: 120 }}
            allowClear
            onChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <Select.Option value="default">默认分类</Select.Option>
            <Select.Option value="food">美食</Select.Option>
            <Select.Option value="drink">饮品</Select.Option>
            <Select.Option value="gift">礼品</Select.Option>
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
            <Select.Option value={1}>上架</Select.Option>
            <Select.Option value={0}>下架</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="productId"
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
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={3} placeholder="请输入商品描述" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="pointsCost"
              label="积分价格"
              rules={[{ required: true, message: '请输入积分价格' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="originalPrice" label="原价" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="stock" label="库存" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="limitPerUser" label="每人限兑" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示不限" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item
              name="productType"
              label="商品类型"
              rules={[{ required: true, message: '请选择商品类型' }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Select.Option value="physical">实物商品</Select.Option>
                <Select.Option value="virtual">虚拟商品</Select.Option>
                <Select.Option value="coupon">优惠券</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="category" label="商品分类" style={{ flex: 1 }}>
              <Select>
                <Select.Option value="default">默认分类</Select.Option>
                <Select.Option value="food">美食</Select.Option>
                <Select.Option value="drink">饮品</Select.Option>
                <Select.Option value="gift">礼品</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="coverImage" label="封面图片">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="useRules" label="使用规则">
            <Input.TextArea rows={2} placeholder="请输入使用规则" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="sortOrder" label="排序" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue={1} style={{ flex: 1 }}>
              <Select>
                <Select.Option value={1}>上架</Select.Option>
                <Select.Option value={0}>下架</Select.Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
