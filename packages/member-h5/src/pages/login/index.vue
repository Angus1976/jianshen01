<template>
  <view class="login-page">
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">RocketBird 会员</text>
      <text class="subtitle">开启您的健康生活</text>
    </view>

    <view class="login-form">
      <!-- 微信一键登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <button class="wechat-btn" open-type="getPhoneNumber" @getphonenumber="handleWechatLogin">
        <view class="icon wechat"></view>
        <text>微信一键登录</text>
      </button>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <button class="wechat-btn" @click="handleH5WechatLogin" :loading="wxLoading">
        <view class="icon wechat" v-if="!wxLoading"></view>
        <text>{{ wxLoading ? '正在登录...' : '微信登录' }}</text>
      </button>
      <!-- #endif -->

      <!-- 或者分割线 -->
      <view class="divider">
        <view class="line"></view>
        <text>或</text>
        <view class="line"></view>
      </view>

      <!-- 登录方式切换 -->
      <view class="login-tabs">
        <view
          class="tab"
          :class="{ active: loginMode === 'sms' }"
          @click="loginMode = 'sms'"
        >
          验证码登录
        </view>
        <view
          class="tab"
          :class="{ active: loginMode === 'password' }"
          @click="loginMode = 'password'"
        >
          密码登录
        </view>
      </view>

      <!-- 手机号登录 -->
      <view class="phone-login">
        <view class="input-group">
          <input v-model="phone" type="number" maxlength="11" placeholder="请输入手机号" />
        </view>

        <!-- 验证码登录模式 -->
        <template v-if="loginMode === 'sms'">
          <view class="input-group code-input">
            <input v-model="code" type="number" maxlength="6" placeholder="请输入验证码" />
            <button class="code-btn" :disabled="countdown > 0" @click="sendCode">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
        </template>

        <!-- 密码登录模式 -->
        <template v-else>
          <view class="input-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              maxlength="20"
              placeholder="请输入密码"
            />
            <view class="password-toggle" @click="showPassword = !showPassword">
              <text>{{ showPassword ? '隐藏' : '显示' }}</text>
            </view>
          </view>

          <!-- 注册模式下需要验证码 -->
          <template v-if="isRegisterMode">
            <view class="input-group code-input">
              <input v-model="code" type="number" maxlength="6" placeholder="请输入验证码" />
              <button class="code-btn" :disabled="countdown > 0" @click="sendCode">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </view>
          </template>
        </template>

        <view class="invite-code" v-if="showInviteCode || isRegisterMode">
          <input v-model="inviteCode" placeholder="邀请码（选填）" />
        </view>

        <button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
          {{ isRegisterMode ? '注册' : '登录' }}
        </button>

        <!-- 密码模式下的切换链接 -->
        <view class="mode-switch" v-if="loginMode === 'password'">
          <text class="link" @click="isRegisterMode = !isRegisterMode">
            {{ isRegisterMode ? '已有账号？去登录' : '没有账号？去注册' }}
          </text>
          <text class="link" @click="goForgotPassword" v-if="!isRegisterMode">忘记密码</text>
        </view>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement">
      <checkbox-group @change="handleAgreementChange">
        <label class="agreement-label">
          <checkbox :checked="agreed" />
          <text>我已阅读并同意</text>
          <text class="link" @click.stop="openAgreement('user')">《用户协议》</text>
          <text>和</text>
          <text class="link" @click.stop="openAgreement('privacy')">《隐私政策》</text>
        </label>
      </checkbox-group>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores';
import { authApi } from '@/api';
import { showError, showSuccess } from '@/utils';

const userStore = useUserStore();

const phone = ref('');
const code = ref('');
const password = ref('');
const inviteCode = ref('');
const showInviteCode = ref(false);
const showPassword = ref(false);
const countdown = ref(0);
const agreed = ref(false);
const wxLoading = ref(false);
const loginMode = ref<'sms' | 'password'>('sms');
const isRegisterMode = ref(false);

