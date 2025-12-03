<template>
  <view class="forgot-password-page">
    <view class="form-section">
      <view class="input-group">
        <input v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>

      <view class="input-group code-input">
        <input v-model="code" type="number" maxlength="6" placeholder="请输入验证码" />
        <button class="code-btn" :disabled="countdown > 0" @click="sendCode">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </view>

      <view class="input-group">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          maxlength="20"
          placeholder="请输入新密码（至少6位）"
        />
        <view class="password-toggle" @click="showPassword = !showPassword">
          <text>{{ showPassword ? '隐藏' : '显示' }}</text>
        </view>
      </view>

      <view class="input-group">
        <input
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          maxlength="20"
          placeholder="请确认新密码"
        />
      </view>

      <button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
        重置密码
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { authApi } from '@/api';
import { showError, showSuccess } from '@/utils';

const phone = ref('');
const code = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const countdown = ref(0);

let timer: ReturnType<typeof setInterval> | null = null;

const canSubmit = computed(() => {
  return (
    phone.value.length === 11 &&
    code.value.length === 6 &&
    password.value.length >= 6 &&
    confirmPassword.value === password.value
  );
});

const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    showError('请输入正确的手机号');
    return;
  }

  try {
    await authApi.sendSms(phone.value);
    showSuccess('验证码已发送');

    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer!);
      }
    }, 1000);
  } catch (error) {
    console.error('发送验证码失败', error);
  }
};

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    showError('两次输入的密码不一致');
    return;
  }

  if (password.value.length < 6) {
    showError('密码长度不能少于6位');
    return;
  }

  try {
    await authApi.setPassword(phone.value, password.value, code.value);
    showSuccess('密码重置成功');

    // 返回登录页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error('重置密码失败', error);
  }
};
</script>

<style lang="scss" scoped>
.forgot-password-page {
  min-height: 100vh;
  background: #fff;
  padding: 48rpx;
}

.form-section {
  .input-group {
    display: flex;
    align-items: center;
    height: 96rpx;
    border-bottom: 1rpx solid $border-color;
    margin-bottom: 24rpx;

    input {
      flex: 1;
      height: 100%;
      font-size: 32rpx;
    }

    &.code-input {
      .code-btn {
        min-width: 180rpx;
        height: 64rpx;
        line-height: 64rpx;
        background: $primary-color;
        color: #fff;
        font-size: 26rpx;
        border-radius: $radius-md;

        &[disabled] {
          background: #ccc;
        }
      }
    }

    .password-toggle {
      padding: 0 16rpx;
      font-size: 26rpx;
      color: $primary-color;
    }
  }

  .submit-btn {
    width: 100%;
    height: 96rpx;
    margin-top: 48rpx;
    background: $primary-color;
    color: #fff;
    font-size: 32rpx;
    border-radius: $radius-full;

    &[disabled] {
      background: #ccc;
    }
  }
}
</style>
