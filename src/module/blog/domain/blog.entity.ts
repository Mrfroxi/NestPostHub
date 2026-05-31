import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import Post from './post.entity';

@Entity('blogs')
class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  websiteUrl: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'boolean', default: false, nullable: false })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static create(payload: {
    name: string;
    description: string;
    websiteUrl: string;
  }): Blog {
    const blog = new Blog();
    blog.name = payload.name;
    blog.description = payload.description;
    blog.websiteUrl = payload.websiteUrl;
    return blog;
  }
}

export default Blog;
