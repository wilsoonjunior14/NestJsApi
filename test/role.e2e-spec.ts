import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
    let app: INestApplication;
  
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      await app.init();
    });
  
    it('GET /role', () => {
        request(app.getHttpServer())
            .get('/role')
            .then((data) => {
                expect(data.body.length > 0).toBeTruthy();
            });
    });

    it('GET /role/:id Returns 500', () => {
        request(app.getHttpServer())
            .get('/role/'+'abced')
            .then((data) => {
                expect(data.body.statusCode).toBe(500);
            });
    });

    it('POST /role', () => {
        var roleMocked = {
            description: "ABC"
        };

        request(app.getHttpServer())
            .post('/role')
            .send(roleMocked)
            .then((data) => {
                expect(data.body.status).toBe(200);
            });
    });

    it('PUT /role Returns 500', () => {
        request(app.getHttpServer())
            .put('/role')
            .send({})
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it ('DELETE /role/:id Returns 500', () => {
        request(app.getHttpServer())
            .delete('/role/'+'abcde')
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });
  });