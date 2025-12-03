import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Input, Button, Space, Tag, Avatar, Select, message } from 'antd';
import { SearchOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getMemberList, exportMembers, Member } from '@/services/member';
import { getLevelList, LevelRule } from '@/services/level';
import { formatDate } from '@/utils';

const { Search } = Input;

const MemberList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [levelId, setLevelId] = useState<string>();
  const [status, setStatus] = useState<number>();
  const [levels, setLevels] = useState<LevelRule[]>([]);
  const [exporting, setExporting] = useState(false);

  const fetchLevels = async () => {
    try {
      const result = await getLevelList({ pageSize: 100 });
      setLevels(result.list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getMemberList({ page, pageSize, keyword, levelId, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取会员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, keyword, levelId, status]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const members = await exportMembers({ keyword, levelId, status });

      // 创建 CSV 内容
      const headers = ['用户ID', '昵称', '手机号', '等级', '积分', '成长值', '状态', '注册时间'];
      const rows = members.map((m) => [
        m.userId,
        m.nickname || '',
        m.phone || '',
        m.levelName || '',
        m.availablePoints,
        m.growthValue,
        m.status === 1 ? '正常' : '禁用',
        m.createdAt || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // 下载
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `会员列表_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();

      message.success('导出成功');
    } catch (err) {
      message.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const columns: ColumnsType<Member> = [
    {
      title: '会员',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <span>{text || '-'}</span>
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: '等级',
      dataIndex: 'levelName',
      key: 'levelName',
      render: (text) => text ? <Tag color="gold">{text}</Tag> : '-',
    },
    {
      title: '积分',
      dataIndex: 'availablePoints',
      key: 'availablePoints',
      render: (points) => <span style={{ color: '#ff6b35' }}>{points || 0}</span>,
    },
    {
      title: '成长值',
      dataIndex: 'growthValue',
      key: 'growthValue',
      render: (value) => value || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 1 ? 'success' : 'error'}>
          {s === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/members/${record.userId}`)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="会员管理">
        <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Search
              placeholder="搜索手机号/昵称"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={(v) => {
                setKeyword(v);
                setPage(1);
              }}
            />
            <Select
              placeholder="会员等级"
              style={{ width: 120 }}
              allowClear
              onChange={(v) => {
                setLevelId(v);
                setPage(1);
              }}
            >
              {levels.map((level) => (
                <Select.Option key={level.levelId} value={level.levelId}>
                  {level.name}
                </Select.Option>
              ))}
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
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Space>
          <Button icon={<ExportOutlined />} onClick={handleExport} loading={exporting}>
            导出
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="userId"
          pagination={{
            current: page,
            pageSize,
            total,
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
    </div>
  );
};

export default MemberList;
