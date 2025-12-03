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
  Tabs,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getMealList,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealCategories,
  createMealCategory,
  updateMealCategory,
  deleteMealCategory,
  FitnessMeal,
  MealCategory,
} from '@/services/meals';

const { Search } = Input;

const MealList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FitnessMeal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<string>();
  const [status, setStatus] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<FitnessMeal | null>(null);
  const [form] = Form.useForm();

  // 分类相关
  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MealCategory | null>(null);
  const [categoryForm] = Form.useForm();

  const fetchCategories = async () => {
    try {
      const result = await getMealCategories({ pageSize: 100 });
      setCategories(result.list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getMealList({ page, pageSize, keyword, categoryId, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取餐品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, categoryId, status]);

  const handleCreate = () => {
    setEditingMeal(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: FitnessMeal) => {
    setEditingMeal(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (mealId: string) => {
    try {
      await deleteMeal(mealId);
      message.success('删除成功');
      fetchData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: Partial<FitnessMeal>) => {
    try {
      if (editingMeal) {
        await updateMeal(editingMeal.mealId, values);
        message.success('更新成功');
      } else {
        await createMeal(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(editingMeal ? '更新失败' : '创建失败');
    }
  };

  // 分类操作
  const handleCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (record: MealCategory) => {
    setEditingCategory(record);
    categoryForm.setFieldsValue(record);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await deleteMealCategory(catId);
      message.success('删除成功');
      fetchCategories();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleCategorySubmit = async (values: Partial<MealCategory>) => {
    try {
      if (editingCategory) {
        await updateMealCategory(editingCategory.categoryId, values);
        message.success('更新成功');
      } else {
        await createMealCategory(values);
        message.success('创建成功');
      }
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      message.error(editingCategory ? '更新失败' : '创建失败');
    }
  };

  const mealColumns: ColumnsType<FitnessMeal> = [
    {
      title: '餐品',
      key: 'meal',
      render: (_, record) => (
        <Space>
          {record.coverImage && (
            <Image src={record.coverImage} width={50} height={50} style={{ objectFit: 'cover' }} />
          )}
          <div>
            <div>{record.name}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.categoryName}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '热量',
      dataIndex: 'calories',
      key: 'calories',
      render: (cal) => `${cal} kcal`,
    },
    {
      title: '营养成分',
      key: 'nutrition',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>蛋白质: {record.protein || 0}g</span>
          <span>碳水: {record.carbs || 0}g</span>
          <span>脂肪: {record.fat || 0}g</span>
        </Space>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (d) => {
        const map: Record<string, { text: string; color: string }> = {
          easy: { text: '简单', color: 'success' },
          medium: { text: '中等', color: 'warning' },
          hard: { text: '困难', color: 'error' },
        };
        return <Tag color={map[d]?.color}>{map[d]?.text || d}</Tag>;
      },
    },
    {
      title: '制作时间',
      dataIndex: 'preparationTime',
      key: 'preparationTime',
      render: (time) => (time ? `${time} 分钟` : '-'),
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
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除此餐品吗？" onConfirm={() => handleDelete(record.mealId)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryColumns: ColumnsType<MealCategory> = [
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={s === 1 ? 'success' : 'default'}>{s === 1 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditCategory(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteCategory(record.categoryId)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Tabs
          items={[
            {
              key: 'meals',
              label: '餐品列表',
              children: (
                <>
                  <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                      <Search
                        placeholder="搜索餐品名称"
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ width: 250 }}
                        onSearch={(v) => { setKeyword(v); setPage(1); }}
                      />
                      <Select
                        placeholder="分类"
                        style={{ width: 120 }}
                        allowClear
                        onChange={(v) => { setCategoryId(v); setPage(1); }}
                      >
                        {categories.map((c) => (
                          <Select.Option key={c.categoryId} value={c.categoryId}>{c.name}</Select.Option>
                        ))}
                      </Select>
                      <Select
                        placeholder="状态"
                        style={{ width: 100 }}
                        allowClear
                        onChange={(v) => { setStatus(v); setPage(1); }}
                      >
                        <Select.Option value={1}>上架</Select.Option>
                        <Select.Option value={0}>下架</Select.Option>
                      </Select>
                    </Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>添加餐品</Button>
                  </Space>
                  <Table
                    columns={mealColumns}
                    dataSource={data}
                    loading={loading}
                    rowKey="mealId"
                    pagination={{
                      current: page,
                      pageSize,
                      total,
                      showSizeChanger: true,
                      showTotal: (t) => `共 ${t} 条`,
                      onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                    }}
                  />
                </>
              ),
            },
            {
              key: 'categories',
              label: '分类管理',
              children: (
                <>
                  <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={handleCreateCategory}>
                    添加分类
                  </Button>
                  <Table columns={categoryColumns} dataSource={categories} rowKey="categoryId" pagination={false} />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingMeal ? '编辑餐品' : '添加餐品'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="餐品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入餐品名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="categoryId" label="分类" style={{ flex: 1 }}>
              <Select>
                {categories.map((c) => (
                  <Select.Option key={c.categoryId} value={c.categoryId}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="calories" label="热量(kcal)" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="protein" label="蛋白质(g)" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="carbs" label="碳水(g)" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="fat" label="脂肪(g)" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="preparationTime" label="制作时间(分钟)" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="difficulty" label="难度" style={{ flex: 1 }}>
              <Select>
                <Select.Option value="easy">简单</Select.Option>
                <Select.Option value="medium">中等</Select.Option>
                <Select.Option value="hard">困难</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="coverImage" label="封面图片">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="recipe" label="制作方法">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>上架</Select.Option>
              <Select.Option value={0}>下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        onOk={() => categoryForm.submit()}
      >
        <Form form={categoryForm} onFinish={handleCategorySubmit} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
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

export default MealList;
