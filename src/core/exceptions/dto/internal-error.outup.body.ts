import { Extension } from '../domain-exceptions';
import { DomainExceptionCode } from '../domain-exception-codes';

export type ErrorResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  errorsMessages: Extension[];
  code: DomainExceptionCode;
};

export type DomainExceptionsResponseBody = {
  errorsMessages: Extension[];
};
