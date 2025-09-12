import { createAdminSessionFixture, createSessionFixture } from "../fixtures/session.fixture.ts";
import {expect} from "chai";
import {preTestSetup} from "../../config/pre-test.ts";
import request from "supertest";
import app from "../../app.ts";
import { createCategoryFixture } from "../fixtures/category.fixture.ts";
import { faker } from "@faker-js/faker";

describe("Category Routes", () => {
    describe("POST /categories", () => {
        it("should create a new category", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const categoryData = {
                name: "Electronics",
                description: "Devices and gadgets",
            };
            const res = await request(app)
                .post("/api/categories")
                .set("Cookie", [`session=${cookieValue}`])
                .send(categoryData);
            expect(res.status).to.equal(201);
            expect(res.body.message.en).to.equal("Category created successfully");
        });

        it("should not create a category with missing name", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const categoryData = {
                description: "Devices and gadgets",
            };
            const res = await request(app)
                .post("/api/categories")
                .set("Cookie", [`session=${cookieValue}`])
                .send(categoryData);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
        });

        it("should not create a category with an existing name", async () => {
            await preTestSetup();
            const { cookieValue } = await createAdminSessionFixture();
            const existingCategory = await createCategoryFixture({ name: "Books" });

            const res = await request(app)
                .post("/api/categories")
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    name: existingCategory.name,
                    description: "All kinds of books",
                });
            expect(res.status).to.equal(400);
            expect(res.body.error).to.have.property("en", "Category with this name already exists");
        });
        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const categoryData = {
                name: "Toys",
                description: "Children's toys",
            };
            const res = await request(app)
                .post("/api/categories")
                .send(categoryData);
            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });
        it("should return 403 if not admin", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const categoryData = {
                name: "Toys",
                description: "Children's toys",
            };
            const res = await request(app)
                .post("/api/categories")
                .set("Cookie", [`session=${cookieValue}`])
                .send(categoryData);
            expect(res.status).to.equal(403);
            expect(res.body.error).to.have.property("en", "Admin access required");
        });
    })
    describe("GET /categories", () => {
        it("should fetch all categories", async () => {
            await preTestSetup();
            await createCategoryFixture();
            const { cookieValue } = await createSessionFixture();

            const res = await request(app).get("/api/categories")
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.greaterThan(0);
        });
    });

    describe("GET /categories/:id", () => {
        it("should retrieve a category by ID", async () => {
            await preTestSetup();
            const category = await createCategoryFixture();
            const { cookieValue } = await createSessionFixture();

            const res = await request(app).get(`/api/categories/${category.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", category.id);
            expect(res.body).to.have.property("name", category.name);
        });

        it("should return 401 if not authenticated", async () => {
            await preTestSetup();
            const category = await createCategoryFixture();

            const res = await request(app).get(`/api/categories/${category.id}`);
            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });

        it("should return 200 for existing category", async () => {
            await preTestSetup();
            const category = await createCategoryFixture();
            const { cookieValue } = await createSessionFixture();

            const res = await request(app).get(`/api/categories/${category.id}`)
                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", category.id);
        });

        it("should return 404 for non-existing category", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();
            const fakeId = faker.string.uuid();

            const res = await request(app).get(`/api/categories/${fakeId}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(404);
            expect(res.body.error).to.have.property("en", "Category not found");
        });
    });
});