import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum RateLimitStatus {
  Allowed = 'Allowed',
  Blocked = 'Blocked',
}

@Entity('rate_limit_attempts')
export class RateLimitAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: false })
  endpoint: string;

  @Column({
    type: 'enum',
    enum: RateLimitStatus,
    nullable: false,
  })
  status: RateLimitStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}