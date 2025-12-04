<template>
  <view class="level-page">
    <!-- 当前等级卡片 -->
    <view class="current-level-card" v-if="myLevelInfo">
      <view class="card-bg"></view>
      <view class="card-content">
        <view class="level-badge">
          <text class="level-icon">{{ getLevelIcon(myLevelInfo.currentLevel.levelCode) }}</text>
          <text class="level-name">{{ myLevelInfo.currentLevel.name }}</text>
        </view>
        <view class="growth-info">
          <text class="growth-label">当前成长值</text>
          <text class="growth-value">{{ myLevelInfo.currentGrowth }}</text>
        </view>
        <view class="progress-section" v-if="myLevelInfo.nextLevel">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
          </view>
          <view class="progress-text">
            <text>距离{{ myLevelInfo.nextLevel.name }}还差</text>
            <text class="highlight">{{ myLevelInfo.nextLevel.minGrowth - myLevelInfo.currentGrowth }}</text>
            <text>成长值</text>
          </view>
        </view>
        <view class="max-level" v-else>
          <text>已达最高等级</text>
        </view>
      </view>
    </view>

    <!-- 等级权益 -->
    <view class="section">
      <view class="section-title">我的等级权益</view>
      <view class="benefits-grid" v-if="myLevelInfo?.currentLevel.benefits">
        <view
          class="benefit-item"
          v-for="benefit in myLevelInfo.currentLevel.benefits"
          :key="benefit.code"
        >
          <view class="benefit-icon">{{ getBenefitIcon(benefit.code) }}</view>
          <text class="benefit-name">{{ benefit.name }}</text>
          <text class="benefit-desc">{{ benefit.description }}</text>
        </view>
      </view>
    </view>

    <!-- 等级说明 -->
    <view class="section">
      <view class="section-title">等级说明</view>
      <view class="level-list">
        <view
          class="level-item"
          v-for="level in levels"
          :key="level.levelId"
          :class="{ current: myLevelInfo?.currentLevel.levelId === level.levelId }"
        >
          <view class="level-header">
            <view class="level-badge-small">
              <text class="level-icon">{{ getLevelIcon(level.levelCode) }}</text>
              <text class="level-name">{{ level.name }}</text>
            </view>
            <text class="level-growth">{{ level.minGrowth }}成长值</text>
          </view>
          <view class="level-benefits">
            <text
              class="benefit-tag"
              v-for="benefit in level.benefits"
              :key="benefit.code"
            >
              {{ benefit.name }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 如何获取成长值 -->
    <view class="section">
      <view class="section-title">如何获取成长值</view>
      <view class="growth-rules">
        <view class="rule-item">
          <view class="rule-icon">📅</view>
          <view class="rule-content">
            <text class="rule-title">每日打卡</text>
            <text class="rule-desc">每次打卡获得5成长值</text>
          </view>
        </view>
        <view class="rule-item">
          <view class="rule-icon">💰</view>
          <view class="rule-content">
            <text class="rule-title">消费购物</text>
            <text class="rule-desc">每消费1元获得1成长值</text>
          </view>
        </view>
        <view class="rule-item">
          <view class="rule-icon">👥</view>
          <view class="rule-content">
            <text class="rule-title">邀请好友</text>
            <text class="rule-desc">每邀请1位好友获得50成长值</text>
          </view>
        </view>
        <view class="rule-item">
          <view class="rule-icon">📤</view>
          <view class="rule-content">
            <text class="rule-title">分享打卡</text>
            <text class="rule-desc">分享打卡获得2成长值</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { levelsApi } from '@/api';
import type { Level, MyLevelInfo } from '@rocketbird/shared';

const levels = ref<Level[]>([]);
const myLevelInfo = ref<MyLevelInfo | null>(null);

const progressPercent = computed(() => {
  if (!myLevelInfo.value || !myLevelInfo.value.nextLevel) return 100;
  const current = myLevelInfo.value.currentGrowth;
  const min = myLevelInfo.value.currentLevel.minGrowth;
  const max = myLevelInfo.value.nextLevel.minGrowth;
  return Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100));
});

const getLevelIcon = (levelCode: string) => {
  const icons: Record<string, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '👑',
  };
  return icons[levelCode] || '⭐';
};

const getBenefitIcon = (code: string) => {
  const icons: Record<string, string> = {
    discount: '🏷️',
    points_bonus: '✨',
    free_delivery: '🚚',
    birthday_gift: '🎁',
    priority_service: '⚡',
    exclusive_event: '🎉',
  };
  return icons[code] || '🎯';
};

