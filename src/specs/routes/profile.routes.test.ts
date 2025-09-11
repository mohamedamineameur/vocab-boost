import { createSessionFixture, createAdminSessionFixture } from "../fixtures/session.fixture.ts";
import {expect} from "chai";
import {preTestSetup} from "../../config/pre-test.ts";
import request from "supertest";
import app from "../../app.ts";
import { createProfileFixture } from "../fixtures/profile.fixture.ts";
import { faker } from "@faker-js/faker";

describe("Profile Routes", () => {
    describe("POST /profiles", () => {
        it("should create a new profile", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createSessionFixture();
            const profileData = {
                userId: user.id,
                local: "en",
                theme: "light",
            };
            const res = await request(app)
                .post("/api/profiles")
                .set("Cookie", [`session=${cookieValue}`])
                .send(profileData);
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal("Profile created successfully");
      
        })
        it("should not create a profile for another user", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createSessionFixture();
            const anotherUserId = faker.string.uuid();
            const profileData = {
                userId: anotherUserId,
                local: "en",
                theme: "light",
            };
            const res = await request(app)
                .post("/api/profiles")
                .set("Cookie", [`session=${cookieValue}`])
                .send(profileData);
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property("error", "Forbidden");
        });
        it("should not create a profile with missing userId", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const profileData = {
                local: "en",
                theme: "light",
            };
            const res = await request(app)
                .post("/api/profiles")
                .set("Cookie", [`session=${cookieValue}`])
                .send(profileData);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
        });
        it("should not create a profile if one already exists for the user", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createSessionFixture();
            await createProfileFixture({ userId: user.id });
            const profileData = {
                userId: user.id,
                local: "fr",
                theme: "dark",
            };
            const res = await request(app)
                .post("/api/profiles")
                .set("Cookie", [`session=${cookieValue}`])
                .send(profileData);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error", "Profile already exists for this user");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const profileData = {
                userId: 1,
                local: "en",
                theme: "light",
            };
            const res = await request(app)
                .post("/api/profiles")
                .send(profileData);
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Authentication required");
        });
        it("should return 400 for invalid creation data", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createSessionFixture();
            const profileData = {
                userId: user.id,
                local: "invalid_locale",
                theme: "light",
            };
            const res = await request(app)
                .post("/api/profiles")
                .set("Cookie", [`session=${cookieValue}`])
                .send(profileData);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
        });
    });

    describe("GET /profiles", () => {
        it("should fetch all profiles", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const res = await request(app)
                .get("/api/profiles")
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const res = await request(app)
                .get("/api/profiles");
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Authentication required");
        });
        it("should return 403 if not admin", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const res = await request(app)
                .get("/api/profiles")
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property("message", "Admin access required");
        });
    });

    describe("GET /profiles/:id", () => {
        it("should fetch a profile by ID", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createSessionFixture();
            const profile = await createProfileFixture({ userId: user.id });
            const res = await request(app)
                .get(`/api/profiles/${profile.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", profile.id);
        });
        it("should return 404 if profile not found", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const fakeId = faker.string.uuid();
            const res = await request(app)
                .get(`/api/profiles/${fakeId}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message", "Profile not found");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const res = await request(app)
                .get("/api/profiles/1");
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Authentication required");
        });
    });

    describe("PATCH /profiles/:id", () => {
        it("should update a profile's details", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createSessionFixture();
            const profile = await createProfileFixture({ userId: user.id });
            const updateData = {
                local: "fr",
                theme: "dark",
            };
            const res = await request(app)
                .patch(`/api/profiles/${profile.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send(updateData);
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Profile updated successfully");
            expect(res.body.profile).to.have.property("local", "fr");
            expect(res.body.profile).to.have.property("theme", "dark");
        });
        it("should return 404 if profile not found", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const updateData = {
                local: "fr",
                theme: "dark",
            };
            const fakeId = faker.string.uuid();
            const res = await request(app)
                .patch(`/api/profiles/${fakeId}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send(updateData);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message", "Profile not found");
        });
        it("should return 400 for invalid update data", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createSessionFixture();
            const profile = await createProfileFixture({ userId: user.id });
            const updateData = {
                local: "invalid_locale",
                theme: "dark",
            };
            const res = await request(app)
                .patch(`/api/profiles/${profile.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send(updateData);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const res = await request(app)
                .patch("/api/profiles/1")
                .send({ local: "fr" });
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Authentication required");
        });
    });
    describe("DELETE /profiles/:id", () => {
        it("should delete a profile", async () => {
            await preTestSetup();
            const { user, cookieValue } = await createAdminSessionFixture();
            const profile = await createProfileFixture({ userId: user.id });
            const res = await request(app)
                .delete(`/api/profiles/${profile.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("message", "Profile deleted successfully");
        });
        it("should return 404 if profile not found", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const fakeId = faker.string.uuid();
            const res = await request(app)
                .delete(`/api/profiles/${fakeId}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message", "Profile not found");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const res = await request(app)
                .delete("/api/profiles/1");
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Authentication required");
        });
        it("should return 403 if not admin", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const res = await request(app)
                .delete("/api/profiles/1")
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property("message", "Admin access required");
        });
   });

});