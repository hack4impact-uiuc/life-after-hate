const request = require("supertest");
const { expect } = require("chai");
const app = require("../app.js");
const Resource = require("../models/Resource");
require("./auth_stubs").stubAllAuth();

const sampleResourceInfo = {
  companyName: "Google",
  contactName: "Alice",
  contactPhone: "123456789",
  contactEmail: "123@gmail.com",
  description: "Let me dream",
  address: "Silicon Valley",
  location: {
    coordinates: [35, 40]
  },
  tags: ["tech"]
};

const sampleResourceInfo2 = {
  companyName: "Facebook",
  contactName: "Bob",
  contactPhone: "123456789",
  contactEmail: "123@gmail.com",
  description: "Let me dream",
  address: "Silicon Valley",
  location: {
    coordinates: [40, 40]
  },
  tags: ["social"]
};

const createSampleResource = async (resourceInfo = sampleResourceInfo) => {
  const newResource = new Resource(resourceInfo);
  await newResource.save();
};

const createSampleResource2 = async (resourceInfo = sampleResourceInfo2) => {
  const newResource = new Resource(resourceInfo);
  await newResource.save();
};

beforeEach(() => createSampleResource());
afterEach(() => Resource.remove({}));

describe("GET /resources", () => {
  beforeEach(() => Resource.remove());
  it("should get no Resources", async () => {
    const res = await request(app)
      .get(`/api/resources`)
      .expect(200);
    expect(res.body.result).to.be.an("array").that.is.empty;
  });

  it("should get one Resource and verify properties", async () => {
    await createSampleResource();
    const res = await request(app)
      .get(`/api/resources`)
      .expect(200);
    expect(res.body.result).to.have.lengthOf(1);
    expect(Object.keys(res.body.result[0])).to.have.lengthOf(10);
  });
});

describe("GET /resources/:resource_id", () => {
  it("should get a Resource by id", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    const resourceId = resource._id;
    const res = await request(app)
      .get(`/api/resources/${resourceId}`)
      .expect(200);
    expect(res.body.result.contactName).equals("Alice");
  });
});

describe("GET /resources/filter", () => {
  it("should sort existing Resources by closest lat/long", async () => {
    await createSampleResource2();
    const radius = 100000;
    const lat = 36;
    const long = 40;
    const res = await request(app)
      .get(`/api/resources/filter?radius=${radius}&lat=${lat}&long=${long}`)
      .expect(200);
    expect(res.body.result).to.have.lengthOf(2);
    expect(res.body.result[0].companyName).equals("Google");
    expect(res.body.result[1].companyName).equals("Facebook");
  });
  it("should fuzzy search on tags", async () => {
    await createSampleResource2();
    const query = "social";
    const res = await request(app)
      .get(`/api/resources/filter?keyword=${query}`)
      .expect(200);
    expect(res.body.result).to.have.lengthOf(2);
    expect(res.body.result[0].companyName).equals("Facebook");
    expect(res.body.result[1].companyName).equals("Google");
  });
});

describe("POST /resources", () => {
  it("should create a new Resource", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    expect(resource.contactName).equals("Alice");
  });
});

describe("PUT /resources", () => {
  it("should edit an existing Resource", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    const resourceId = resource._id;
    const newData = {
      companyName: "new name",
      contactName: "new contact",
      description: "new description"
    };
    await request(app)
      .put(`/api/resources/${resourceId}`)
      .send(newData)
      .expect(200);

    const newResource = await Resource.findById(resourceId);
    expect(newResource.description).to.eq("new description");
  });
});

describe("DELETE /resource", () => {
  it("should delete an existing Resource", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    const resourceId = resource._id;
    await request(app)
      .delete(`/api/resources/${resourceId}`)
      .expect(200);
    const resources = await Resource.find();
    expect(resources).to.be.an("array").that.is.empty;
  });
});
