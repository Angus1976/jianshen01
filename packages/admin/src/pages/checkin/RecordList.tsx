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
} from 'antd';
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getCheckinRecords, reviewCheckinRecord, CheckinRecord } from '@/services/checkin';
import { formatDate } from '@/utils';

const { Search } = Input;

const RecordList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CheckinRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<number>();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingRecord, setReviewingRecord] = useState<CheckinRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CheckinRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getCheckinRecords({ page, pageSize, status });
      setData(result.list);
      setTotal(result.total);
    } catch (err) {
      message.error('获取记录列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, status]);

  const handleReview = (record: CheckinRecord, approve: boolean) => {
    setReviewingRecord(record);
    form.setFieldsValue({ status: approve ? 1 : 2 });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (values: { status: number; rejectReason?: string }) => {
    if (!reviewingRecord) return;
    try {
      await reviewCheckinRecord(reviewingRecord.recordId, values);
      message.success(values.status === 1 ? '审核通过' : '审核拒绝');
      setReviewModalOpen(false);
      fetchData();
    } catch (err) {
      message.error('审核失败');
    }
  };

  const handleViewDetail = (record: CheckinRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const statusMap: Record<number, { text: string; color: string }> = {
    0: { text: '待审核', color: 'warning' },
    1: { text: '已通过', color: 'success' },
    2: { text: '已拒绝', color: 'error' },
  };

  const columns: ColumnsType<CheckinRecord> = [
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
      title: '主题',
      dataIndex: 'themeName',
      key: 'themeName',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
      render: (content) => content || '-',
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      render: (images: string[]) =>
        images && images.length > 0 ? (
          <Image.PreviewGroup>
            <Space>
              {images.slice(0, 3).map((img, idx) => (
                <Image key={idx} src={img} width={40} height={40} style={{ objectFit: 'cover' }} />
              ))}
              {images.length > 3 && <span>+{images.length - 3}</span>}
            </Space>
          </Image.PreviewGroup>
        ) : (
          '-'
        ),
    },
    {
      title: '奖励积分',
      dataIndex: 'rewardPoints',
      key: 'rewardPoints',
      render: (points) => <span style={{ color: '#ff6b35' }}>{points}</span>,
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
      title: '打卡时间',
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
          {record.status === 0 && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleReview(record, true)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReview(record, false)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="打卡记录">
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索用户昵称"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Select
            placeholder="审核状态"
            style={{ width: 120 }}
            allowClear
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>已通过</Select.Option>
            <Select.Option value={2}>已拒绝</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="recordId"
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
        title="审核打卡"
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleReviewSubmit} layout="vertical">
          <Form.Item name="status" label="审核结果" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>通过</Select.Option>
              <Select.Option value={2}>拒绝</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.status !== cur.status}
          >
            {({ getFieldValue }) =>
              getFieldValue('status') === 2 && (
                <Form.Item
                  name="rejectReason"
                  label="拒绝原因"
                  rules={[{ required: true, message: '请输入拒绝原因' }]}
                >
                  <Input.TextArea rows={3} placeholder="请输入拒绝原因" />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="打卡详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Avatar src={selectedRecord.userAvatar} size={48} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{selectedRecord.userNickname}</div>
                <div style={{ color: '#999' }}>{formatDate(selectedRecord.createdAt)}</div>
              </div>
            </Space>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>主题</div>
              <div>{selectedRecord.themeName}</div>
            </div>
            {selectedRecord.content && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>内容</div>
                <div>{selectedRecord.content}</div>
              </div>
            )}
            {selectedRecord.images && selectedRecord.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>图片</div>
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedRecord.images.map((img, idx) => (
                      <Image key={idx} src={img} width={100} height={100} style={{ objectFit: 'cover' }} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}
            {selectedRecord.location && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>位置</div>
                <div>{selectedRecord.location}</div>
              </div>
            )}
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>状态</div>
              <Tag color={statusMap[selectedRecord.status]?.color}>
                {statusMap[selectedRecord.status]?.text}
              </Tag>
              {selectedRecord.status === 2 && selectedRecord.rejectReason && (
                <div style={{ marginTop: 8, color: '#ff4d4f' }}>
                  拒绝原因: {selectedRecord.rejectReason}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecordList;
