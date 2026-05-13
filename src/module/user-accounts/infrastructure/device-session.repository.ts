import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { DeviceSession } from '@src/module/user-accounts/domain/device-session.entity';

@Injectable()
export class DeviceSessionRepository {
  constructor(
    @InjectRepository(DeviceSession)
    private readonly repo: Repository<DeviceSession>,
  ) {}

  async save(session: DeviceSession): Promise<DeviceSession> {
    return this.repo.save(session);
  }

  async findByDeviceId(
    deviceId: string,
  ): Promise<DeviceSession | null> {
    return this.repo.findOneBy({ deviceId });
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<DeviceSession | null> {
    return this.repo.findOneBy({ deviceId, userId });
  }

  async deleteByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<void> {
    await this.repo.delete({ deviceId, userId });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async deleteAllByUserIdExcept(
    userId: string,
    excludeDeviceId: string,
  ): Promise<void> {
    await this.repo.delete({
      userId,
      deviceId: Not(excludeDeviceId),
    });
  }
}
