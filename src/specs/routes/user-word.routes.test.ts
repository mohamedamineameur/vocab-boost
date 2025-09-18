import { createAdminSessionFixture, createSessionFixture } from "../fixtures/session.fixture.ts";
import {expect} from "chai";
import {preTestSetup} from "../../config/pre-test.ts";
import request from "supertest";
import app from "../../app.ts";
import { faker } from "@faker-js/faker";
import { createWordFixture } from "../fixtures/word.fixture.ts";
import { createUserWordFixture } from "../fixtures/user-word.fixture.ts";
import { createProfileFixture } from "../fixtures/profile.fixture.ts";

describe("UserWord Routes", () => {
    describe("POST /user-words", () => {
       it(
  "should create a new user-word association",
  async () => {
    await preTestSetup();
    const { cookieValue, user } = await createSessionFixture();
    await createProfileFixture({ userId: user.id });
    const word = await createWordFixture();

    const res = await request(app)
      .post(`/api/user-words/${user.id}/${word.id}`)
      .set("Cookie", [`session=${cookieValue}`]);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.have.property("en", "UserWord created successfully");
    expect(res.body).to.have.property("userWord");
    expect(res.body.userWord).to.include({
      userId: user.id,
      wordId: word.id,
      isLearned: false,
    });
  },
  15000 
);

        it("should not create a user-word for another user", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const word = await createWordFixture();
            const fakeId = faker.string.uuid();

            const res = await request(app)
                .post(`/api/user-words/${fakeId}/${word.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(403);
            expect(res.body.error).to.have.property("en", "Forbidden");
        });
    

        it("should not create a user-word association with invalid wordId", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const fakeId = faker.string.uuid();

            const res = await request(app)
                .post(`/api/user-words/${user.id}/${fakeId}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(400);
            expect(res.body.error).to.have.property("en", "Invalid wordId");
        });

        it("should not create a duplicate user-word association", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const word = await createWordFixture();

            await createUserWordFixture({ userId: user.id, wordId: word.id });

            // Second creation should fail
            const res2 = await request(app)
                .post(`/api/user-words/${user.id}/${word.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res2.status).to.equal(400);
            expect(res2.body.error).to.have.property("en", "This word is already associated with the user");
        });

        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const word = await createWordFixture();
            const fakeId = faker.string.uuid();

            const res = await request(app)
                .post(`/api/user-words/${fakeId}/${word.id}`);

            expect(res.status).to.equal(401);
            expect(res.body.error.en).to.equal("Authentication required");
        });
    });
    describe("GET /user-words", () => {
        it("should fetch all user-words for the authenticated user", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const userWord1 = await createUserWordFixture({ userId: user.id });
            const userWord2 = await createUserWordFixture({ userId: user.id });
            const nonRelatedUserWord = await createUserWordFixture(); // This one should not be fetched

            const res = await request(app)
                .get("/api/user-words")
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.equal(2);
            const userWordIds = res.body.map((uw: any) => uw.id);
            expect(userWordIds).to.include(userWord1.id);
            expect(userWordIds).to.include(userWord2.id);
            expect(userWordIds).to.not.include(nonRelatedUserWord.id);
        });

        it("should fetch all user-words for admin users", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const userWord1 = await createUserWordFixture();
            const userWord2 = await createUserWordFixture();

            const res = await request(app)
                .get("/api/user-words")
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.at.least(2);
            const userWordIds = res.body.map((uw: any) => uw.id);
            expect(userWordIds).to.include(userWord1.id);
            expect(userWordIds).to.include(userWord2.id);
        });

        it("should return 401 if not authenticated", async () => {
            await preTestSetup();

            const res = await request(app)
                .get("/api/user-words");

            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });
    });
    describe("GET /user-words/:id", () => {
        it("should fetch a specific user-word by ID for the authenticated user", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const userWord = await createUserWordFixture({ userId: user.id });
            const otherUserWord = await createUserWordFixture(); // This one should not be accessible

            const res = await request(app)
                .get(`/api/user-words/${userWord.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", userWord.id);
            expect(res.body).to.have.property("userId", user.id);
            expect(res.body).to.have.property("wordId", userWord.wordId);
        });

        it("should allow admin users to fetch any user-word by ID", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const userWord = await createUserWordFixture();

            const res = await request(app)
                .get(`/api/user-words/${userWord.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", userWord.id);
        });

        it("should return 404 if the user-word does not exist", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const fakeId = faker.string.uuid();

            const res = await request(app)
                .get(`/api/user-words/${fakeId}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(404);
            expect(res.body.error).to.have.property("en", "UserWord not found");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const userWord = await createUserWordFixture();
            const res = await request(app)
                .get(`/api/user-words/${userWord.id}`);

            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });
    
        it("should return 404 if its not the user's user-word", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const userWord = await createUserWordFixture();

            const res = await request(app)
                .get(`/api/user-words/${userWord.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(404);
            expect(res.body.error).to.have.property("en", "UserWord not found");
        });
    });


});