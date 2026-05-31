import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Blog from './blog.entity';

@Entity('posts')
class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  shortDescription: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  content: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  blogName: string;

  @Column({ type: 'uuid', nullable: false })
  blogId: string;

  @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(payload: {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
  }): Post {
    const post = new Post();
    post.title = payload.title;
    post.shortDescription = payload.shortDescription;
    post.content = payload.content;
    post.blogId = payload.blogId;
    post.blogName = payload.blogName;
    return post;
  }
}

export default Post;
