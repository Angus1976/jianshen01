<template>
  <view class="mine-page">
    <!-- 用户信息 -->
    <view class="user-section">
      <view class="user-info" @click="handleUserClick">
        <image class="avatar" :src="userInfo?.avatar || '/static/default-avatar.svg'" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userInfo?.nickname || '点击登录' }}</text>
          <view class="level" v-if="userInfo">
            <text class="level-name">{{ userInfo.levelName }}</text>
            <text class="growth">成长值 {{ userInfo.growthValue }}</text>
          </view>
        </view>
        <text class="arrow">></text>
      </view>

      <view class="stats" v-if="userInfo">
        <view class="stat-item" @click="navigateTo('/pages/points/records')">
          <text class="value">{{ userInfo.availablePoints }}</text>
          <text class="label">积分</text>
        </view>
        <view class="stat-item" @click="navigateTo('/pages/benefits/index')">
          <text class="value">{{ benefitCount }}</text>
          <text class="label">福利</text>
        </view>
        <view class="stat-item" @click="navigateTo('/pages/points/orders')">
          <text class="value">{{ orderCount }}</text>
          <text class="label">订单</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('/pages/level/index')">
          <view class="icon level"></view>
          <text class="title">会员等级</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/benefits/index')">
          <view class="icon benefits"></view>
          <text class="title">我的福利</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/points/orders')">
          <view class="icon orders"></view>
          <text class="title">兑换记录</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('/pages/meals/index')">
          <view class="icon meals"></view>
          <text class="title">健身餐谱</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/referral/index')">
          <view class="icon referral"></view>
          <text class="title">推荐好友</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('/pages/brand/index')">
          <view class="icon brand"></view>
          <text class="title">品牌介绍</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/feedback/index')">
          <view class="icon feedback"></view>
          <text class="title">意见反馈</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="userInfo">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';
import { confirm } from '@/utils';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

const benefitCount = ref(0);
const orderCount = ref(0);

const handleUserClick = () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' });
  }
};

const navigateTo = (url: string) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  uni.navigateTo({ url });
};

const handleLogout = async () => {
  const confirmed = await confirm({ content: '确定要退出登录吗？' });
  if (confirmed) {
    userStore.logout();
    uni.reLaunch({ url: '/pages/home/index' });
  }
};

const loadData = async () => {
  // TODO: 加载福利和订单数量
};

onShow(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 120rpx;
}

.user-section {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 40rpx 32rpx;
  color: #fff;

  .user-info {
    display: flex;
    align-items: center;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
    }

    .info {
      flex: 1;
      margin-left: 24rpx;

      .nickname {
        display: block;
        font-size: 36rpx;
        font-weight: 500;
      }

      .level {
        margin-top: 8rpx;

        .level-name {
          display: inline-block;
          padding: 4rpx 16rpx;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20rpx;
          font-size: 24rpx;
        }

        .growth {
          margin-left: 12rpx;
          font-size: 24rpx;
          opacity: 0.9;
        }
      }
    }

    .arrow {
      font-size: 32rpx;
      opacity: 0.7;
    }
  }

  .stats {
    display: flex;
    margin-top: 32rpx;
    padding-top: 32rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);

    .stat-item {
      flex: 1;
      text-align: center;

      .value {
        display: block;
        font-size: 40rpx;
        font-weight: 600;
      }

      .label {
        display: block;
        font-size: 24rpx;
        opacity: 0.9;
        margin-top: 4rpx;
      }
    }
  }
}

.menu-section {
  padding: 24rpx;

  .menu-group {
    background: #fff;
    border-radius: $radius-lg;
    margin-bottom: 24rpx;
    overflow: hidden;

    .menu-item {
      display: flex;
      align-items: center;
      padding: 32rpx 24rpx;
      border-bottom: 1rpx solid $border-color;

      &:last-child {
        border-bottom: none;
      }

      .icon {
        width: 48rpx;
        height: 48rpx;
        border-radius: $radius-sm;
        margin-right: 20rpx;

        &.level { background: linear-gradient(135deg, #ffc107, #ff9800); }
        &.benefits { background: linear-gradient(135deg, #e91e63, #ff4081); }
        &.orders { background: linear-gradient(135deg, #2196f3, #03a9f4); }
        &.meals { background: linear-gradient(135deg, #4caf50, #8bc34a); }
        &.referral { background: linear-gradient(135deg, #9c27b0, #ba68c8); }
        &.brand { background: linear-gradient(135deg, #ff5722, #ff7043); }
        &.feedback { background: linear-gradient(135deg, #607d8b, #90a4ae); }
      }

      .title {
        flex: 1;
        font-size: 30rpx;
        color: $text-color;
      }

      .arrow {
        font-size: 28rpx;
        color: $text-placeholder;
      }
    }
  }
}

.logout-section {
  padding: 0 24rpx;

  .logout-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #fff;
    color: $error-color;
    font-size: 30rpx;
    border-radius: $radius-lg;
  }
}
</style>
