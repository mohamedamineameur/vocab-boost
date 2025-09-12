import { createSessionFixture, createAdminSessionFixture } from "../fixtures/session.fixture.ts";
import {expect} from "chai";
import {preTestSetup} from "../../config/pre-test.ts";
import request from "supertest";
import app from "../../app.ts";
import { faker } from "@faker-js/faker";
import { createUserWordFixture } from "../fixtures/user-word.fixture.ts";
import { createQuizFixture } from "../fixtures/quiz.fizture.ts";

describe("Quiz Routes", () => {
    describe("GET /quizzes", () => {
        it("should return all quizzes for the authenticated user", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const userWord = await createUserWordFixture({ userId: user.id });
            await createQuizFixture({ userWordId: userWord.id });
            const res = await request(app)
                .get("/api/quizzes")
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("quizzes").that.is.an("array");
            expect(res.body.quizzes.length).to.be.greaterThan(0);
        });

        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const res = await request(app)
                .get("/api/quizzes");
            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });
    });

    describe("PATCH /quizzes/:id", () => {
        it("should update a quiz by ID", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const userWord = await createUserWordFixture({ userId: user.id });
            const quiz = await createQuizFixture({ userWordId: userWord.id });

            const res = await request(app)
                .patch(`/api/quizzes/${quiz.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send({ areUserAnswersCorrect: true });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.have.property("fr", "Quiz mis à jour avec succès");
            expect(res.body).to.have.property("quiz");
            expect(res.body.quiz).to.have.property("id", quiz.id);
            expect(res.body.quiz.correctAnswer).to.include(quiz.correctAnswer);
        });
    });
});
