import app from "../../app.ts";
import request from "supertest";
import { expect } from "chai";
import { faker } from "@faker-js/faker";
import { createUserAchievementFixture } from "../fixtures/user-achievement.fixture.ts";
import { createSessionFixture } from "../fixtures/session.fixture.ts";
import { preTestSetup } from "../../config/pre-test.ts";

describe("User Achievement Routes", () => {
  describe("GET /api/user-achievements", () => {
    it("should get user achievements", async () => {
      await preTestSetup();
      const { cookieValue, user } = await createSessionFixture();
      
      // Create a test achievement
      const userAchievement = await createUserAchievementFixture({ userId: user.id });

      const res = await request(app)
        .get("/api/user-achievements")
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.at.least(1);
    });

    it("should return 401 if not authenticated", async () => {
      await preTestSetup();
      
      const res = await request(app).get("/api/user-achievements");

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });
  });

  describe("POST /api/user-achievements/unlock", () => {
    it("should unlock a new achievement", async () => {
      await preTestSetup();
      const { cookieValue, user } = await createSessionFixture();
      
      const achievementData = {
        achievementId: "new-achievement",
        category: "words",
        progress: 100,
      };

      const res = await request(app)
        .post("/api/user-achievements/unlock")
        .set("Cookie", [`session=${cookieValue}`])
        .send(achievementData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body.achievementId).to.equal("new-achievement");
      expect(res.body.userId).to.equal(user.id);
    });

    it("should return 401 if not authenticated", async () => {
      await preTestSetup();
      
      const achievementData = {
        achievementId: "new-achievement",
        category: "words",
        progress: 100,
      };

      const res = await request(app)
        .post("/api/user-achievements/unlock")
        .send(achievementData);

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });
  });

  describe("PUT /api/user-achievements/progress", () => {
    it("should update achievement progress", async () => {
      await preTestSetup();
      const { cookieValue, user } = await createSessionFixture();
      
      // Create an achievement to update
      const userAchievement = await createUserAchievementFixture({ 
        userId: user.id,
        progress: 50 
      });

      const updateData = {
        achievementId: userAchievement.achievementId,
        progress: 75,
      };

      const res = await request(app)
        .put("/api/user-achievements/progress")
        .set("Cookie", [`session=${cookieValue}`])
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body.progress).to.equal(75);
    });

    it("should return 401 if not authenticated", async () => {
      await preTestSetup();
      
      const updateData = {
        achievementId: "test-achievement",
        progress: 75,
      };

      const res = await request(app)
        .put("/api/user-achievements/progress")
        .send(updateData);

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });
  });
});