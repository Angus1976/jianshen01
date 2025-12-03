import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Avatar,
  Tag,
  Button,
  Space,
  Tabs,
  Table,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  message,
  Spin,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getMemberDetail, adjustMemberPoints, adjustMemberLevel, Member } from '@/services/member';
import { getPointsRecords, PointsRecord } from '@/services/points';
import { getLevelList, LevelRule } from '@/services/level';
import { formatDate } from '@/utils';

const MemberDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [pointsRecords, setPointsRecords] = useState<PointsRecord[]>([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [levels, setLevels] = useState<LevelRule[]>([]);
  const [form] = Form.useForm();
  const [levelForm] = Form.useForm();

  const fetchMember = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getMemberDetail(userId);
      setMember(data);
    } catch (err) {
      message.error('获取会员信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsRecords = async () => {
    if (!userId) return;
    try {
      setPointsLoading(true);
      const data = await getPointsRecords({ userId, pageSize: 50 });
      setPointsRecords(data.list);
    } catch (err) {
      console.error(err);
    } finally {
      setPointsLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const data = await getLevelList({ pageSize: 100, status: 1 });
      setLevels(data.list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMember();
    fetchPointsRecords();
    fetchLevels();
  }, [userId]);

  const handleAdjustPoints = async (values: { points: number; type: 'earn' | 'consume'; reason: string }) => {
    if (!userId) return;
    try {
      await adjustMemberPoints(userId, values);
      message.success('积分调整成功');
      setPointsModalOpen(false);
      form.resetFields();
      fetchMember();
      fetchPointsRecords();
    } catch (err) {
      message.error('积分调整失败');
    }
  };

  const handleAdjustLevel = async (values: { levelId: string; reason?: string }) => {
    if (!userId) return;
    try {
      await adjustMemberLevel(userId, values);
      message.success('等级调整成功');
      setLevelModalOpen(false);
      levelForm.resetFields();
      fetchMember();
    } catch (err) {
      message.error('等级调整失败');
    }
  };

  const pointsColumns: ColumnsType<PointsRecord> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'earn' ? 'success' : 'error'}>
          {type === 'earn' ? '获得' : '消费'}
        </Tag>
      ),
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points, record) => (
        <span style={{ color: record.type === 'earn' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'earn' ? '+' : ''}{points}
        </span>
      ),
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!member) {
    return (
      <Card>
        <p>会员不存在</p>
        <Button onClick={() => navigate('/members')}>返回列表</Button>
      </Card>
    );
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate('/members')}
      >
        返回列表
      </Button>

      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
          <Avatar src={member.avatar} size={80} style={{ marginRight: 24 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>{member.nickname}</h2>
            <Space style={{ marginTop: 8 }}>
              <Tag color="gold">{member.levelName || '普通会员'}</Tag>
              <Tag color={member.status === 1 ? 'success' : 'error'}>
                {member.status === 1 ? '正常' : '禁用'}
              </Tag>
            </Space>
          </div>
          <Space>
            <Button icon={<EditOutlined />} onClick={() => setLevelModalOpen(true)}>
              调整等级
            </Button>
            <Button icon={<EditOutlined />} onClick={() => setPointsModalOpen(true)}>
              调整积分
            </Button>
          </Space>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="用户ID">{member.userId}</Descriptions.Item>
          <Descriptions.Item label="手机号">{member.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="可用积分">{member.availablePoints}</Descriptions.Item>
          <Descriptions.Item label="累计积分">{member.totalPoints}</Descriptions.Item>
          <Descriptions.Item label="冻结积分">{member.frozenPoints}</Descriptions.Item>
          <Descriptions.Item label="成长值">{member.growthValue}</Descriptions.Item>
          <Descriptions.Item label="累计打卡">{member.totalCheckins} 次</Descriptions.Item>
          <Descriptions.Item label="连续打卡">{member.consecutiveCheckins} 天</Descriptions.Item>
          <Descriptions.Item label="邀请码">{member.inviteCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="邀请人">{member.inviterNickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{formatDate(member.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{formatDate(member.updatedAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: 'points',
              label: '积分记录',
              children: (
                <Table
                  columns={pointsColumns}
                  dataSource={pointsRecords}
                  loading={pointsLoading}
                  rowKey="recordId"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="调整积分"
        open={pointsModalOpen}
        onCancel={() => setPointsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAdjustPoints} layout="vertical">
          <Form.Item
            name="type"
            label="调整类型"
            rules={[{ required: true, message: '请选择调整类型' }]}
          >
            <Select>
              <Select.Option value="earn">增加积分</Select.Option>
              <Select.Option value="consume">扣减积分</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="points"
            label="积分数量"
            rules={[{ required: true, message: '请输入积分数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label="调整原因"
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="调整等级"
        open={levelModalOpen}
        onCancel={() => setLevelModalOpen(false)}
        onOk={() => levelForm.submit()}
      >
        <Form form={levelForm} onFinish={handleAdjustLevel} layout="vertical">
          <Form.Item
            name="levelId"
            label="目标等级"
            rules={[{ required: true, message: '请选择目标等级' }]}
          >
            <Select>
              {levels.map((level) => (
                <Select.Option key={level.levelId} value={level.levelId}>
                  {level.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="调整原因">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberDetail;
