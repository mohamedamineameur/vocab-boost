import {createSessionFixture} from "../fixtures/session.fixture.ts";
import {expect} from "chai";
import {preTestSetup} from "../../config/pre-test.ts";
import {createUserFixture} from "../fixtures/user.fixture.ts";
import request from "supertest";
import app from "../../app.ts";

describe("Session Routes", () => {
    describe("POST /sessions", () => {
        it("should create a new session and set a cookie", async () => {
            await preTestSetup();
            const user = await createUserFixture();

            const res = await request(app).post("/api/sessions").send({
                email: user.email,
                password: "Password123@",
            });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("message", "Session created successfully");
            expect(res.headers).to.have.property("set-cookie");
        });
    });
    describe("DELETE /sessions", () => {
        it("should destroy the session and clear the cookie", async () => {
            await preTestSetup();
            const {cookieValue} = await createSessionFixture();

            const res = await request(app)
                .delete("/api/sessions")
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("message", "Session destroyed successfully");
        });

        it("should return 401 if session cookie is missing", async () => {
            await preTestSetup();

            const res = await request(app)
                .delete("/api/sessions");

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Session cookie missing");
        });

        it("should return 401 if session token is invalid", async () => {
            await preTestSetup();

            const res = await request(app)
                .delete("/api/sessions")
                .set("Cookie", "session=invalidtoken");

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Invalid session cookie format");
        });
    });

    describe("getMe", () => {
        it("should return the authenticated user's details", async () => {
            await preTestSetup();
            const {user, cookieValue} = await createSessionFixture();
            const res = await request(app)
                .get("/api/sessions/me")
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", user.id);
            expect(res.body).to.have.property("email", user.email);
            expect(res.body).to.not.have.property("password");
        });

        it("should return 401 if session cookie is missing", async () => {
            await preTestSetup();

            const res = await request(app)
                .get("/api/sessions/me");

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Session cookie missing");
        });

        it("should return 401 if session token is invalid", async () => {
            await preTestSetup();

            const res = await request(app)
                .get("/api/sessions/me")
                .set("Cookie", "session=invalidtoken");

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("message", "Invalid session cookie format");
        });
    });
});