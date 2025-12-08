<template>
  <view class="user-debug">
    <text>路径调试页（查看浏览器控制台获取 BASE_URL 信息）</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';

const logPaths = () => {
  console.log('[user/index] import.meta.env.BASE_URL =', import.meta.env.BASE_URL);
  console.log('[user/index] process.env.BASE_URL =', process.env.BASE_URL);
  const href = typeof window === 'undefined' ? 'N/A' : window.location.href;
  console.log('[user/index] window.location.href =', href);
};

onLoad(logPaths);
</script>

<style scoped>
.user-debug {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 32rpx;
  color: #444;
  background: #f9f9f9;
}
</style>
