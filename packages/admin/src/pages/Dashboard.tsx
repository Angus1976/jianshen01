import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Avatar, Space, Spin } from 'antd';
import {
  UserOutlined,
  GiftOutlined,
  CheckSquareOutlined,
  RiseOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getDashboardStats,
  getMemberGrowthTrend,
  getLevelDistribution,
  getCheckinRanking,
  getPointsFlow,
  DashboardStats,
  MemberGrowthData,
  LevelDistribution,
  CheckinRanking,
} from '@/services/dashboard';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowthData[]>([]);
  const [levelDistribution, setLevelDistribution] = useState<LevelDistribution[]>([]);
  const [checkinRanking, setCheckinRanking] = useState<CheckinRanking[]>([]);
  const [pointsFlow, setPointsFlow] = useState<Array<{ date: string; earned: number; consumed: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, growthData, levelData, rankingData, flowData] = await Promise.all([
          getDashboardStats(),
          getMemberGrowthTrend({ days: 7 }),
          getLevelDistribution(),
          getCheckinRanking({ limit: 10 }),
          getPointsFlow({ days: 7 }),
        ]);
        setStats(statsData);
        setMemberGrowth(growthData);
        setLevelDistribution(levelData);
        setCheckinRanking(rankingData);
        setPointsFlow(flowData);
      } catch (err) {
        console.error('获取仪表盘数据失败', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const rankingColumns: ColumnsType<CheckinRanking> = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <span
          style={{
            color: index < 3 ? '#ff6b35' : undefined,
            fontWeight: index < 3 ? 'bold' : undefined,
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size="small" icon={<UserOutlined />} />
          <span>{record.nickname}</span>
        </Space>
      ),
    },
    {
      title: '累计打卡',
      dataIndex: 'totalCheckins',
      key: 'totalCheckins',
      render: (val) => `${val} 次`,
    },
    {
      title: '连续打卡',
      dataIndex: 'consecutiveCheckins',
      key: 'consecutiveCheckins',
      render: (val) => `${val} 天`,
    },
  ];

  // 计算最大值用于归一化
  const maxGrowth = Math.max(...memberGrowth.map((d) => d.count), 1);
  const maxFlow = Math.max(...pointsFlow.flatMap((d) => [d.earned, d.consumed]), 1);
  const totalLevelCount = levelDistribution.reduce((sum, d) => sum + d.count, 0) || 1;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总会员数"
              value={stats?.members.total || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={stats?.members.todayNew || 0}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              suffix="人"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日打卡"
              value={stats?.checkin.today || 0}
              prefix={<CheckSquareOutlined style={{ color: '#ff6b35' }} />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日积分消耗"
              value={stats?.points.todayConsumed || 0}
              prefix={<GiftOutlined style={{ color: '#faad14' }} />}
              suffix="分"
            />
          </Card>
        </Col>
      </Row>

      {/* 额外统计 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃会员"
              value={stats?.members.active || 0}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审核打卡"
              value={stats?.checkin.pending || 0}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待核销订单"
              value={stats?.orders.pending || 0}
              prefix={<ShoppingOutlined style={{ color: '#eb2f96' }} />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="累计积分发放"
              value={stats?.points.totalEarned || 0}
              prefix={<GiftOutlined style={{ color: '#13c2c2' }} />}
              suffix="分"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="会员增长趋势 (近7天)">
            <div style={{ padding: '16px 0' }}>
              {memberGrowth.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 8 }}>
                  {memberGrowth.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 40,
                          height: Math.max((item.count / maxGrowth) * 160, 4),
                          background: 'linear-gradient(180deg, #1890ff 0%, #69c0ff 100%)',
                          borderRadius: 4,
                          transition: 'height 0.3s',
                        }}
                      />
                      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                        {item.date.slice(5)}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 'bold' }}>{item.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  暂无数据
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="积分流动分析 (近7天)">
            <div style={{ padding: '16px 0' }}>
              {pointsFlow.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 8 }}>
                  {pointsFlow.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 140 }}>
                        <div
                          style={{
                            width: 16,
                            height: Math.max((item.earned / maxFlow) * 140, 4),
                            background: '#52c41a',
                            borderRadius: 2,
                          }}
                          title={`发放: ${item.earned}`}
                        />
                        <div
                          style={{
                            width: 16,
                            height: Math.max((item.consumed / maxFlow) * 140, 4),
                            background: '#ff6b35',
                            borderRadius: 2,
                          }}
                          title={`消耗: ${item.consumed}`}
                        />
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                        {item.date.slice(5)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  暂无数据
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#52c41a', borderRadius: 2, marginRight: 4 }} />发放</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ff6b35', borderRadius: 2, marginRight: 4 }} />消耗</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="等级分布">
            <div style={{ padding: '16px 0' }}>
              {levelDistribution.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {levelDistribution.map((level) => (
                    <div key={level.levelId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>{level.levelName}</span>
                        <span style={{ color: '#666' }}>{level.count} 人 ({level.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress
                        percent={(level.count / totalLevelCount) * 100}
                        showInfo={false}
                        strokeColor={{
                          '0%': '#1890ff',
                          '100%': '#69c0ff',
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  暂无数据
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="打卡排行榜 TOP 10">
            <Table
              columns={rankingColumns}
              dataSource={checkinRanking}
              rowKey="userId"
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无数据' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