// 加载等级列表
const loadLevels = async () => {
  try {
    const res = await levelsApi.getLevelList();
    levels.value = res;
  } catch (error) {
    console.error('加载等级列表失败', error);
  }
};

// 加载我的等级信息
const loadMyLevel = async () => {
  try {
    const res = await levelsApi.getMyLevelInfo();
    myLevelInfo.value = res;
  } catch (error) {
    console.error('加载我的等级失败', error);
  }
};

onShow(() => {
  loadLevels();
  loadMyLevel();
});
</script>

<style lang="scss" scoped>
.level-page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: env(safe-area-inset-bottom);
}

.current-level-card {
  position: relative;
  margin: $spacing-md;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-xl;

  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  .card-content {
    position: relative;
    padding: 40rpx;
    color: #fff;

    .level-badge {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .level-icon {
        font-size: 48rpx;
      }

      .level-name {
        font-size: 40rpx;
        font-weight: 600;
      }
    }

    .growth-info {
      margin-top: 32rpx;

      .growth-label {
        font-size: 26rpx;
        opacity: 0.9;
      }

      .growth-value {
        display: block;
        font-size: 56rpx;
        font-weight: 600;
        margin-top: 8rpx;
      }
    }

    .progress-section {
      margin-top: 32rpx;

      .progress-bar {
        height: 12rpx;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 6rpx;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: #fff;
          border-radius: 6rpx;
          transition: width 0.3s;
        }
      }

      .progress-text {
        margin-top: 16rpx;
        font-size: 24rpx;
        opacity: 0.9;

        .highlight {
          color: #ffd700;
          font-weight: 600;
          margin: 0 8rpx;
        }
      }
    }

    .max-level {
      margin-top: 32rpx;
      font-size: 28rpx;
      color: #ffd700;
    }
  }
}

.section {
  background: #fff;
  margin: $spacing-md;
  padding: $spacing-md;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  .section-title {
    font-size: 32rpx;
    font-weight: 500;
    color: $text-color;
    margin-bottom: $spacing-md;
    padding-left: $spacing-sm;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 28rpx;
      background: $primary-color;
      border-radius: 3rpx;
    }
  }
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;

  .benefit-item {
    text-align: center;
    padding: 20rpx;
    background: $bg-color;
    border-radius: $radius-md;
    transition: transform $transition-fast;

    &:active {
      transform: scale(0.96);
    }

    .benefit-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }

    .benefit-name {
      display: block;
      font-size: 26rpx;
      color: $text-color;
      font-weight: 500;
    }

    .benefit-desc {
      display: block;
      font-size: 22rpx;
      color: $text-secondary;
      margin-top: 8rpx;
    }
  }
}

.level-list {
  .level-item {
    padding: $spacing-md;
    margin-bottom: $spacing-sm;
    background: $bg-color;
    border-radius: $radius-md;
    border: 2rpx solid transparent;
    transition: all $transition-fast;

    &:last-child {
      margin-bottom: 0;
    }

    &.current {
      border-color: $primary-color;
      background: rgba(255, 107, 53, 0.05);
      box-shadow: $shadow-sm;
    }

    .level-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .level-badge-small {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .level-icon {
          font-size: 32rpx;
        }

        .level-name {
          font-size: 30rpx;
          font-weight: 500;
          color: $text-color;
        }
      }

      .level-growth {
        font-size: 26rpx;
        color: $text-secondary;
      }
    }

    .level-benefits {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-top: 16rpx;

      .benefit-tag {
        font-size: 22rpx;
        color: $primary-color;
        background: rgba(82, 196, 26, 0.1);
        padding: 6rpx 16rpx;
        border-radius: $radius-sm;
      }
    }
  }
}

.growth-rules {
  .rule-item {
    display: flex;
    align-items: center;
    padding: $spacing-md 0;
    border-bottom: 1rpx solid $border-color;
    transition: background-color $transition-fast;

    &:active {
      background-color: rgba(0, 0, 0, 0.02);
    }

    &:last-child {
      border-bottom: none;
    }

    .rule-icon {
      width: 80rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      font-size: 40rpx;
      background: $bg-color;
      border-radius: $radius-md;
      box-shadow: $shadow-sm;
    }

    .rule-content {
      flex: 1;
      margin-left: 20rpx;

      .rule-title {
        display: block;
        font-size: 28rpx;
        color: $text-color;
        font-weight: 500;
      }

      .rule-desc {
        display: block;
        font-size: 24rpx;
        color: $text-secondary;
        margin-top: 4rpx;
      }
    }
  }
}
</style>
