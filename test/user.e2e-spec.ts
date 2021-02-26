import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('UserController (e2e)', () => {
    let app: INestApplication;
  
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      await app.init();
    });
  
    it('GET /user', () => {
        request(app.getHttpServer())
            .get('/user')
            .then((data) => {
                expect(data.body.status).toBe(200);
            });
    });

    it('GET /user/:id Returns 500 when invalid id is provided', () => {
        request(app.getHttpServer())
            .get('/user/idasd')
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it('DELETE /user/:id Returns 500 when invalid id is provided', () => {
        request(app.getHttpServer())
            .delete('/user/idasd')
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it('PUT /user/ Returns 500 when invalid data is provided', () => {
        request(app.getHttpServer())
            .put('/user')
            .send({})
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it('POST /user/ Returns 500 when invalid data is provided', () => {
        request(app.getHttpServer())
            .put('/user')
            .send({})
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

});