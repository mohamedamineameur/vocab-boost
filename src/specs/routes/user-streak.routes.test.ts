import app from "../../app.ts";
import request from "supertest";
import { expect } from "chai";
import { 
  createUserStreakFixture,
  createYesterdayStreakFixture,
  createOldStreakFixture 
} from "../fixtures/user-streak.fixture.ts";
import { createSessionFixture } from "../fixtures/session.fixture.ts";
import { preTestSetup } from "../../config/pre-test.ts";

describe("User Streak Routes", () => {
  describe("GET /api/user-streak", () => {
    it("should get user streak", async () => {
      await preTestSetup();
      const { user, cookieValue } = await createSessionFixture();
      
      // Create a streak for the user
      const userStreak = await createUserStreakFixture({ userId: user.id });

      const res = await request(app)
        .get("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("currentStreak");
      expect(res.body).to.have.property("longestStreak");
      expect(res.body).to.have.property("lastActivityDate");
      expect(res.body.currentStreak).to.equal(userStreak.currentStreak);
      expect(res.body.longestStreak).to.equal(userStreak.longestStreak);
    });

    it("should return default streak for new user", async () => {
      await preTestSetup();
      const { cookieValue } = await createSessionFixture();

      const res = await request(app)
        .get("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`]);

      expect(res.status).to.equal(200);
      expect(res.body.currentStreak).to.equal(0);
      expect(res.body.longestStreak).to.equal(0);
      expect(res.body.lastActivityDate).to.be.null;
    });

    it("should return 401 if not authenticated", async () => {
      await preTestSetup();
      
      const res = await request(app).get("/api/user-streak");

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });
  });

  describe("POST /api/user-streak", () => {
    it("should update streak for today's activity", async () => {
      await preTestSetup();
      const { user, cookieValue } = await createSessionFixture();
      
      // Create a streak from yesterday
      const userStreak = await createYesterdayStreakFixture(user.id);
      const today = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: today,
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("currentStreak");
      expect(res.body).to.have.property("longestStreak");
      expect(res.body).to.have.property("lastActivityDate");
      // Streak should increase by 1 since last activity was yesterday
      expect(res.body.currentStreak).to.equal(userStreak.currentStreak + 1);
    });

    it("should reset streak for old activity", async () => {
      await preTestSetup();
      const { user, cookieValue } = await createSessionFixture();
      
      // Create a streak from 3 days ago
      await createOldStreakFixture(user.id);
      const today = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: today,
        });

      expect(res.status).to.equal(200);
      expect(res.body.currentStreak).to.equal(1); // Should reset to 1 for today's activity
    });

    it("should handle first activity for new user", async () => {
      await preTestSetup();
      const { cookieValue } = await createSessionFixture();

      const res = await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: new Date().toISOString().split('T')[0],
        });

      expect(res.status).to.equal(200);
      expect(res.body.currentStreak).to.equal(1);
      expect(res.body.longestStreak).to.equal(1);
      expect(res.body.lastActivityDate).to.not.be.null;
    });

    it("should update longest streak when current exceeds it", async () => {
      await preTestSetup();
      const { user, cookieValue } = await createSessionFixture();
      
      // Create a streak where current equals longest
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await createUserStreakFixture({
        userId: user.id,
        currentStreak: 5,
        longestStreak: 5,
        lastActivityDate: yesterday,
      });

      const res = await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: new Date().toISOString().split('T')[0],
        });

      expect(res.status).to.equal(200);
      expect(res.body.currentStreak).to.equal(6);
      expect(res.body.longestStreak).to.equal(6); // Should update longest streak
    });

    it("should not update streak for same day activity", async () => {
      await preTestSetup();
      const { cookieValue } = await createSessionFixture();
      
      const today = new Date().toISOString().split('T')[0];
      
      // First update
      await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: today,
        });

      // Second update on same day
      const res = await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: today,
        });

      expect(res.status).to.equal(200);
      expect(res.body.currentStreak).to.equal(1); // Should not increment
    });

    it("should return 401 if not authenticated", async () => {
      await preTestSetup();
      
      const res = await request(app)
        .post("/api/user-streak")
        .send({
          lastActivityDate: new Date().toISOString().split('T')[0],
        });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.have.property("en", "Authentication required");
    });

    it("should return 400 for invalid date format", async () => {
      await preTestSetup();
      const { cookieValue } = await createSessionFixture();
      
      const res = await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: "invalid-date",
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("should return 400 for future dates", async () => {
      await preTestSetup();
      const { cookieValue } = await createSessionFixture();
      
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const res = await request(app)
        .post("/api/user-streak")
        .set("Cookie", [`session=${cookieValue}`])
        .send({
          lastActivityDate: futureDate,
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });
  });

  describe("Multiple Users", () => {
    it("should maintain separate streaks for different users", async () => {
      await preTestSetup();
      
      // Create two users with their own streaks
      const session1 = await createSessionFixture();
      await createUserStreakFixture({ 
        userId: session1.user.id,
        currentStreak: 5,
        longestStreak: 10 
      });

      const session2 = await createSessionFixture();
      await createUserStreakFixture({ 
        userId: session2.user.id,
        currentStreak: 3,
        longestStreak: 8 
      });

      // Get first user's streak
      const res1 = await request(app)
        .get("/api/user-streak")
        .set("Cookie", [`session=${session1.cookieValue}`]);

      // Get second user's streak
      const res2 = await request(app)
        .get("/api/user-streak")
        .set("Cookie", [`session=${session2.cookieValue}`]);

      expect(res1.status).to.equal(200);
      expect(res2.status).to.equal(200);
      
      // Streaks should be independent
      expect(res1.body.currentStreak).to.equal(5);
      expect(res2.body.currentStreak).to.equal(3);
      expect(res1.body.longestStreak).to.equal(10);
      expect(res2.body.longestStreak).to.equal(8);
    });
  });
});
