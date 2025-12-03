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
  Avatar,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getFeedbackList,
  getFeedbackStats,
  replyFeedback,
  updateFeedbackStatus,
  Feedback,
} from '@/services/feedback';
import { formatDate } from '@/utils';

const { Search } = Input;

const FeedbackList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [type, setType] = useState<string>();
  const [status, setStatus] = useState<number>();
  const [keyword, setKeyword] = useState('');
  const [stats, setStats] = useState<{
    total: number;
    byStatus: { pending: number; processing: number; replied: number; closed: number };
    byType: { suggestion: number; bug: number; complaint: number; other: number };
  } | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingFeedback, setReplyingFeedback] = useState<Feedback | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [form] = Form.useForm();

  const fetchStats = async () => {
    try {
      const data = await getFeedbackStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getFeedbackList({ page, pageSize, type, status, keyword });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取反馈列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, type, status, keyword]);

  const handleReply = (record: Feedback) => {
    setReplyingFeedback(record);
    form.resetFields();
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async (values: { replyContent: string }) => {
    if (!replyingFeedback) return;
    try {
      await replyFeedback(replyingFeedback.feedbackId, values);
      message.success('回复成功');
      setReplyModalOpen(false);
      fetchData();
      fetchStats();
    } catch (err) {
      message.error('回复失败');
    }
  };

  const handleStatusChange = async (feedbackId: string, newStatus: number) => {
    try {
      await updateFeedbackStatus(feedbackId, { status: newStatus });
      message.success('状态更新成功');
      fetchData();
      fetchStats();
    } catch (err) {
      message.error('状态更新失败');
    }
  };

  const handleViewDetail = (record: Feedback) => {
    setSelectedFeedback(record);
    setDetailModalOpen(true);
  };

  const typeMap: Record<string, { text: string; color: string }> = {
    suggestion: { text: '建议', color: 'blue' },
    bug: { text: '问题', color: 'red' },
    complaint: { text: '投诉', color: 'orange' },
    other: { text: '其他', color: 'default' },
  };

  const statusMap: Record<number, { text: string; color: string }> = {
    0: { text: '待处理', color: 'warning' },
    1: { text: '处理中', color: 'processing' },
    2: { text: '已回复', color: 'success' },
    3: { text: '已关闭', color: 'default' },
  };

  const columns: ColumnsType<Feedback> = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.userAvatar} />
          <span>{record.userNickname}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (t) => <Tag color={typeMap[t]?.color}>{typeMap[t]?.text || t}</Tag>,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 250,
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      render: (images: string[]) =>
        images && images.length > 0 ? (
          <Image.PreviewGroup>
            <Space>
              {images.slice(0, 2).map((img, idx) => (
                <Image key={idx} src={img} width={30} height={30} style={{ objectFit: 'cover' }} />
              ))}
              {images.length > 2 && <span>+{images.length - 2}</span>}
            </Space>
          </Image.PreviewGroup>
        ) : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status !== 2 && record.status !== 3 && (
            <Button type="link" size="small" onClick={() => handleReply(record)}>
              回复
            </Button>
          )}
          {record.status !== 3 && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleStatusChange(record.feedbackId, 3)}
            >
              关闭
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats?.byStatus.pending || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="处理中"
              value={stats?.byStatus.processing || 0}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已回复"
              value={stats?.byStatus.replied || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已关闭"
              value={stats?.byStatus.closed || 0}
              prefix={<CloseCircleOutlined style={{ color: '#999' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="反馈管理">
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索反馈内容"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={(v) => {
              setKeyword(v);
              setPage(1);
            }}
          />
          <Select
            placeholder="类型"
            style={{ width: 100 }}
            allowClear
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
          >
            <Select.Option value="suggestion">建议</Select.Option>
            <Select.Option value="bug">问题</Select.Option>
            <Select.Option value="complaint">投诉</Select.Option>
            <Select.Option value="other">其他</Select.Option>
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
            <Select.Option value={0}>待处理</Select.Option>
            <Select.Option value={1}>处理中</Select.Option>
            <Select.Option value={2}>已回复</Select.Option>
            <Select.Option value={3}>已关闭</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="feedbackId"
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

      {/* 回复弹窗 */}
      <Modal
        title="回复反馈"
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleReplySubmit} layout="vertical">
          <Form.Item
            name="replyContent"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入回复内容" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="反馈详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedFeedback && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Avatar src={selectedFeedback.userAvatar} size={48} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{selectedFeedback.userNickname}</div>
                <div style={{ color: '#999' }}>{formatDate(selectedFeedback.createdAt)}</div>
              </div>
              <Tag color={typeMap[selectedFeedback.type]?.color}>
                {typeMap[selectedFeedback.type]?.text}
              </Tag>
              <Tag color={statusMap[selectedFeedback.status]?.color}>
                {statusMap[selectedFeedback.status]?.text}
              </Tag>
            </Space>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>反馈内容</div>
              <div>{selectedFeedback.content}</div>
            </div>

            {selectedFeedback.images && selectedFeedback.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>图片</div>
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedFeedback.images.map((img, idx) => (
                      <Image key={idx} src={img} width={100} height={100} style={{ objectFit: 'cover' }} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            {selectedFeedback.contact && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>联系方式</div>
                <div>{selectedFeedback.contact}</div>
              </div>
            )}

            {selectedFeedback.replyContent && (
              <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>回复内容</div>
                <div>{selectedFeedback.replyContent}</div>
                <div style={{ color: '#999', marginTop: 8 }}>
                  回复时间: {formatDate(selectedFeedback.replyAt)}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackList;
