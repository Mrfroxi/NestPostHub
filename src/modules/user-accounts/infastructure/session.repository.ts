import { SessionModelType } from '../domain/session.entity';

export class SessionRepository {
  constructor(private readonly sessionModel: SessionModelType) {}
}
