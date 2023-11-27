import { PrismaClient, Prisma } from '@prisma/client'
import request from "supertest"
import app from "../../app.js"

async function cleanupDatabase() {
  const prisma = new PrismaClient();
  const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

  return Promise.all(
    modelNames.map((modelName) => prisma[modelName.toLowerCase()].deleteMany())
  );
}

describe("POST /sign-in", () => {
  let user;

  beforeEach(async () => {
    user = {
      name: "Test User",
      email: "test@example.com",
      password: "testpassword",
    };

    await cleanupDatabase();

    await request(app)
      .post("/users")
      .send(user)
      .set('Accept', 'application/json');
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe("when signing in with correct credentials", () => {
    it("should return an accessToken", async () => {
      const response = await request(app)
        .post("/sign-in")
        .send(user)
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });
  });
  
  describe("when signing in with wrong email", () => {
    it("should return 401 and no accessToken", async () => {
      user.email = "wrong@example.com";
      const response = await request(app)
        .post("/sign-in")
        .send(user)
        .set('Accept', 'application/json');
      expect(response.statusCode).toBe(401);
      expect(response.body.accessToken).toBeFalsy;
    });
  });
  
  describe("when signing in with wrong password", () => {
    it("should return 401 and no accessToken", async () => {
      user.password = "wrongpassword";
      const response = await request(app)
        .post("/sign-in")
        .send(user)
        .set('Accept', 'application/json');
      expect(response.statusCode).toBe(401);
      expect(response.body.accessToken).toBeFalsy;
    });
  });
});