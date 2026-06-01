import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Post from './post.entity';

@Entity('comments')
class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  content: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  userLogin: string;

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
    userLogin: string;
    postId: string;
  }): Comment {
    const comment = new Comment();
    comment.content = payload.content;
    comment.userId = payload.userId;
    comment.userLogin = payload.userLogin;
    comment.postId = payload.postId;
    return comment;
  }
}

export default Comment;
