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
  Tree,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  AdminRole,
  PermissionModule,
} from '@/services/system';
import { formatDate } from '@/utils';

const { Search } = Input;

const RoleList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminRole[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [permissions, setPermissions] = useState<PermissionModule[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  const fetchPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getRoleList({ page, pageSize, keyword, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, status]);

  // 将权限模块转换为树形结构
  const permissionTreeData: DataNode[] = permissions.map((module) => ({
    title: module.name,
    key: module.module,
    children: module.permissions.map((p) => ({
      title: p.name,
      key: p.code,
    })),
  }));

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setCheckedKeys([]);
    setModalOpen(true);
  };

  const handleEdit = (record: AdminRole) => {
    setEditingRole(record);
    form.setFieldsValue(record);
    setCheckedKeys(record.permissions || []);
    setModalOpen(true);
  };

  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      message.success('删除成功');
      fetchData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: { name: string; code: string; description?: string }) => {
    try {
      const submitData = {
        ...values,
        permissions: checkedKeys.filter((key) => key.includes(':')), // 只保留叶子节点权限
      };

      if (editingRole) {
        await updateRole(editingRole.roleId, submitData);
        message.success('更新成功');
      } else {
        await createRole(submitData);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(editingRole ? '更新失败' : '创建失败');
    }
  };

  const columns: ColumnsType<AdminRole> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag>{code}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => desc || '-',
    },
    {
      title: '系统角色',
      dataIndex: 'isSystem',
      key: 'isSystem',
      render: (isSystem) => (
        <Tag color={isSystem ? 'blue' : 'default'}>
          {isSystem ? '是' : '否'}
        </Tag>
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
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
            disabled={record.isSystem}
          >
            编辑
          </Button>
          {!record.isSystem && (
            <Popconfirm
              title="确定要删除此角色吗？"
              onConfirm={() => handleDelete(record.roleId)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="角色管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加角色
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索角色名称"
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
          rowKey="roleId"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={2} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item label="权限配置">
            <Tree
              checkable
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={(checked) => {
                setCheckedKeys(checked as string[]);
              }}
              treeData={permissionTreeData}
              style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 8, maxHeight: 300, overflow: 'auto' }}
            />
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

export default RoleList;
