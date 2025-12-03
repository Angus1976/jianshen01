import { BaseRepository } from '../utils/base-repository';

// 意见反馈
export interface IFeedback {
  _id?: string;
  feedbackId: string;
  userId: string;
  userNickname: string;
  userPhone?: string;
  type: string; // suggestion/bug/complaint/other
  content: string;
  images: string[];
  contact?: string;
  status: number; // 0待处理 1处理中 2已回复 3已关闭
  replyContent?: string;
  replyAt?: Date;
  replyBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class FeedbackRepository extends BaseRepository<IFeedback> {
  constructor() {
    super('feedbacks');
  }

  async findByFeedbackId(feedbackId: string): Promise<IFeedback | null> {
    return this.findOne({ feedbackId });
  }

  async findByUserId(userId: string): Promise<IFeedback[]> {
    const { data } = await this.collection
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get();
    return data as IFeedback[];
  }

  async findByStatus(status: number): Promise<IFeedback[]> {
    const { data } = await this.collection
      .where({ status })
      .orderBy('createdAt', 'desc')
      .get();
    return data as IFeedback[];
  }
}

export const Feedback = new FeedbackRepository();
