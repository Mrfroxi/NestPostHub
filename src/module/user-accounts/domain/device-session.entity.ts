import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
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
  refreshTokenHash: string;

  @Column({ type: 'varchar' })
  expiresAt: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  static create(
    deviceId: string,
    userId: string,
    ip: string,
    refreshTokenHash: string,
    expiresAt: string,
  ): DeviceSession {
    const session = new DeviceSession();
    session.deviceId = deviceId;
    session.userId = userId;
    session.ip = ip;
    session.refreshTokenHash = refreshTokenHash;
    session.expiresAt = expiresAt;
    return session;
  }
}
