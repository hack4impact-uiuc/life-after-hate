const request = require("supertest");
const { expect } = require("chai");
const stubs = require("./auth_stubs").stubAllAuth();
const app = require("../app.js");
const User = require("../models/User");

beforeEach(() => User.remove({}));

const sampleUserInfo = {
  firstName: "alan",
  lastName: "fang",
  email: "analfang@illinois.edu",
  role: "ADMIN",
  location: "SOUTH",
  oauthId: "1234567"
};

const createSampleUser = async (userInfo = sampleUserInfo) => {
  const newUser = new User(userInfo);
  await newUser.save();
};

describe("GET /user/", () => {
  it("should get all users", async () => {
    await createSampleUser();
    const res = await request(app)
      .get(`/api/users/`)
      .expect(200);
    expect(res.body.result[0].firstName).to.eq("alan");
  });
});

describe("POST /users/", () => {
  it("should create a new user", async () => {
    await request(app)
      .post(`/api/users/`)
      .send(sampleUserInfo)
      .expect(200);
    const foundUser = await User.findOne({
      firstName: sampleUserInfo.firstName
    });
    expect(foundUser.oauthId).to.eq(sampleUserInfo.oauthId);
  });
});

describe("PUT /user/:user_id/role", () => {
  it("should update user to have new role", async () => {
    console.log(stubs);
    await createSampleUser();

    const reqBody = {
      role: "VOLUNTEER"
    };

    const foundUser = await User.findOne({
      firstName: sampleUserInfo.firstName
    });

    console.log(foundUser._id);
    const id = foundUser._id;
    await request(app)
      .put(`/api/users/${id}/role`)
      .send(reqBody)
      .expect(200);

    const afterUpdate = await User.findOne({
      firstName: sampleUserInfo.firstName
    });
    expect(afterUpdate.role).to.eq("VOLUNTEER");
  });
});

describe("PUT /user/:user_id/approve", () => {
  it("should approve the user", async () => {
    const reqBody = {
      isApproved: true
    };

    await createSampleUser();

    const foundUser = await User.findOne({
      firstName: sampleUserInfo.firstName
    });
    const id = foundUser._id;

    await request(app)
      .put(`/api/users/${id}/approve`)
      .send(reqBody)
      .expect(200);

    const afterUpdate = await User.findOne({
      firstName: sampleUserInfo.firstName
    });
    expect(afterUpdate.isApproved).to.eq(true);
  });
});

describe("DELETE /user/:user_id", () => {
  it("should delete specified user", async () => {
    await createSampleUser();

    const foundUser = await User.findOne({
      firstName: sampleUserInfo.firstName
    });
    const id = foundUser._id;

    const res = await request(app)
      .delete(`/api/users/${id}`)
      .expect(200);

    expect(res.body.message).to.eq("User deleted successfully");
  });
});
