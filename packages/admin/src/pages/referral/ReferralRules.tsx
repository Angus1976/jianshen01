import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  message,
  Descriptions,
} from 'antd';
import { GiftOutlined, TeamOutlined, TrophyOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getReferralStats,
  getReferralRules,
  updateReferralRules,
  getReferralRecords,
  getReferralRanking,
  InviteRule,
  InviteRecord,
  InviterRanking,
} from '@/services/referral';
import { formatDate } from '@/utils';

const ReferralRules = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalInvites: number;
    rewardedInvites: number;
    todayInvites: number;
    totalRewardPoints: number;
  } | null>(null);
  const [rule, setRule] = useState<InviteRule | null>(null);
  const [records, setRecords] = useState<InviteRecord[]>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [ranking, setRanking] = useState<InviterRanking[]>([]);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  const fetchStats = async () => {
    try {
      const data = await getReferralStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRule = async () => {
    try {
      const data = await getReferralRules();
      setRule(data);
      form.setFieldsValue(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const result = await getReferralRecords({ page, pageSize });
      setRecords(result.list);
      setRecordsTotal(result.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRanking = async () => {
    try {
      const data = await getReferralRanking(10);
      setRanking(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRule();
    fetchRanking();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [page, pageSize]);

  const handleSaveRule = async (values: Partial<InviteRule>) => {
    try {
      await updateReferralRules(values);
      message.success('保存成功');
      setEditing(false);
      fetchRule();
    } catch (err) {
      message.error('保存失败');
    }
  };

  const recordColumns: ColumnsType<InviteRecord> = [
    {
      title: '邀请人',
      dataIndex: 'inviterNickname',
      key: 'inviterNickname',
    },
    {
      title: '被邀请人',
      dataIndex: 'inviteeNickname',
      key: 'inviteeNickname',
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
        <Tag color={s === 1 ? 'success' : 'warning'}>
          {s === 1 ? '已奖励' : '待奖励'}
        </Tag>
      ),
    },
    {
      title: '邀请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总邀请数"
              value={stats?.totalInvites || 0}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已奖励"
              value={stats?.rewardedInvites || 0}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日邀请"
              value={stats?.todayInvites || 0}
              prefix={<CalendarOutlined style={{ color: '#ff6b35' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总奖励积分"
              value={stats?.totalRewardPoints || 0}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
              suffix="分"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 邀请规则 */}
        <Col xs={24} lg={12}>
          <Card
            title="邀请规则"
            extra={
              editing ? (
                <Space>
                  <Button onClick={() => setEditing(false)}>取消</Button>
                  <Button type="primary" onClick={() => form.submit()}>保存</Button>
                </Space>
              ) : (
                <Button type="link" onClick={() => setEditing(true)}>编辑</Button>
              )
            }
          >
            {editing ? (
              <Form form={form} onFinish={handleSaveRule} layout="vertical">
                <Form.Item name="name" label="规则名称">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="规则描述">
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Space style={{ width: '100%' }}>
                  <Form.Item name="inviterReward" label="邀请人奖励" style={{ flex: 1 }}>
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
                  </Form.Item>
                  <Form.Item name="inviteeReward" label="被邀请人奖励" style={{ flex: 1 }}>
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
                  </Form.Item>
                </Space>
                <Form.Item name="rewardCondition" label="奖励条件">
                  <Select>
                    <Select.Option value="register">注册即奖励</Select.Option>
                    <Select.Option value="bindPhone">绑定手机号</Select.Option>
                    <Select.Option value="firstOrder">首次下单</Select.Option>
                  </Select>
                </Form.Item>
                <Space style={{ width: '100%' }}>
                  <Form.Item name="maxInvitesPerDay" label="每日上限" style={{ flex: 1 }}>
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示不限" />
                  </Form.Item>
                  <Form.Item name="maxInvitesTotal" label="总上限" style={{ flex: 1 }}>
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示不限" />
                  </Form.Item>
                </Space>
                <Form.Item name="status" label="状态">
                  <Select>
                    <Select.Option value={1}>启用</Select.Option>
                    <Select.Option value={0}>禁用</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            ) : (
              <Descriptions column={1}>
                <Descriptions.Item label="规则名称">{rule?.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="描述">{rule?.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="邀请人奖励">{rule?.inviterReward || 0} 积分</Descriptions.Item>
                <Descriptions.Item label="被邀请人奖励">{rule?.inviteeReward || 0} 积分</Descriptions.Item>
                <Descriptions.Item label="奖励条件">
                  {rule?.rewardCondition === 'register' ? '注册即奖励' :
                   rule?.rewardCondition === 'bindPhone' ? '绑定手机号' :
                   rule?.rewardCondition === 'firstOrder' ? '首次下单' : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="每日上限">{rule?.maxInvitesPerDay || '不限'}</Descriptions.Item>
                <Descriptions.Item label="总上限">{rule?.maxInvitesTotal || '不限'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={rule?.status === 1 ? 'success' : 'default'}>
                    {rule?.status === 1 ? '启用' : '禁用'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Col>

        {/* 邀请排行榜 */}
        <Col xs={24} lg={12}>
          <Card title="邀请排行榜 TOP 10">
            <Table
              dataSource={ranking}
              rowKey="inviterId"
              pagination={false}
              columns={[
                {
                  title: '排名',
                  key: 'rank',
                  width: 60,
                  render: (_, __, index) => (
                    <span style={{ color: index < 3 ? '#ff6b35' : undefined, fontWeight: index < 3 ? 'bold' : undefined }}>
                      {index + 1}
                    </span>
                  ),
                },
                { title: '用户', dataIndex: 'inviterNickname', key: 'inviterNickname' },
                { title: '邀请人数', dataIndex: 'count', key: 'count' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 邀请记录 */}
      <Card title="邀请记录" style={{ marginTop: 16 }}>
        <Table
          columns={recordColumns}
          dataSource={records}
          loading={loading}
          rowKey="recordId"
          pagination={{
            current: page,
            pageSize,
            total: recordsTotal,
            showSizeChanger: true,
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

export default ReferralRules;
