<template>
  <view
    class="list-item"
    :class="{ 'no-border': noBorder, disabled }"
    @click="handleClick"
  >
    <!-- 左侧图标/图片 -->
    <view class="item-left" v-if="$slots.icon || icon || iconImage">
      <slot name="icon">
        <view
          v-if="icon"
          class="icon-wrapper"
          :style="{ background: iconBackground }"
        >
          <text class="icon-text">{{ icon }}</text>
        </view>
        <image
          v-else-if="iconImage"
          class="icon-image"
          :src="iconImage"
          :style="{ width: iconSize, height: iconSize }"
          mode="aspectFill"
        />
      </slot>
    </view>

    <!-- 中间内容 -->
    <view class="item-content">
      <slot>
        <text class="item-title" v-if="title">{{ title }}</text>
        <text class="item-desc" v-if="desc">{{ desc }}</text>
        <text class="item-extra" v-if="extra">{{ extra }}</text>
      </slot>
    </view>

    <!-- 右侧操作区 -->
    <view class="item-right" v-if="$slots.action || rightText || showArrow">
      <slot name="action">
        <text class="right-text" :style="{ color: rightTextColor }">{{ rightText }}</text>
        <view class="arrow" v-if="showArrow"></view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
export interface ListItemProps {
  title?: string;
  desc?: string;
  extra?: string;
  icon?: string;
  iconImage?: string;
  iconSize?: string;
  iconBackground?: string;
  rightText?: string;
  rightTextColor?: string;
  showArrow?: boolean;
  noBorder?: boolean;
  disabled?: boolean;
  url?: string;
}

const props = withDefaults(defineProps<ListItemProps>(), {
  iconSize: '80rpx',
  iconBackground: 'linear-gradient(135deg, #FF6B35, #FF8A5B)',
  rightTextColor: '',
  showArrow: false,
  noBorder: false,
  disabled: false,
  url: '',
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  if (props.disabled) return;
  if (props.url) {
    uni.navigateTo({ url: props.url });
  } else {
    emit('click');
  }
};
</script>

<style lang="scss" scoped>
.list-item {
  display: flex;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $border-color;
  transition: background-color $transition-fast;

  &:active {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:last-child,
  &.no-border {
    border-bottom: none;
  }

  &.disabled {
    opacity: $opacity-disabled;
    pointer-events: none;
  }

  .item-left {
    margin-right: $spacing-md;

    .icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $radius-md;
      box-shadow: $shadow-sm;

      .icon-text {
        font-size: 40rpx;
      }
    }

    .icon-image {
      border-radius: $radius-md;
      box-shadow: $shadow-sm;
    }
  }

  .item-content {
    flex: 1;
    min-width: 0;

    .item-title {
      display: block;
      font-size: 30rpx;
      color: $text-color;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-desc {
      display: block;
      font-size: $font-sm;
      color: $text-secondary;
      margin-top: 4rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-extra {
      display: block;
      font-size: 22rpx;
      color: $text-placeholder;
      margin-top: 4rpx;
    }
  }

  .item-right {
    display: flex;
    align-items: center;
    margin-left: $spacing-sm;

    .right-text {
      font-size: $font-md;
      color: $text-secondary;
    }

    .arrow {
      width: 16rpx;
      height: 16rpx;
      margin-left: $spacing-sm;
      border-right: 3rpx solid $text-placeholder;
      border-bottom: 3rpx solid $text-placeholder;
      transform: rotate(-45deg);
      transition: transform $transition-fast;
    }
  }

  &:active .arrow {
    transform: rotate(-45deg) translateX(4rpx);
  }
}
</style>
