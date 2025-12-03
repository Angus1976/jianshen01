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
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
  getRoleList,
  AdminUser,
  AdminRole,
} from '@/services/system';
import { formatDate } from '@/utils';

const { Search } = Input;

const AccountList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [resetPwdModalOpen, setResetPwdModalOpen] = useState(false);
  const [resetPwdAdmin, setResetPwdAdmin] = useState<AdminUser | null>(null);
  const [form] = Form.useForm();
  const [resetPwdForm] = Form.useForm();

  const fetchRoles = async () => {
    try {
      const result = await getRoleList({ pageSize: 100, status: 1 });
      setRoles(result.list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAdminList({ page, pageSize, keyword, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, status]);

  const handleCreate = () => {
    setEditingAdmin(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: AdminUser) => {
    setEditingAdmin(record);
    form.setFieldsValue({
      ...record,
      roleId: record.roleId,
    });
    setModalOpen(true);
  };

  const handleDelete = async (adminId: string) => {
    try {
      await deleteAdmin(adminId);
      message.success('删除成功');
      fetchData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (record: AdminUser) => {
    try {
      await updateAdmin(record.adminId, { status: record.status === 1 ? 0 : 1 });
      message.success('状态更新成功');
      fetchData();
    } catch (err) {
      message.error('状态更新失败');
    }
  };

  const handleSubmit = async (values: {
    username: string;
    password?: string;
    nickname?: string;
    phone?: string;
    email?: string;
    roleId?: string;
    status?: number;
  }) => {
    try {
      if (editingAdmin) {
        const { password, ...updateData } = values;
        await updateAdmin(editingAdmin.adminId, updateData);
        message.success('更新成功');
      } else {
        if (!values.password || !values.roleId) {
          message.error('密码和角色为必填项');
          return;
        }
        await createAdmin({
          username: values.username,
          password: values.password,
          nickname: values.nickname,
          phone: values.phone,
          email: values.email,
          roleId: values.roleId,
        });
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(editingAdmin ? '更新失败' : '创建失败');
    }
  };

  const handleResetPwd = (record: AdminUser) => {
    setResetPwdAdmin(record);
    resetPwdForm.resetFields();
    setResetPwdModalOpen(true);
  };

  const handleResetPwdSubmit = async (values: { newPassword: string }) => {
    if (!resetPwdAdmin) return;
    try {
      await resetAdminPassword(resetPwdAdmin.adminId, { password: values.newPassword });
      message.success('密码重置成功');
      setResetPwdModalOpen(false);
    } catch (err) {
      message.error('密码重置失败');
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (name) => name || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-',
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (name) => name ? <Tag color="blue">{name}</Tag> : '-',
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
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date) => (date ? formatDate(date) : '-'),
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
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => handleResetPwd(record)}
          >
            重置密码
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleStatusChange(record)}
          >
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
          {!record.isSuper && (
            <Popconfirm
              title="确定要删除此管理员吗？"
              onConfirm={() => handleDelete(record.adminId)}
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
        title="账号管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加管理员
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索用户名/昵称"
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
          rowKey="adminId"
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
        title={editingAdmin ? '编辑管理员' : '添加管理员'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingAdmin} />
          </Form.Item>
          {!editingAdmin && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="roleId" label="角色">
            <Select placeholder="请选择角色" allowClear>
              {roles.map((role) => (
                <Select.Option key={role.roleId} value={role.roleId}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={resetPwdModalOpen}
        onCancel={() => setResetPwdModalOpen(false)}
        onOk={() => resetPwdForm.submit()}
      >
        <Form form={resetPwdForm} onFinish={handleResetPwdSubmit} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountList;
