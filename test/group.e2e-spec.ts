import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('GroupController (e2e)', () => {
    let app: INestApplication;
  
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      await app.init();
    });
  
    it('GET /group', () => {
        request(app.getHttpServer())
            .get('/group')
            .then((data) => {
                expect(data.body.status).toBe(200);
            });
    });

    it("GET /group/:id Invalid id", () => {
        request(app.getHttpServer())
            .get("/group/123454asd")
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it("POST /group", () => {
        request(app.getHttpServer())
            .post("/group")
            .send({
                description: "NEW GROUP"
            })
            .then((data) => {
                expect(data.body.status).toBe(200);
            });

    });

    it("PUT /group without id", () => {
        request(app.getHttpServer())
            .put("/group")
            .send({})
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it("DELETE /group/:id invalid id", () => {
        request(app.getHttpServer())
            .delete("/group/alksdjalk")
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

  });