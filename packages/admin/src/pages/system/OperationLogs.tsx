import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  Descriptions,
  message,
} from 'antd';
import { SearchOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getLogList, getLogDetail, exportLogs, OperationLog } from '@/services/system';
import { formatDate } from '@/utils';

const { Search } = Input;
const { RangePicker } = DatePicker;

const OperationLogs = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OperationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [module, setModule] = useState<string>();
  const [action, setAction] = useState<string>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getLogList({
        page,
        pageSize,
        module,
        action,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取日志列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, module, action, dateRange]);

  const handleViewDetail = async (record: OperationLog) => {
    try {
      const detail = await getLogDetail(record.logId);
      setSelectedLog(detail);
      setDetailModalOpen(true);
    } catch (err) {
      message.error('获取日志详情失败');
    }
  };

  const handleExport = async () => {
    try {
      const logs = await exportLogs({
        module,
        action,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      });

      // 创建 CSV 内容
      const headers = ['日志ID', '管理员', '模块', '操作', '内容', 'IP', '时间'];
      const rows = logs.map((log) => [
        log.logId,
        log.adminName || '',
        log.module,
        log.action,
        log.content || '',
        log.ip || '',
        formatDate(log.createdAt ?? undefined),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // 下载
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `操作日志_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
      link.click();

      message.success('导出成功');
    } catch (err) {
      message.error('导出失败');
    }
  };

  const moduleOptions = [
    { value: 'system', label: '系统管理' },
    { value: 'member', label: '会员管理' },
    { value: 'points', label: '积分管理' },
    { value: 'checkin', label: '打卡管理' },
    { value: 'benefits', label: '权益管理' },
    { value: 'brand', label: '品牌管理' },
  ];

  const actionOptions = [
    { value: 'create', label: '创建' },
    { value: 'update', label: '更新' },
    { value: 'delete', label: '删除' },
    { value: 'login', label: '登录' },
    { value: 'logout', label: '登出' },
    { value: 'export', label: '导出' },
  ];

  const columns: ColumnsType<OperationLog> = [
    {
      title: '管理员',
      dataIndex: 'adminName',
      key: 'adminName',
      render: (name) => name || '-',
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      render: (m) => {
        const option = moduleOptions.find((o) => o.value === m);
        return option?.label || m;
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (a) => {
        const option = actionOptions.find((o) => o.value === a);
        return option?.label || a;
      },
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 300,
      render: (content) => content || '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip) => ip || '-',
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action_btn',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="操作日志"
        extra={
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出
          </Button>
        }
      >
        <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索管理员"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <Select
            placeholder="模块"
            style={{ width: 120 }}
            allowClear
            options={moduleOptions}
            onChange={(v) => {
              setModule(v);
              setPage(1);
            }}
          />
          <Select
            placeholder="操作"
            style={{ width: 100 }}
            allowClear
            options={actionOptions}
            onChange={(v) => {
              setAction(v);
              setPage(1);
            }}
          />
          <RangePicker
            showTime
            onChange={(dates) => {
              setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
              setPage(1);
            }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="logId"
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
        title="日志详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="日志ID">{selectedLog.logId}</Descriptions.Item>
            <Descriptions.Item label="管理员">{selectedLog.adminName || '-'}</Descriptions.Item>
            <Descriptions.Item label="模块">
              {moduleOptions.find((o) => o.value === selectedLog.module)?.label || selectedLog.module}
            </Descriptions.Item>
            <Descriptions.Item label="操作">
              {actionOptions.find((o) => o.value === selectedLog.action)?.label || selectedLog.action}
            </Descriptions.Item>
            <Descriptions.Item label="内容">{selectedLog.content || '-'}</Descriptions.Item>
            <Descriptions.Item label="IP地址">{selectedLog.ip || '-'}</Descriptions.Item>
            <Descriptions.Item label="User Agent">{selectedLog.userAgent || '-'}</Descriptions.Item>
            <Descriptions.Item label="操作时间">{formatDate(selectedLog?.createdAt ?? undefined)}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OperationLogs;
