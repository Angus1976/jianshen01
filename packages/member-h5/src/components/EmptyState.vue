<template>
  <view class="empty-state">
    <image
      v-if="showImage"
      class="empty-image"
      :src="imageSrc"
      mode="aspectFit"
    />
    <text class="empty-text">{{ text }}</text>
    <button
      v-if="showAction"
      class="empty-action"
      @click="handleAction"
    >
      {{ actionText }}
    </button>
  </view>
</template>

<script setup lang="ts">
export interface EmptyStateProps {
  text?: string;
  imageSrc?: string;
  showImage?: boolean;
  showAction?: boolean;
  actionText?: string;
  actionUrl?: string;
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  text: '暂无数据',
  imageSrc: '/static/empty.png',
  showImage: true,
  showAction: false,
  actionText: '去看看',
  actionUrl: '',
});

const emit = defineEmits<{
  action: [];
}>();

const handleAction = () => {
  if (props.actionUrl) {
    uni.navigateTo({ url: props.actionUrl });
  } else {
    emit('action');
  }
};
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: $text-placeholder;

  .empty-image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: $spacing-lg;
    opacity: 0.8;
  }

  .empty-text {
    font-size: $font-md;
    text-align: center;
    padding: 0 $spacing-lg;
    line-height: 1.6;
  }

  .empty-action {
    margin-top: $spacing-xl;
    padding: 20rpx 64rpx;
    font-size: $font-md;
    color: #fff;
    background: $primary-color;
    border-radius: $radius-full;
    box-shadow: $shadow-md;
    transition: transform $transition-fast, opacity $transition-fast;

    &:active {
      transform: scale(0.96);
      opacity: $opacity-active;
    }
  }
}
</style>
