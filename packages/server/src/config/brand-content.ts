import type { BrandContent } from '@rocketbird/shared/types/brand';
import { BrandContentType, BrandContentStatus } from '@rocketbird/shared/types/brand';

const now = new Date();

export const brandStory: BrandContent = {
  contentId: 'brand-story-main',
  type: BrandContentType.Story,
  title: 'RocketBird 的品牌故事',
  subtitle: '从热爱健康开始',
  content:
    'RocketBird 诞生于对健康生活的热忱。我们将专业的训练、营养与贴心服务融合，帮助会员在快节奏的都市生活中保持身体与精神的平衡。',
  summary:
    '致力于在城市中打造科学、可靠、有温度的健身服务，让每位会员在专业与陪伴中持续成长。',
  coverImage: '/static/brand-banner.png',
  images: ['/static/brand-banner.png'],
  videoUrl: '',
  videoCover: '',
  author: 'RocketBird 团队',
  tags: ['健康', '运动', '生活方式'],
  sortOrder: 1,
  viewCount: 0,
  status: BrandContentStatus.Visible,
  publishAt: now.toISOString(),
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  createdBy: 'system',
};

export const brandVideos: BrandContent[] = [
  {
    contentId: 'brand-video-1',
    type: BrandContentType.Video,
    title: '一日燃脂计划',
    subtitle: '教练实操示范',
    content: '由 RocketBird 专业教练带来的晨间燃脂训练计划。',
    summary: '20 分钟高效燃脂，全身调动。',
    coverImage: '/static/videos/video-thumb-1.png',
    images: ['/static/videos/video-thumb-1.png'],
    videoUrl: 'https://www.example.com/videos/rocketbird-fatburn.mp4',
    videoCover: '/static/videos/video-thumb-1.png',
    author: 'RocketBird 教练团队',
    tags: ['燃脂', '训练'],
    sortOrder: 1,
    viewCount: 0,
    status: BrandContentStatus.Visible,
    publishAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    createdBy: 'system',
  },
  {
    contentId: 'brand-video-2',
    type: BrandContentType.Video,
    title: '营养师谈健康膳食',
    subtitle: '膳食搭配建议',
    content: '营养师解读高效恢复期的饮食策略。',
    summary: '三餐补充 + 训练前后能量平衡。',
    coverImage: '/static/videos/video-thumb-2.png',
    images: ['/static/videos/video-thumb-2.png'],
    videoUrl: 'https://www.example.com/videos/rocketbird-nutrition.mp4',
    videoCover: '/static/videos/video-thumb-2.png',
    author: 'RocketBird 营养团队',
    tags: ['营养', '膳食'],
    sortOrder: 2,
    viewCount: 0,
    status: BrandContentStatus.Visible,
    publishAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    createdBy: 'system',
  },
];