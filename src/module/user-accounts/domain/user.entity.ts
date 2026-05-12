import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  login: string;

  @Column({ type: 'varchar', nullable: false })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  confirmCode: string;

  @Column({ type: 'varchar', nullable: true })
  recoveryCode: string | null;

  @Column({ type: 'boolean', default: false, nullable: true })
  isConfirmed: boolean;

  setConfirmed(): void {
    this.isConfirmed = true;
  }

  setRecoveryCode(newRecoveryCode: string): void {
    this.recoveryCode = newRecoveryCode;
  }

  changeConfirmationCode(newCode: string) {
    this.confirmCode = newCode;
  }

  updatePasswordHash(hash: string): void {
    this.passwordHash = hash;
    this.recoveryCode = null;
  }

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

export default User;
