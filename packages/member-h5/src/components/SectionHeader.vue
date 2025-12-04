<template>
  <view class="section-header">
    <text class="title">{{ title }}</text>
    <view class="more" v-if="showMore" @click="handleMore">
      <text>{{ moreText }}</text>
      <view class="arrow"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
export interface SectionHeaderProps {
  title: string;
  showMore?: boolean;
  moreText?: string;
  moreUrl?: string;
}

const props = withDefaults(defineProps<SectionHeaderProps>(), {
  showMore: false,
  moreText: '查看更多',
  moreUrl: '',
});

const emit = defineEmits<{
  more: [];
}>();

const handleMore = () => {
  if (props.moreUrl) {
    uni.navigateTo({ url: props.moreUrl });
  } else {
    emit('more');
  }
};
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  .title {
    font-size: $font-lg;
    font-weight: 500;
    color: $text-color;
    position: relative;
    padding-left: $spacing-sm;

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

  .more {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: $text-secondary;
    transition: color $transition-fast;

    &:active {
      color: $primary-color;
    }

    .arrow {
      width: 12rpx;
      height: 12rpx;
      margin-left: 8rpx;
      border-right: 2rpx solid currentColor;
      border-bottom: 2rpx solid currentColor;
      transform: rotate(-45deg);
      transition: transform $transition-fast;
    }

    &:active .arrow {
      transform: rotate(-45deg) translateX(4rpx);
    }
  }
}
</style>
