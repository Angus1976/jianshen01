<template>
  <view class="checkin-page">
    <!-- 打卡统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="value">{{ stats.totalCheckins }}</text>
        <text class="label">累计打卡</text>
      </view>
      <view class="stat-item">
        <text class="value">{{ stats.continuousDays }}</text>
        <text class="label">连续打卡</text>
      </view>
      <view class="stat-item">
        <text class="value">{{ stats.totalPoints }}</text>
        <text class="label">获得积分</text>
      </view>
    </view>

    <!-- 打卡主题 -->
    <view class="section">
      <view class="section-title">选择打卡主题</view>
      <view class="theme-list">
        <view class="theme-item" v-for="theme in themes" :key="theme.themeId" @click="selectTheme(theme)">
          <image class="theme-cover" :src="theme.coverImage" mode="aspectFill" />
          <view class="theme-info">
            <text class="theme-name">{{ theme.name }}</text>
            <text class="theme-reward">+{{ theme.rewardPoints }}积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 我的打卡 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">我的打卡</text>
        <text class="more" @click="navigateTo('/pages/checkin/records')">全部记录</text>
      </view>
      <view class="record-list" v-if="records.length">
        <view class="record-item" v-for="record in records" :key="record.recordId" @click="goRecordDetail(record.recordId)">
          <image class="record-image" :src="record.images[0]" mode="aspectFill" v-if="record.images.length" />
          <view class="record-info">
            <text class="record-theme">{{ record.themeName }}</text>
            <text class="record-content">{{ record.content || '暂无内容' }}</text>
            <text class="record-time">{{ formatDate(record.createdAt) }}</text>
          </view>
          <view class="record-status" :class="{ shared: record.isShared }">
            {{ record.isShared ? '已分享' : '未分享' }}
          </view>
        </view>
      </view>
      <view class="empty" v-else>
        <text>暂无打卡记录，快去打卡吧~</text>
      </view>
    </view>

    <!-- 立即打卡按钮 -->
    <view class="bottom-bar">
      <button class="checkin-btn" @click="goCreateCheckin">立即打卡</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { checkinApi } from '@/api';
import { formatDate } from '@rocketbird/shared';
import type { ICheckinTheme, ICheckinRecord } from '@rocketbird/shared';

const stats = ref({
  totalCheckins: 0,
  continuousDays: 0,
  totalPoints: 0,
});

const themes = ref<ICheckinTheme[]>([]);
const records = ref<ICheckinRecord[]>([]);

const navigateTo = (url: string) => {
  uni.navigateTo({ url });
};

const selectTheme = (theme: ICheckinTheme) => {
  uni.navigateTo({ url: `/pages/checkin/create?themeId=${theme.themeId}` });
};

const goCreateCheckin = () => {
  uni.navigateTo({ url: '/pages/checkin/create' });
};

const goRecordDetail = (recordId: string) => {
  uni.navigateTo({ url: `/pages/checkin/records?id=${recordId}` });
};

const loadData = async () => {
  try {
    // 加载统计
    const statsRes = await checkinApi.getCheckinStats();
    stats.value = statsRes;

    // 加载主题
    const themesRes = await checkinApi.getThemes();
    themes.value = themesRes;

    // 加载最近记录
    const recordsRes = await checkinApi.getMyRecords({ page: 1, pageSize: 5 });
    records.value = recordsRes.list;
  } catch (error) {
    console.error('加载数据失败', error);
  }
};

onShow(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.checkin-page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 160rpx;
}

.stats-card {
  display: flex;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  margin: 24rpx;
  padding: 40rpx;
  border-radius: $radius-lg;
  color: #fff;

  .stat-item {
    flex: 1;
    text-align: center;

    .value {
      display: block;
      font-size: 48rpx;
      font-weight: 600;
    }

    .label {
      display: block;
      font-size: 24rpx;
      opacity: 0.9;
      margin-top: 8rpx;
    }
  }
}

.section {
  background: #fff;
  margin: 24rpx;
  padding: 24rpx;
  border-radius: $radius-lg;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .more {
      font-size: 26rpx;
      color: $text-secondary;
    }
  }

  .section-title {
    font-size: 32rpx;
    font-weight: 500;
    color: $text-color;
    margin-bottom: 24rpx;
  }
}

.theme-list {
  .theme-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    .theme-cover {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-md;
    }

    .theme-info {
      flex: 1;
      margin-left: 24rpx;

      .theme-name {
        display: block;
        font-size: 30rpx;
        color: $text-color;
      }

      .theme-reward {
        display: block;
        font-size: 26rpx;
        color: $primary-color;
        margin-top: 8rpx;
      }
    }
  }
}

.record-list {
  .record-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    .record-image {
      width: 100rpx;
      height: 100rpx;
      border-radius: $radius-md;
    }

    .record-info {
      flex: 1;
      margin-left: 20rpx;

      .record-theme {
        display: block;
        font-size: 28rpx;
        color: $text-color;
      }

      .record-content {
        display: block;
        font-size: 24rpx;
        color: $text-secondary;
        margin-top: 4rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .record-time {
        display: block;
        font-size: 22rpx;
        color: $text-placeholder;
        margin-top: 4rpx;
      }
    }

    .record-status {
      font-size: 24rpx;
      color: $text-placeholder;

      &.shared {
        color: $success-color;
      }
    }
  }
}

.empty {
  text-align: center;
  padding: 60rpx 0;
  color: $text-placeholder;
  font-size: 28rpx;
}

.bottom-bar {
  position: fixed;
  /* 底部留出 tabBar 的高度 (约100rpx + 安全区域) */
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 99;

  .checkin-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #52c41a, #73d13d);
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: $radius-full;
  }
}
</style>
