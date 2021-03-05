import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { AuthorizationMiddleware } from '../src/middlewares/authorization.middleware';
import { UserService } from '../src/controllers/user/user.service';
const sinon = require('sinon');

describe('GroupController (e2e)', () => {
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
  
    it('GET /group', () => {

        request(app.getHttpServer())
            .get('/group')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(200);
            });
    });

    it("GET /group/:id Invalid id", () => {

        request(app.getHttpServer())
            .get("/group/123454asd")
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it("POST /group", () => {
        var number = Math.random();

        request(app.getHttpServer())
            .post("/group")
            .send({
                description: "NEW GROUP "+number+""
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(200);
            });

    });

    it("PUT /group without id", () => {

        request(app.getHttpServer())
            .put("/group")
            .send({})
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

  });