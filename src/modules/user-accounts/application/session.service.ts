import { SessionRepository } from '../infastructure/session.repository';

export class SessionService {
  constructor(private readonly SessionRepository: SessionRepository) {}
}
