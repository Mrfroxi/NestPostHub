import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import supertest from 'supertest';

export const deleteAllData = async (app: INestApplication):Promise<supertest.Request> => {
  return request(app.getHttpServer()).delete(`/api/testing/all-data`);
};
