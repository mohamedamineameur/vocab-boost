import {
  createAdminSessionFixture,
  createSessionFixture,
} from "../fixtures/session.fixture.ts";
import { expect } from "chai";
import { preTestSetup } from "../../config/pre-test.ts";
import request from "supertest";
import app from "../../app.ts";
import { faker } from "@faker-js/faker";
import { createUserCategoryFixture } from "../fixtures/user-category.fixture.ts";
import { createCategoryFixture } from "../fixtures/category.fixture.ts";

describe("UserCategory Routes", () => {
  describe("POST /user-categories", () => {
    it("should create a new user-category association", async () => {
      await preTestSetup();
      const { cookieValue, user } = await createSessionFixture();
      const category = await createCategoryFixture();
      const res = await request(app)
        .post(`/api/user-categories/${user.id}/${category.id}`)
        .set("Cookie", [`session=${cookieValue}`]);
      expect(res.status).to.equal(201);
      expect(res.body.message).to.have.property(
        "en",
        "UserCategory created successfully"
      );
      expect(res.body).to.have.property("userCategory");
      expect(res.body.userCategory).to.include({
        userId: user.id,
        categoryId: category.id,
      });
    });
    it("should not create a user-category for another user", async () => {
      await preTestSetup();
      const { cookieValue, user } = await createSessionFixture();
      const userCategory = await createUserCategoryFixture();
      const fakeId = faker.string.uuid();

      const res = await request(app)
        .post(`/api/user-categories/${fakeId}/${userCategory.categoryId}`)
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(403);
      expect(res.body.error).to.have.property("en", "Forbidden");
    });
  });
  it("should not create a user-category association with invalid categoryId", async () => {
    await preTestSetup();
    const { cookieValue, user } = await createSessionFixture();
    const fakeId = faker.string.uuid();

    const res = await request(app)
      .post(`/api/user-categories/${user.id}/${fakeId}`)
      .set("Cookie", [`session=${cookieValue}`]);

    expect(res.status).to.equal(400);
    expect(res.body.error).to.have.property("en", "Invalid categoryId");
  });

  it("should not create a duplicate user-category association", async () => {
    await preTestSetup();
    const { cookieValue, user } = await createSessionFixture();
    const userCategory = await createUserCategoryFixture({ userId: user.id });

    const res = await request(app)
      .post(`/api/user-categories/${user.id}/${userCategory.categoryId}`)
      .set("Cookie", [`session=${cookieValue}`]);
    expect(res.status).to.equal(400);
    expect(res.body.error).to.have.property(
      "en",
      "This category is already associated with the user"
    );
  });

  it("should return 401 if not authenticated", async () => {
    await preTestSetup();
    const userCategory = await createUserCategoryFixture();

    const res = await request(app).post(
      `/api/user-categories/${userCategory.userId}/${userCategory.categoryId}`
    );

    expect(res.status).to.equal(401);
    expect(res.body.error).to.have.property("en", "Authentication required");
  });




  describe("GET /user-categories", () => {
    it("should fetch all user-categories for the authenticated user", async () => {
      await preTestSetup();
      const { cookieValue, user } = await createSessionFixture();
      const userCategory = await createUserCategoryFixture({ userId: user.id });
      await createUserCategoryFixture();
      const res = await request(app)
        .get(`/api/user-categories/`)
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("userCategories").that.is.an("array");
      expect(res.body.userCategories.length).to.be.equal(1);
      expect(res.body.userCategories[0]).to.include({
        userId: user.id,
        categoryId: userCategory.categoryId,
      });
    });

    it("should fetch all user-categories for the admin user", async () => {
      await preTestSetup();
      const { cookieValue} = await createAdminSessionFixture();
      const userCategory = await createUserCategoryFixture();

      const res = await request(app)
        .get(`/api/user-categories/`)
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("userCategories").that.is.an("array");
      expect(res.body.userCategories.length).to.be.greaterThan(0);
      expect(res.body.userCategories[0]).to.include({
        userId: userCategory.userId,
        categoryId: userCategory.categoryId,
      });
    });
    it("should return 401 if not authenticated", async () => {
      await preTestSetup();
      const userCategory = await createUserCategoryFixture();

      const res = await request(app).get(
        `/api/user-categories/`
      );

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });
  });
  describe("GET /user-categories/:id", () => {
    it("should fetch a specific user-category by ID for the authenticated user", async () => {
      await preTestSetup();
      const { cookieValue, user } = await createSessionFixture();
      const userCategory = await createUserCategoryFixture({ userId: user.id });

      const res = await request(app)
        .get(`/api/user-categories/${userCategory.id}`)
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("userCategory");
      expect(res.body.userCategory).to.include({
        id: userCategory.id,
        userId: user.id,
        categoryId: userCategory.categoryId,
      });
    });

    it("should allow admin to fetch any user-category by ID", async () => {
      await preTestSetup();
      const { cookieValue } = await createAdminSessionFixture();
      const userCategory = await createUserCategoryFixture();

      const res = await request(app)
        .get(`/api/user-categories/${userCategory.id}`)
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("userCategory");
      expect(res.body.userCategory).to.include({
        id: userCategory.id,
        userId: userCategory.userId,
        categoryId: userCategory.categoryId,
      });
    });

    it("should return 404 if the user-category does not exist", async () => {
      await preTestSetup();
      const { cookieValue } = await createSessionFixture();
      const fakeId = faker.string.uuid();

      const res = await request(app)
        .get(`/api/user-categories/${fakeId}`)
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(404);
      expect(res.body.error).to.have.property("en", "UserCategory not found");
    });
    it("should return 401 if not authenticated", async () => {
      await preTestSetup();
      const userCategory = await createUserCategoryFixture();
      const res = await request(app).get(
        `/api/user-categories/${userCategory.id}`
      );

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });
  });
});