const canSubmit = computed(() => {
  if (!agreed.value || phone.value.length !== 11) return false;

  if (loginMode.value === 'sms') {
    // 验证码登录: 需要手机号 + 验证码
    return code.value.length === 6;
  } else {
    // 密码模式
    if (isRegisterMode.value) {
      // 注册: 需要手机号 + 密码 + 验证码
      return password.value.length >= 6 && code.value.length === 6;
    } else {
      // 登录: 只需要手机号 + 密码
      return password.value.length >= 6;
    }
  }
});

let timer: ReturnType<typeof setInterval> | null = null;

// 判断是否在微信浏览器中
const isWechatBrowser = () => {
  // #ifdef H5
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
  // #endif
  // #ifndef H5
  return false;
  // #endif
};

// 小程序微信登录
const handleWechatLogin = async (e: { detail: { errMsg: string } }) => {
  if (!agreed.value) {
    showError('请先同意用户协议');
    return;
  }

  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    return;
  }

  try {
    // 获取微信登录 code
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    const res = await authApi.wechatLogin(loginRes.code);
    userStore.login(res);
    showSuccess('登录成功');
    navigateAfterLogin();
  } catch (error) {
    console.error('微信登录失败', error);
  }
};

// H5 微信网页授权登录
const handleH5WechatLogin = async () => {
  if (!agreed.value) {
    showError('请先同意用户协议');
    return;
  }

  // 检查是否在微信浏览器中
  if (!isWechatBrowser()) {
    showError('请在微信中打开');
    return;
  }

  try {
    wxLoading.value = true;

    // 构建回调 URL
    const currentUrl = window.location.href.split('?')[0];
    const redirectUri = `${currentUrl}`;

    // 获取微信授权 URL
    const { authUrl } = await authApi.getWechatH5AuthUrl(redirectUri, inviteCode.value || undefined);

    // 跳转到微信授权页面
    window.location.href = authUrl;
  } catch (error) {
    console.error('获取微信授权URL失败', error);
    wxLoading.value = false;
  }
};

// 处理微信授权回调 (H5)
const handleWechatCallback = async () => {
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search);
  const wxCode = urlParams.get('code');
  const state = urlParams.get('state');

  if (wxCode) {
    try {
      wxLoading.value = true;

      // 清除 URL 中的 code 参数，避免刷新重复请求
      const cleanUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, '', cleanUrl);

      // 用 code 换取用户信息并登录
      const res = await authApi.wechatH5Login(wxCode, state || undefined);
      userStore.login(res);

      if (res.isNewUser) {
        showSuccess('注册成功');
      } else {
        showSuccess('登录成功');
      }

      navigateAfterLogin();
    } catch (error) {
      console.error('微信登录失败', error);
      showError('微信登录失败，请重试');
    } finally {
      wxLoading.value = false;
    }
  }
  // #endif
};

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
  if (!agreed.value) {
    showError('请先同意用户协议');
    return;
  }

  try {
    let res;

    if (loginMode.value === 'sms') {
      // 验证码登录
      res = await authApi.smsLogin(phone.value, code.value, inviteCode.value || undefined);
    } else if (isRegisterMode.value) {
      // 密码注册
      res = await authApi.register(phone.value, password.value, code.value, inviteCode.value || undefined);
      showSuccess('注册成功');
    } else {
      // 密码登录
      res = await authApi.passwordLogin(phone.value, password.value);
    }

    userStore.login(res);
    if (!isRegisterMode.value) {
      showSuccess('登录成功');
    }
    navigateAfterLogin();
  } catch (error) {
    console.error('登录失败', error);
  }
};

const goForgotPassword = () => {
  uni.navigateTo({
    url: '/pages/forgot-password/index',
  });
};

const navigateAfterLogin = () => {
  // 首页是 tabBar 页面，使用 switchTab 跳转
  uni.switchTab({ url: '/pages/home/index' });
};

const handleAgreementChange = (e: { detail: { value: string[] } }) => {
  agreed.value = e.detail.value.length > 0;
};

