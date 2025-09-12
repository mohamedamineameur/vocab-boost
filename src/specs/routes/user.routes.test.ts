import app from "../../app.ts";
import request from "supertest";
import { expect } from "chai";
import { faker } from "@faker-js/faker";
import { createUserFixture} from "../fixtures/user.fixture.ts";
import { preTestSetup } from "../../config/pre-test.ts";
import { createSessionFixture, createAdminSessionFixture } from "../fixtures/session.fixture.ts";

describe("User Routes", () => {

    describe("POST /users", () => {
       

        it("should create a new user", async () => {
            await preTestSetup();
            const newUser = {
                email: faker.internet.email(),
                password: "Password123@",
                passwordConfirmation: "Password123@",
                firstname: faker.person.firstName(),
                lastname: faker.person.lastName(),
            };

            const res = await request(app).post("/api/users").send(newUser);
            expect(res.status).to.equal(201);
            expect(res.body.message.en).to.equal("User created successfully");
        });

        it("should not create a user with an existing email", async () => {
            await preTestSetup();
            const existingUser = await createUserFixture();

            const res = await request(app).post("/api/users").send({
                email: existingUser.email,
                password: "Password123@",
                passwordConfirmation: "Password123@",
                firstname: "Jane",
                lastname: "Doe",
            });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error.en).to.equal("User already exists");
        });
        it("should not create a user if password confirmation does not match", async () => {
            await preTestSetup();
            const res = await request(app).post("/api/users").send({
                email: faker.internet.email(),
                password: "Password123@",
                passwordConfirmation: "differentPassword123@",
                firstname: "Jane",
                lastname: "Doe",
            });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error.en).to.equal("Password confirmation does not match");
        });
        it("should return 400 for invalid request body", async () => {
            await preTestSetup();
            const res = await request(app).post("/api/users").send({
                email: "not-an-email",
                password: "short",
                passwordConfirmation: "short",
                firstname: "",
                lastname: "",
            });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.be.an("array");
            expect(res.body.error.length).to.be.greaterThan(0);
        });
    });

    describe("GET /users", () => {
        it("should retrieve all users", async () => {
            await preTestSetup();
            await createUserFixture();
            const { cookieValue } = await createAdminSessionFixture();

            const res = await request(app).get("/api/users")                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.greaterThan(0);
        });

        it("should return 403 if not an admin", async () => {
            await preTestSetup();
            const { cookieValue } = await createSessionFixture();

            const res = await request(app).get("/api/users")                .set("Cookie", [`session=${cookieValue}`]);

            expect(res.status).to.equal(403);
            expect(res.body.error).to.have.property("en", "Admin access required");
        });

        it("should return 401 if not authenticated", async () => {
            await preTestSetup();

            const res = await request(app).get("/api/users");
            expect(res.status).to.equal(401);
            expect(res.body.error).to.have.property("en", "Authentication required");
        });
    });

    describe("GET /users/:id", () => {
        it("should retrieve a user by ID", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();

            const res = await request(app).get(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("id", user.id);
        });

        it("should return 404 for non-existing user", async () => {
            await preTestSetup();
            const nonExistingId = faker.string.uuid();
            const { cookieValue } = await createAdminSessionFixture();
            const res = await request(app).get(`/api/users/${nonExistingId}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("error");
            expect(res.body.error.en).to.equal("User not found");
        });
        it("should return 400 for invalid user ID format", async () => {
            await preTestSetup();
            const invalidId = "invalid-uuid";
            const { cookieValue } = await createSessionFixture();
            const res = await request(app).get(`/api/users/${invalidId}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.be.an("array");
            expect(res.body.error.length).to.be.greaterThan(0);
        });
    });
    describe("DELETE /users/:id", () => {
        it("should delete a user by ID", async () => {
            await preTestSetup();
            const user = await createUserFixture();
            const { cookieValue } = await createAdminSessionFixture();

            const res = await request(app).delete(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(200);
            expect(res.body.message.en).to.equal("User deleted successfully");

            const getRes = await request(app).get(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(getRes.status).to.equal(404);
        });

        it("should return 403 if not an admin", async () => {
            await preTestSetup();
            const user = await createUserFixture();
            const { cookieValue } = await createSessionFixture();

            const res = await request(app).delete(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(403);
            expect(res.body.error).to.have.property("en", "Admin access required");
        });

        it("should return 404 when deleting a non-existing user", async () => {
            await preTestSetup();
            const nonExistingId = faker.string.uuid();
            const { cookieValue } = await createAdminSessionFixture();
            const res = await request(app).delete(`/api/users/${nonExistingId}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("error");
            expect(res.body.error.en).to.equal("User not found");
        });
    });

    describe("PATCH /users/:id", () => {
        it("should update a user's details", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();

            const res = await request(app).patch(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    email: "updated@example.com",
                    firstname: "Updated",
                    lastname: "User",
            });
            expect(res.status).to.equal(200);
            expect(res.body.message.en).to.equal("User updated successfully");

            const updatedRes = await request(app).get(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(updatedRes.status).to.equal(200);
            expect(updatedRes.body).to.have.property("email", "updated@example.com");
            expect(updatedRes.body).to.have.property("firstname", "Updated");
            expect(updatedRes.body).to.have.property("lastname", "User");
        });
        it("should allow admin users to update any user's details", async () => {
            await preTestSetup();
            const userToBeUpdated = await createUserFixture();
            const { cookieValue } = await createAdminSessionFixture();

            const res = await request(app).patch(`/api/users/${userToBeUpdated.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    email: "updated@example.com",
                    firstname: "Updated",
                    lastname: "User",
                });
            expect(res.status).to.equal(200);
            expect(res.body.message.en).to.equal("User updated successfully");

            const updatedRes = await request(app).get(`/api/users/${userToBeUpdated.id}`)
                .set("Cookie", [`session=${cookieValue}`]);
            expect(updatedRes.status).to.equal(200);
            expect(updatedRes.body).to.have.property("email", "updated@example.com");
            expect(updatedRes.body).to.have.property("firstname", "Updated");
            expect(updatedRes.body).to.have.property("lastname", "User");
        });
     
        it("should return 400 for invalid update data", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();
            const res = await request(app).patch(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    email: "not-an-email",
                });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.be.an("array");
            expect(res.body.error.length).to.be.greaterThan(0);
        });
        it("should return 400 if old password is incorrect when changing password", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();

            const res = await request(app).patch(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    password: "WrongOldPassword123@",
                    newPassword: "NewPassword123@",
                    passwordConfirmation: "NewPassword123@",
                });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error"); 
            expect(res.body.error.en).to.equal("Old password is incorrect");
        });

        it("should return 400 if new password confirmation does not match", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();

            const res = await request(app).patch(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    password: "Password123@",
                    newPassword: "NewPassword123@",
                    passwordConfirmation: "DifferentNewPassword123@",
                });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error.en).to.equal("New password confirmation does not match");
        });

        it("should change the user's password", async () => {
            await preTestSetup();
            const { cookieValue, user } = await createSessionFixture();

            const res = await request(app).patch(`/api/users/${user.id}`)
                .set("Cookie", [`session=${cookieValue}`])
                .send({
                    password: "Password123@",
                    newPassword: "NewPassword123@",
                    passwordConfirmation: "NewPassword123@",
                });
            expect(res.status).to.equal(200);
            expect(res.body.message.en).to.equal("User updated successfully");
        });
    });
});