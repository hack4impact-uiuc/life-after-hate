const request = require("supertest");
const { expect } = require("chai");
const app = require("../app.js");
const User = require("../models/User");
const mongoose = require("mongoose");
const { didCheckIsAdmin } = require("./auth_stubs");

const sampleUserInfo = {
  firstName: "alan",
  lastName: "fang",
  email: "analfang@illinois.edu",
  role: "ADMIN",
  location: "SOUTH",
  oauthId: "1234567"
};

const incompleteUserInfo = {
  email: "joshb@illinois.edu",
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
    expect(didCheckIsAdmin()).to.be.true;
  });
});

describe("GET /user/:user_id", () => {
  it("should get a single user", async () => {
    await createSampleUser();
    const foundUser = await User.findOne({
      firstName: sampleUserInfo.firstName
    });
    const id = foundUser._id;

    const res = await request(app)
      .get(`/api/users/${id}`)
      .expect(200);

    expect(res.body.result.firstName).to.eq("alan");
    expect(didCheckIsAdmin()).to.be.true;
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
    expect(didCheckIsAdmin()).to.be.true;
  });
});

describe("POST /users/", () => {
  it("should fail to create user with incomplete fields", async () => {
    await request(app)
      .post(`/api/users/`)
      .send(incompleteUserInfo)
      .expect(400);
    expect(didCheckIsAdmin()).to.be.true;
  });
});

describe("PUT /user/:user_id/role", () => {
  it("should update user to have new role", async () => {
    await createSampleUser();

    const reqBody = {
      role: "VOLUNTEER"
    };

    const foundUser = await User.findOne({
      firstName: sampleUserInfo.firstName
    });

    const id = foundUser._id;
    await request(app)
      .put(`/api/users/${id}/role`)
      .send(reqBody)
      .expect(200);

    const afterUpdate = await User.findOne({
      firstName: sampleUserInfo.firstName
    });
    expect(afterUpdate.role).to.eq("VOLUNTEER");
    expect(didCheckIsAdmin()).to.be.true;
  });
});

describe("PUT /user/:user_id/role", () => {
  it("should fail to update role of nonexistent user", async () => {
    const reqBody = {
      role: "VOLUNTEER"
    };

    const id = mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/users/${id}/role`)
      .send(reqBody)
      .expect(404);

    expect(res.body.message).to.eq("User Not Found");
    expect(didCheckIsAdmin()).to.be.true;
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
    expect(didCheckIsAdmin()).to.be.true;
  });
});

describe("PUT /user/:user_id/approve", () => {
  it("should fail to approve nonexistent user", async () => {
    const reqBody = {
      isApproved: true
    };

    const id = mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/users/${id}/approve`)
      .send(reqBody)
      .expect(404);

    expect(res.body.message).to.eq("User Not Found");
    expect(didCheckIsAdmin()).to.be.true;
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
    expect(didCheckIsAdmin()).to.be.true;
  });
});

describe("DELETE /user/:user_id", () => {
  it("should fail to delete user that doesn't exist", async () => {
    const id = mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/users/${id}`)
      .expect(404);

    expect(res.body.message).to.eq("User not found");
    expect(didCheckIsAdmin()).to.be.true;
  });
});