const openAgreement = (type: 'user' | 'privacy') => {
  uni.navigateTo({
    url: `/pages/agreement/index?type=${type}`,
  });
};

onLoad((options) => {
  if (options?.inviteCode) {
    inviteCode.value = options.inviteCode;
    showInviteCode.value = true;
  }
});

onMounted(() => {
  // H5 环境下检查是否有微信授权回调
  handleWechatCallback();
});
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #fff;
  padding: 0 48rpx;
}

.logo-section {
  padding-top: 120rpx;
  text-align: center;

  .logo {
    width: 160rpx;
    height: 160rpx;
  }

  .title {
    display: block;
    margin-top: 24rpx;
    font-size: 40rpx;
    font-weight: 600;
    color: $text-color;
  }

  .subtitle {
    display: block;
    margin-top: 12rpx;
    font-size: 28rpx;
    color: $text-secondary;
  }
}

.login-form {
  margin-top: 80rpx;

  .login-tabs {
    display: flex;
    justify-content: center;
    gap: $spacing-xl;
    margin-bottom: $spacing-lg;

    .tab {
      padding: $spacing-sm 0;
      font-size: 30rpx;
      color: $text-secondary;
      border-bottom: 4rpx solid transparent;
      transition: all $transition-fast;

      &:active {
        opacity: $opacity-active;
      }

      &.active {
        color: $primary-color;
        border-bottom-color: $primary-color;
        font-weight: 600;
      }
    }
  }

  .wechat-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    background: #07c160;
    color: #fff;
    font-size: 32rpx;
    border-radius: $radius-full;
    box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.3);
    transition: all $transition-fast;

    &:active {
      transform: scale(0.98);
      opacity: $opacity-active;
      box-shadow: 0 2rpx 8rpx rgba(7, 193, 96, 0.2);
    }

    .icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 12rpx;
      background: url('/static/icons/wechat.png') no-repeat center;
      background-size: contain;
    }
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 48rpx 0;

    .line {
      flex: 1;
      height: 1rpx;
      background: $border-color;
    }

    text {
      padding: 0 24rpx;
      font-size: 26rpx;
      color: $text-placeholder;
    }
  }

  .phone-login {
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
          transition: all $transition-fast;

          &:active:not([disabled]) {
            transform: scale(0.96);
            opacity: $opacity-active;
          }

          &[disabled] {
            background: #ccc;
            opacity: $opacity-disabled;
          }
        }
      }

      .password-toggle {
        padding: 0 $spacing-sm;
        font-size: 26rpx;
        color: $primary-color;
        transition: opacity $transition-fast;

        &:active {
          opacity: $opacity-active;
        }
      }
    }

    .mode-switch {
      display: flex;
      justify-content: space-between;
      margin-top: $spacing-md;
      font-size: 26rpx;

      .link {
        color: $primary-color;
        transition: opacity $transition-fast;

        &:active {
          opacity: $opacity-active;
        }
      }
    }

    .invite-code {
      margin-bottom: 24rpx;

      input {
        height: 96rpx;
        border-bottom: 1rpx solid $border-color;
        font-size: 32rpx;
      }
    }

    .submit-btn {
      width: 100%;
      height: 96rpx;
      margin-top: $spacing-xl;
      background: $primary-color;
      color: #fff;
      font-size: 32rpx;
      border-radius: $radius-full;
      box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
      transition: all $transition-fast;

      &:active:not([disabled]) {
        transform: scale(0.98);
        opacity: $opacity-active;
        box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.2);
      }

      &[disabled] {
        background: #ccc;
        opacity: $opacity-disabled;
        box-shadow: none;
      }
    }
  }
}

.agreement {
  position: fixed;
  bottom: 60rpx;
  left: 48rpx;
  right: 48rpx;

  .agreement-label {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: $text-secondary;

    checkbox {
      transform: scale(0.7);
    }

    .link {
      color: $primary-color;
    }
  }
}
</style>
