import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import User from '@src/module/user-accounts/domain/user.entity';

@Entity('device_sessions')
export class DeviceSession {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'varchar', nullable: true })
  ip: string;

  @Column({ type: 'varchar', nullable: false })
  refreshToken: string;

  @Column({ type: 'varchar' })
  expiresAt: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  userId: string;

  static create(payload: {
    deviceId: string;
    userId: string;
    ip: string;
    refreshToken: string;
    expiresAt: string;
  }): DeviceSession {
    const session = new DeviceSession();
    session.deviceId = payload.deviceId;
    session.userId = payload.userId;
    session.ip = payload.ip;
    session.refreshToken = payload.refreshToken;
    session.expiresAt = payload.expiresAt;
    return session;
  }
}
