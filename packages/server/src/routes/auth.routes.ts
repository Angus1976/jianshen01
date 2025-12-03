import { Router } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { authMiddleware } from '../middlewares/auth.middleware';
import { success, error } from '../utils/response';
import { User, IUser } from '../models/user.model';
import { LevelRule } from '../models/level.model';
import { InviteRecord } from '../models/referral.model';
import { PointsRecord } from '../models/points.model';
import { config } from '../config';
import { ApiCode } from '@rocketbird/shared';
import {
  getH5AuthUrl,
  getAccessToken,
  getUserInfo,
  isWechatError,
} from '../services/wechat.service';

const router = Router();

// 验证码缓存 (生产环境应使用 Redis)
const smsCodeCache = new Map<string, { code: string; expireAt: number }>();

// 生成邀请码
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 生成 JWT Token
function generateToken(user: IUser): string {
  const signOptions: SignOptions = {
    expiresIn: config.jwt.accessTokenExpire as SignOptions['expiresIn'],
  };
  return jwt.sign(
    { userId: user.userId, phone: user.phone || '' },
    config.jwt.secret,
    signOptions
  );
}

// POST /api/auth/wechat-login - 微信登录
router.post('/wechat-login', async (req, res, next) => {
  try {
    const { code, userInfo, inviteCode } = req.body;

    if (!code) {
      return error(res, ApiCode.BadRequest, '缺少微信授权码');
    }

    // 调用微信 API 获取 openId (生产环境需要实现)
    // const wxResult = await getWechatOpenId(code);
    // 这里模拟获取 openId
    const openId = `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 查找用户
    let user = await User.findByOpenId(openId);

    if (!user) {
      // 新用户注册
      const defaultLevel = await LevelRule.findByGrowthValue(0);

      user = await User.create({
        userId: uuid(),
        openId,
        nickname: userInfo?.nickName || '微信用户',
        avatar: userInfo?.avatarUrl || '',
        gender: userInfo?.gender || 0,
        levelId: defaultLevel?.levelId || '',
        levelName: defaultLevel?.name || '普通会员',
        growthValue: 0,
        totalPoints: 0,
        availablePoints: 0,
        inviteCode: generateInviteCode(),
        invitedBy: inviteCode || undefined,
        registerSource: 'wechat',
        status: 1,
        lastLoginAt: new Date(),
      });

      // 处理邀请奖励
      if (inviteCode) {
        const inviter = await User.findByInviteCode(inviteCode);
        if (inviter) {
          // 记录邀请关系
          await InviteRecord.create({
            recordId: uuid(),
            inviterId: inviter.userId,
            inviterNickname: inviter.nickname,
            inviteeId: user.userId,
            inviteeNickname: user.nickname,
            inviteCode,
            rewardPoints: 100,
            status: 1,
          });

          // 给邀请人增加积分
          await User.updatePoints(inviter.userId, 100);
          await PointsRecord.create({
            recordId: uuid(),
            userId: inviter.userId,
            type: 'earn',
            points: 100,
            balance: inviter.availablePoints + 100,
            source: 'referral',
            sourceId: user.userId,
            description: `邀请新用户 ${user.nickname} 注册`,
          });
        }
      }
    } else {
      // 更新登录时间
      await User.updateLastLogin(user.userId);
    }

    const token = generateToken(user);

    success(res, {
      token,
      userInfo: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        levelId: user.levelId,
        levelName: user.levelName,
        growthValue: user.growthValue,
        availablePoints: user.availablePoints,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/send-sms - 发送短信验证码
router.post('/send-sms', async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, ApiCode.BadRequest, '请输入正确的手机号');
    }

    // 检查发送频率限制
    const cached = smsCodeCache.get(phone);
    if (cached && Date.now() - (cached.expireAt - 5 * 60 * 1000) < 60 * 1000) {
      return error(res, ApiCode.BadRequest, '请求过于频繁，请稍后再试');
    }

    // 生成验证码
    const code = config.env === 'development' ? '123456' : String(Math.floor(100000 + Math.random() * 900000));

    // 存储验证码 (5分钟有效)
    smsCodeCache.set(phone, {
      code,
      expireAt: Date.now() + 5 * 60 * 1000,
    });

    // 生产环境发送短信 (需要实现短信服务)
    // if (config.env === 'production') {
    //   await sendSms(phone, code);
    // }

    success(res, { message: '验证码已发送' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/sms-login - 短信登录
router.post('/sms-login', async (req, res, next) => {
  try {
    const { phone, code, inviteCode } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, ApiCode.BadRequest, '请输入正确的手机号');
    }

    if (!code) {
      return error(res, ApiCode.BadRequest, '请输入验证码');
    }

    // 验证验证码
    const cached = smsCodeCache.get(phone);
    if (!cached || cached.code !== code || Date.now() > cached.expireAt) {
      return error(res, ApiCode.BadRequest, '验证码错误或已过期');
    }

    // 清除已使用的验证码
    smsCodeCache.delete(phone);

    // 查找用户
    let user = await User.findByPhone(phone);
    let isNewUser = false;

    if (!user) {
      // 新用户注册
      isNewUser = true;
      const defaultLevel = await LevelRule.findByGrowthValue(0);

      user = await User.create({
        userId: uuid(),
        openId: `phone_${phone}`,
        phone,
        nickname: `用户${phone.slice(-4)}`,
        avatar: '',
        gender: 0,
        levelId: defaultLevel?.levelId || '',
        levelName: defaultLevel?.name || '普通会员',
        growthValue: 0,
        totalPoints: 0,
        availablePoints: 0,
        inviteCode: generateInviteCode(),
        invitedBy: inviteCode || undefined,
        registerSource: 'sms',
        status: 1,
        lastLoginAt: new Date(),
      });

      // 处理邀请奖励
      if (inviteCode) {
        const inviter = await User.findByInviteCode(inviteCode);
        if (inviter) {
          await InviteRecord.create({
            recordId: uuid(),
            inviterId: inviter.userId,
            inviterNickname: inviter.nickname,
            inviteeId: user.userId,
            inviteeNickname: user.nickname,
            inviteePhone: phone,
            inviteCode,
            rewardPoints: 100,
            status: 1,
          });

          await User.updatePoints(inviter.userId, 100);
          await PointsRecord.create({
            recordId: uuid(),
            userId: inviter.userId,
            type: 'earn',
            points: 100,
            balance: inviter.availablePoints + 100,
            source: 'referral',
            sourceId: user.userId,
            description: `邀请新用户 ${user.nickname} 注册`,
          });
        }
      }
    } else {
      // 检查账号状态
      if (user.status !== 1) {
        return error(res, ApiCode.Forbidden, '账号已被禁用', 403);
      }
      await User.updateLastLogin(user.userId);
    }

    const token = generateToken(user);

    success(res, {
      token,
      isNewUser,
      userInfo: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        levelId: user.levelId,
        levelName: user.levelName,
        growthValue: user.growthValue,
        availablePoints: user.availablePoints,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ==================== 手机号 + 密码登录 ====================

// POST /api/auth/register - 手机号+密码注册
router.post('/register', async (req, res, next) => {
  try {
    const { phone, password, code, inviteCode } = req.body;

    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, ApiCode.BadRequest, '请输入正确的手机号');
    }

    // 验证密码
    if (!password || password.length < 6) {
      return error(res, ApiCode.BadRequest, '密码长度不能少于6位');
    }

    // 验证短信验证码
    if (!code) {
      return error(res, ApiCode.BadRequest, '请输入验证码');
    }

    const cached = smsCodeCache.get(phone);
    if (!cached || cached.code !== code || Date.now() > cached.expireAt) {
      return error(res, ApiCode.BadRequest, '验证码错误或已过期');
    }

    // 检查手机号是否已注册
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return error(res, ApiCode.BadRequest, '该手机号已注册');
    }

    // 清除验证码
    smsCodeCache.delete(phone);

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 获取默认等级
    const defaultLevel = await LevelRule.findByGrowthValue(0);

    // 创建用户
    const user = await User.create({
      userId: uuid(),
      openId: `phone_${phone}`,
      phone,
      password: hashedPassword,
      nickname: `用户${phone.slice(-4)}`,
      avatar: '',
      gender: 0,
      levelId: defaultLevel?.levelId || '',
      levelName: defaultLevel?.name || '普通会员',
      growthValue: 0,
      totalPoints: 0,
      availablePoints: 0,
      inviteCode: generateInviteCode(),
      invitedBy: inviteCode || undefined,
      registerSource: 'password',
      status: 1,
      lastLoginAt: new Date(),
    });

    // 处理邀请奖励
    if (inviteCode) {
      const inviter = await User.findByInviteCode(inviteCode);
      if (inviter) {
        await InviteRecord.create({
          recordId: uuid(),
          inviterId: inviter.userId,
          inviterNickname: inviter.nickname,
          inviteeId: user.userId,
          inviteeNickname: user.nickname,
          inviteePhone: phone,
          inviteCode,
          rewardPoints: 100,
          status: 1,
        });

        await User.updatePoints(inviter.userId, 100);
        await PointsRecord.create({
          recordId: uuid(),
          userId: inviter.userId,
          type: 'earn',
          points: 100,
          balance: inviter.availablePoints + 100,
          source: 'referral',
          sourceId: user.userId,
          description: `邀请新用户 ${user.nickname} 注册`,
        });
      }
    }

    const token = generateToken(user);

    success(res, {
      token,
      userInfo: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        levelId: user.levelId,
        levelName: user.levelName,
        growthValue: user.growthValue,
        availablePoints: user.availablePoints,
      },
    }, '注册成功');
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/password-login - 手机号+密码登录
router.post('/password-login', async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, ApiCode.BadRequest, '请输入正确的手机号');
    }

    // 验证密码
    if (!password) {
      return error(res, ApiCode.BadRequest, '请输入密码');
    }

    // 查找用户
    const user = await User.findByPhone(phone);
    if (!user) {
      return error(res, ApiCode.BadRequest, '手机号未注册');
    }

    // 检查是否设置了密码
    if (!user.password) {
      return error(res, ApiCode.BadRequest, '该账号未设置密码，请使用验证码登录');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return error(res, ApiCode.BadRequest, '密码错误');
    }

    // 检查账号状态
    if (user.status !== 1) {
      return error(res, ApiCode.Forbidden, '账号已被禁用', 403);
    }

    // 更新登录时间
    await User.updateLastLogin(user.userId);

    const token = generateToken(user);

    success(res, {
      token,
      userInfo: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        levelId: user.levelId,
        levelName: user.levelName,
        growthValue: user.growthValue,
        availablePoints: user.availablePoints,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/set-password - 设置/修改密码 (需要验证码)
router.put('/set-password', async (req, res, next) => {
  try {
    const { phone, password, code } = req.body;

    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, ApiCode.BadRequest, '请输入正确的手机号');
    }

    // 验证密码
    if (!password || password.length < 6) {
      return error(res, ApiCode.BadRequest, '密码长度不能少于6位');
    }

    // 验证短信验证码
    if (!code) {
      return error(res, ApiCode.BadRequest, '请输入验证码');
    }

    const cached = smsCodeCache.get(phone);
    if (!cached || cached.code !== code || Date.now() > cached.expireAt) {
      return error(res, ApiCode.BadRequest, '验证码错误或已过期');
    }

    // 查找用户
    const user = await User.findByPhone(phone);
    if (!user) {
      return error(res, ApiCode.NotFound, '用户不存在', 404);
    }

    // 清除验证码
    smsCodeCache.delete(phone);

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新密码
    await User.updateById(user._id!, { password: hashedPassword });

    success(res, { message: '密码设置成功' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/profile - 获取用户信息
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findByUserId(req.user!.userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '用户不存在', 404);
    }

    success(res, {
      userId: user.userId,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      gender: user.gender,
      birthday: user.birthday,
      province: user.province,
      city: user.city,
      levelId: user.levelId,
      levelName: user.levelName,
      growthValue: user.growthValue,
      totalPoints: user.totalPoints,
      availablePoints: user.availablePoints,
      inviteCode: user.inviteCode,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile - 更新用户信息
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { nickname, avatar, gender, birthday, province, city } = req.body;

    const user = await User.findByUserId(req.user!.userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '用户不存在', 404);
    }

    const updateData: Partial<IUser> = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = new Date(birthday);
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;

    await User.updateById(user._id!, updateData);

    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/bindPhone - 绑定手机号
router.put('/bindPhone', authMiddleware, async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, ApiCode.BadRequest, '请输入正确的手机号');
    }

    // 验证验证码
    const cached = smsCodeCache.get(phone);
    if (!cached || cached.code !== code || Date.now() > cached.expireAt) {
      return error(res, ApiCode.BadRequest, '验证码错误或已过期');
    }

    // 检查手机号是否已被使用
    const existingUser = await User.findByPhone(phone);
    if (existingUser && existingUser.userId !== req.user!.userId) {
      return error(res, ApiCode.BadRequest, '该手机号已被其他账号绑定');
    }

    const user = await User.findByUserId(req.user!.userId);
    if (!user) {
      return error(res, ApiCode.NotFound, '用户不存在', 404);
    }

    await User.updateById(user._id!, { phone });
    smsCodeCache.delete(phone);

    success(res, { message: '绑定成功' });
  } catch (err) {
    next(err);
  }
});

// ==================== H5 微信网页授权登录 ====================

// GET /api/auth/wechat/h5/url - 获取 H5 微信授权跳转 URL
router.get('/wechat/h5/url', (req, res) => {
  const { redirectUri, state, inviteCode } = req.query;

  if (!redirectUri) {
    return error(res, ApiCode.BadRequest, '缺少 redirectUri 参数');
  }

  // 将邀请码编码到 state 中
  const stateData = inviteCode ? `${state || ''}|${inviteCode}` : (state as string) || '';

  const authUrl = getH5AuthUrl(redirectUri as string, stateData, 'snsapi_userinfo');

  success(res, { authUrl });
});

// POST /api/auth/wechat/h5/login - H5 微信登录 (用授权码换取用户信息并登录)
router.post('/wechat/h5/login', async (req, res, next) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return error(res, ApiCode.BadRequest, '缺少微信授权码');
    }

    // 解析 state 中的邀请码
    let inviteCode: string | undefined;
    if (state && typeof state === 'string') {
      const parts = state.split('|');
      if (parts.length > 1) {
        inviteCode = parts[1];
      }
    }

    // 1. 用 code 换取 access_token 和 openid
    const tokenResult = await getAccessToken(code);

    if (isWechatError(tokenResult)) {
      console.error('微信获取 access_token 失败:', tokenResult);
      return error(res, ApiCode.BadRequest, `微信授权失败: ${tokenResult.errmsg}`);
    }

    const { access_token, openid, unionid } = tokenResult;

    // 2. 获取微信用户信息
    const wxUserInfo = await getUserInfo(access_token, openid);

    let nickname = '微信用户';
    let avatar = '';
    let gender = 0;
    let province = '';
    let city = '';

    if (!isWechatError(wxUserInfo)) {
      nickname = wxUserInfo.nickname || '微信用户';
      avatar = wxUserInfo.headimgurl || '';
      gender = wxUserInfo.sex || 0;
      province = wxUserInfo.province || '';
      city = wxUserInfo.city || '';
    }

    // 3. 查找或创建用户
    let user = await User.findByOpenId(openid);
    let isNewUser = false;

    if (!user) {
      // 新用户注册
      isNewUser = true;
      const defaultLevel = await LevelRule.findByGrowthValue(0);

      user = await User.create({
        userId: uuid(),
        openId: openid,
        unionId: unionid,
        nickname,
        avatar,
        gender,
        province,
        city,
        levelId: defaultLevel?.levelId || '',
        levelName: defaultLevel?.name || '普通会员',
        growthValue: 0,
        totalPoints: 0,
        availablePoints: 0,
        inviteCode: generateInviteCode(),
        invitedBy: inviteCode || undefined,
        registerSource: 'wechat_h5',
        status: 1,
        lastLoginAt: new Date(),
      });

      // 处理邀请奖励
      if (inviteCode) {
        const inviter = await User.findByInviteCode(inviteCode);
        if (inviter) {
          await InviteRecord.create({
            recordId: uuid(),
            inviterId: inviter.userId,
            inviterNickname: inviter.nickname,
            inviteeId: user.userId,
            inviteeNickname: user.nickname,
            inviteCode,
            rewardPoints: 100,
            status: 1,
          });

          await User.updatePoints(inviter.userId, 100);
          await PointsRecord.create({
            recordId: uuid(),
            userId: inviter.userId,
            type: 'earn',
            points: 100,
            balance: inviter.availablePoints + 100,
            source: 'referral',
            sourceId: user.userId,
            description: `邀请新用户 ${user.nickname} 注册`,
          });
        }
      }
    } else {
      // 检查账号状态
      if (user.status !== 1) {
        return error(res, ApiCode.Forbidden, '账号已被禁用', 403);
      }

      // 更新用户信息 (头像、昵称可能会变)
      const updateData: Partial<IUser> = {
        lastLoginAt: new Date(),
      };
      if (nickname && nickname !== '微信用户') updateData.nickname = nickname;
      if (avatar) updateData.avatar = avatar;
      if (unionid && !user.unionId) updateData.unionId = unionid;

      await User.updateById(user._id!, updateData);
      user = { ...user, ...updateData };
    }

    const token = generateToken(user);

    success(res, {
      token,
      isNewUser,
      userInfo: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        levelId: user.levelId,
        levelName: user.levelName,
        growthValue: user.growthValue,
        availablePoints: user.availablePoints,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
