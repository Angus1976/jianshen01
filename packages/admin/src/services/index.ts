// API 服务导出
// 通用类型
export type { PaginatedResult } from './member';

// 会员相关
export {
  type Member,
  type MemberListParams,
  getMemberList,
  getMemberDetail,
  updateMember,
  adjustMemberLevel,
  adjustMemberPoints,
  getMemberStats,
  exportMembers,
} from './member';

// 等级相关
export {
  type LevelRule,
  type LevelListParams,
  getLevelList,
  getLevelDetail,
  createLevel,
  updateLevel,
  deleteLevel,
  getLevelStats,
} from './level';

// 积分相关
export {
  type PointsProduct,
  type ExchangeOrder,
  type PointsRecord,
  type ProductListParams,
  type OrderListParams,
  type RecordListParams as PointsRecordListParams,
  getProductList,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrderList,
  verifyOrder,
  getPointsRecords,
  getPointsStats,
} from './points';

// 打卡相关
export {
  type CheckinTheme,
  type CheckinRecord,
  type ShareRule,
  type ThemeListParams,
  type RecordListParams as CheckinRecordListParams,
  getThemeList,
  getThemeDetail,
  createTheme,
  updateTheme,
  deleteTheme,
  getCheckinRecords,
  reviewCheckinRecord,
  getShareRules,
  updateShareRules,
  getCheckinStats,
} from './checkin';

// 权益相关
export {
  type BenefitRule,
  type BenefitRecord,
  type BenefitListParams,
  type BenefitRecordParams,
  getBenefitList,
  getBenefitDetail,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  getBenefitRecords,
} from './benefits';

// 健身餐相关
export {
  type FitnessMeal,
  type MealCategory,
  type MealListParams,
  getMealList,
  getMealDetail,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealCategories,
  createMealCategory,
  updateMealCategory,
  deleteMealCategory,
} from './meals';

// 推荐相关
export {
  type InviteRule,
  type InviteRecord,
  type InviterRanking,
  type ReferralRecordParams,
  getReferralStats,
  getReferralRules,
  updateReferralRules,
  getReferralRecords,
  getReferralRanking,
} from './referral';

// 反馈相关
export {
  type Feedback,
  type FeedbackListParams,
  getFeedbackList,
  getFeedbackDetail,
  replyFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
} from './feedback';

// 系统相关
export {
  type AdminUser,
  type AdminRole,
  type PermissionModule,
  type OperationLog,
  type AdminListParams,
  type RoleListParams,
  type LogListParams,
  getAdminList,
  getAdminDetail,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
  updateAdminStatus,
  getRoleList,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  getLogList,
  getLogDetail,
  exportLogs,
} from './system';

// 仪表盘相关
export {
  type DashboardStats,
  type MemberGrowthData,
  type LevelDistribution,
  type CheckinRanking,
  getDashboardStats,
  getMemberGrowthTrend,
  getLevelDistribution,
  getCheckinRanking,
  getPointsFlow,
} from './dashboard';
