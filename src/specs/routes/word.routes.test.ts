import { createAdminSessionFixture, createSessionFixture } from "../fixtures/session.fixture.ts";
import {expect} from "chai";
import {preTestSetup} from "../../config/pre-test.ts";
import request from "supertest";
import app from "../../app.ts";
import { createCategoryFixture } from "../fixtures/category.fixture.ts";
import { createWordFixture } from "../fixtures/word.fixture.ts";
import { faker } from "@faker-js/faker";

describe("Word Routes", () => {
    describe("POST /words", () => {
        it("should create a new word", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const category = await createCategoryFixture({ name: "TestCategory" });
            const wordData = {
                text: "example",
                categoryId: category.id,
                pronunciation: "ig-ZAM-pul",
                frTranslation: "exemple",
                esTranslation: "ejemplo",
                arTranslation: "مثال",
                meaning: "A representative form or pattern",
                example: "This is an example sentence.",
                synonyms: ["sample", "instance"],
                antonyms: ["counterexample"],
                lexicalField: ["linguistics"],
                level: "beginnerLevelOne"
            };
            const res = await request(app)
                .post("/api/words")
                .set("Cookie", [`session=${cookieValue}`])
                .send(wordData);
            expect(res.status).to.equal(201);
            expect(res.body.message.en).to.equal("Word created successfully");
        }
        )
        it("should not create a word with missing required fields", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const res = await request(app)
                .post("/api/words")
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    text: "incompleteWord"
                });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const res = await request(app)
                .post("/api/words")
                .send({
                    text: "example",
                    categoryId: "some-category-id",
                    pronunciation: "ig-ZAM-pul",
                    frTranslation: "exemple",
                    esTranslation: "ejemplo",
                    arTranslation: "مثال",
                    meaning: "A representative form or pattern",
                    example: "This is an example sentence.",
                    synonyms: ["sample", "instance"],
                    antonyms: ["counterexample"],
                    lexicalField: ["linguistics"],
                    level: "beginnerLevelOne"
                });
            expect(res.status).to.equal(401);
        });
        it("should return 403 if not admin", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const res = await request(app)
                .post("/api/words")
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    text: "example",
                    categoryId: "some-category-id",
                    pronunciation: "ig-ZAM-pul",
                    frTranslation: "exemple",
                    esTranslation: "ejemplo",
                    arTranslation: "مثال",
                    meaning: "A representative form or pattern",
                    example: "This is an example sentence.",
                    synonyms: ["sample", "instance"],
                    antonyms: ["counterexample"],
                    lexicalField: ["linguistics"],
                    level: "beginnerLevelOne"
                });
            expect(res.status).to.equal(403);
            expect(res.body.error).to.have.property("en", "Admin access required");
        });
    });
    describe("GET /words", () => {
        it("should retrieve all words", async () => {
            await preTestSetup();
            await createWordFixture();
            const { cookieValue } = await createSessionFixture();

            const res = await request(app).get("/api/words")
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.greaterThan(0);
        });

        it("should return 401 if not authenticated", async () => {
            await preTestSetup();

            const res = await request(app).get("/api/words");
            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });
    });

    describe("GET /words/:id", () => {
        it("should retrieve a word by ID", async () => {
            await preTestSetup();
            const word = await createWordFixture();
            const { cookieValue } = await createSessionFixture();

            const res = await request(app).get(`/api/words/${word.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", word.id);
            expect(res.body).to.have.property("text", word.text);
        });

        it("should return 404 for non-existing word", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const fakeId = faker.string.uuid();
            const res = await request(app).get(`/api/words/${fakeId}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(404);
            expect(res.body.error).to.have.property("en", "Word not found");
        });

        it("should return 401 if not authenticated", async () => {
            await preTestSetup();

            const res = await request(app).get("/api/words/00000000-0000-0000-0000-000000000000");
            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });
    });
});