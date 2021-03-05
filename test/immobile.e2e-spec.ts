import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { AuthorizationMiddleware } from '../src/middlewares/authorization.middleware';
import { UserService } from '../src/controllers/user/user.service';
const sinon = require('sinon');

describe('ImmobileController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let authMiddleware: AuthorizationMiddleware;
  
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      await app.init();
    });

    beforeAll(() => {
        userService = new UserService(null, null);
        authMiddleware = new AuthorizationMiddleware(userService);
        sinon.stub(userService, 'checksIfTokenIsValid').callsFake(() => true);
    });

    it("GET /immobile", () => {
        request(app.getHttpServer())
            .get('/immobile')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .send()
            .then((data) => {
                expect(data.body.status).toBe(200);
            });
    });

    it("GET /immobile/:id Returns 500 when invalid id is provided", () => {
        request(app.getHttpServer())
            .get('/immobile/asbdaksd')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .send()
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it("POST /immobile Returns 500 when empty data is provided", () => {
        request(app.getHttpServer())
            .post('/immobile')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .send({})
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it("PUT /immobile Returns 500 when empty data is provided", () => {
        request(app.getHttpServer())
            .put('/immobile')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .send({})
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

});