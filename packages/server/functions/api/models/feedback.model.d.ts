import { BaseRepository } from '../utils/base-repository';
export interface IFeedback {
    _id?: string;
    feedbackId: string;
    userId: string;
    userNickname: string;
    userPhone?: string;
    type: string;
    content: string;
    images: string[];
    contact?: string;
    status: number;
    replyContent?: string;
    replyAt?: Date;
    replyBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class FeedbackRepository extends BaseRepository<IFeedback> {
    constructor();
    findByFeedbackId(feedbackId: string): Promise<IFeedback | null>;
    findByUserId(userId: string): Promise<IFeedback[]>;
    findByStatus(status: number): Promise<IFeedback[]>;
}
export declare const Feedback: FeedbackRepository;
export {};
//# sourceMappingURL=feedback.model.d.ts.map