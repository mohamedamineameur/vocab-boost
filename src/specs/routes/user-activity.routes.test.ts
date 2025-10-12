import app from "../../app.ts";
import request from "supertest";
import { expect } from "chai";
import { createSessionFixture } from "../fixtures/session.fixture.ts";
import { preTestSetup } from "../../config/pre-test.ts";

describe("User Activity Routes", () => {
  describe("Authentication Tests", () => {
    it("should return 401 for POST without authentication", async () => {
      await preTestSetup();
      
      const activityData = {
        activityType: "quiz_correct",
        metadata: {
          word: "hello",
          score: 100,
          timestamp: new Date().toISOString(),
        },
      };

      const res = await request(app)
        .post("/api/user-activities")
        .send(activityData);

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });

    it("should return 401 for GET without authentication", async () => {
      await preTestSetup();
      
      const res = await request(app).get("/api/user-activities");

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });

    it("should return 401 for DELETE without authentication", async () => {
      await preTestSetup();
      
      const res = await request(app)
        .delete("/api/user-activities/fake-id");

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });
  });

  describe("Basic Functionality Tests", () => {
    it("should create a new user activity with authentication", async () => {
      await preTestSetup();
      const { user, cookieValue } = await createSessionFixture();
      
      const activityData = {
        activityType: "quiz_correct",
        metadata: {
          word: "hello",
          score: 100,
          timestamp: new Date().toISOString(),
        },
      };

      const res = await request(app)
        .post("/api/user-activities")
        .set("Cookie", [`session=${cookieValue}`])
        .send(activityData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body.activityType).to.equal("quiz_correct");
      expect(res.body.userId).to.equal(user.id);
    });

    it("should get user activities with authentication", async () => {
      await preTestSetup();
      const { cookieValue } = await createSessionFixture();
      
      const res = await request(app)
        .get("/api/user-activities")
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
    });
  });
});