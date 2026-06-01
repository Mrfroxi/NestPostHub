import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Comment from './comment.entity';
import User from '@src/module/user-accounts/domain/user.entity';

export type LikeStatus = 'Like' | 'Dislike';

@Entity('comment_reactions')
class CommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  commentId: string;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 10, nullable: false })
  likeStatus: LikeStatus;

  static create(payload: {
    commentId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): CommentReaction {
    const reaction = new CommentReaction();
    reaction.commentId = payload.commentId;
    reaction.userId = payload.userId;
    reaction.likeStatus = payload.likeStatus;
    return reaction;
  }
}

export default CommentReaction;
