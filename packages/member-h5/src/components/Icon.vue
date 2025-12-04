<template>
  <view class="icon" :class="[`icon-${name}`, `icon-${size}`]" :style="customStyle">
    <text v-if="isEmoji">{{ emojiMap[name] || name }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'check'
  | 'close'
  | 'plus'
  | 'minus'
  | 'star'
  | 'heart'
  | 'gift'
  | 'medal'
  | 'fire'
  | 'clock'
  | 'calendar'
  | 'share'
  | 'copy'
  | 'edit'
  | 'delete'
  | 'refresh'
  | 'loading';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  name: IconName | string;
  size?: IconSize;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: '',
});

// 使用 SVG 形式的图标映射（通过 CSS 伪元素实现）
const emojiMap: Record<string, string> = {
  'arrow-right': '',
  'arrow-left': '',
  'arrow-up': '',
  'arrow-down': '',
  check: '✓',
  close: '✕',
  plus: '+',
  minus: '-',
  star: '★',
  heart: '❤',
  gift: '🎁',
  medal: '🏅',
  fire: '🔥',
  clock: '🕐',
  calendar: '📅',
  share: '📤',
  copy: '📋',
  edit: '✏',
  delete: '🗑',
  refresh: '↻',
  loading: '⟳',
};

const isEmoji = computed(() => {
  return !['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down'].includes(props.name);
});

const customStyle = computed(() => {
  const styles: Record<string, string> = {};
  if (props.color) {
    styles.color = props.color;
  }
  return styles;
});
</script>

<style lang="scss" scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-fast;

  // 尺寸
  &.icon-xs {
    width: 24rpx;
    height: 24rpx;
    font-size: 20rpx;
  }

  &.icon-sm {
    width: 32rpx;
    height: 32rpx;
    font-size: 24rpx;
  }

  &.icon-md {
    width: 40rpx;
    height: 40rpx;
    font-size: 28rpx;
  }

  &.icon-lg {
    width: 48rpx;
    height: 48rpx;
    font-size: 32rpx;
  }

  &.icon-xl {
    width: 64rpx;
    height: 64rpx;
    font-size: 40rpx;
  }

  // 箭头图标使用 CSS 绘制
  &.icon-arrow-right::after,
  &.icon-arrow-left::after,
  &.icon-arrow-up::after,
  &.icon-arrow-down::after {
    content: '';
    display: block;
    width: 16rpx;
    height: 16rpx;
    border-right: 3rpx solid currentColor;
    border-bottom: 3rpx solid currentColor;
  }

  &.icon-arrow-right::after {
    transform: rotate(-45deg);
    margin-left: -4rpx;
  }

  &.icon-arrow-left::after {
    transform: rotate(135deg);
    margin-right: -4rpx;
  }

  &.icon-arrow-up::after {
    transform: rotate(-135deg);
    margin-top: 4rpx;
  }

  &.icon-arrow-down::after {
    transform: rotate(45deg);
    margin-top: -4rpx;
  }

  // 不同尺寸的箭头调整
  &.icon-xs.icon-arrow-right::after,
  &.icon-xs.icon-arrow-left::after,
  &.icon-xs.icon-arrow-up::after,
  &.icon-xs.icon-arrow-down::after {
    width: 12rpx;
    height: 12rpx;
    border-width: 2rpx;
  }

  &.icon-lg.icon-arrow-right::after,
  &.icon-lg.icon-arrow-left::after,
  &.icon-lg.icon-arrow-up::after,
  &.icon-lg.icon-arrow-down::after {
    width: 20rpx;
    height: 20rpx;
    border-width: 4rpx;
  }

  // Loading 动画
  &.icon-loading {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
