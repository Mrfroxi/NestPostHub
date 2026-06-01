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

@Entity('comments')
class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  content: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: false })
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(payload: {
    content: string;
    userId: string;
    postId: string;
  }): Comment {
    const comment = new Comment();
    comment.content = payload.content;
    comment.userId = payload.userId;
    comment.postId = payload.postId;
    return comment;
  }
}

export default Comment;
