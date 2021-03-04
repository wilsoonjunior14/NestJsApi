import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { UserService } from '../src/controllers/user/user.service';
import { AuthorizationMiddleware } from '../src/middlewares/authorization.middleware';
const sinon = require('sinon');

describe('RoleController (e2e)', () => {
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
  
    it('GET /role', () => {
        request(app.getHttpServer())
            .get('/role')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(200);
            });
    });

    it('GET /role/:id Returns 500', () => {
        request(app.getHttpServer())
            .get('/role/'+'abced')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

    it('POST /role', () => {
        var roleMocked = {
            description: "ABC"
        };

        request(app.getHttpServer())
            .post('/role')
            .send(roleMocked)
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(200);
            });
    });

    it('PUT /role Returns 500', () => {
        request(app.getHttpServer())
            .put('/role')
            .send({})
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRnJhbmNpc2NvIFdpbHNvbiBSb2RyaWd1ZXMgSnIiLCJlbWFpbCI6IndqdW5pb3JfbXNuQGhvdG1haWwuY29tIiwiY3BmQ25waiI6IjAzOC4xOTIuNzczLTMxIiwiZGVsZXRlZCI6ZmFsc2UsInBob25lIjoiKDg4KTk5OTI0LTE0OTIiLCJpYXQiOjE2MTQ4NjEzNTAsImV4cCI6MTYxNDk0Nzc1MH0.-EgC-HzNi2yf0baH17FPPf9p30-dgUvuX68IV-ZFOuU')
            .then((data) => {
                expect(data.body.status).toBe(500);
            });
    });

  });