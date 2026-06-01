import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Post from './post.entity';
import User from '@src/module/user-accounts/domain/user.entity';

export type LikeStatus = 'Like' | 'Dislike';

@Entity('post_reactions')
class PostReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 10, nullable: false })
  likeStatus: LikeStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  addedAt: Date;

  static create(payload: {
    postId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): PostReaction {
    const reaction = new PostReaction();
    reaction.postId = payload.postId;
    reaction.userId = payload.userId;
    reaction.likeStatus = payload.likeStatus;
    return reaction;
  }
}

export default PostReaction;
