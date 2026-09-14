const request = require("./request");
const { expect } = require("chai");
const app = require("../app.js");
const Resource = require("../models/Resource");
const { didCheckIsAdmin, didCheckIsVolunteer } = require("./auth_stubs");
const sinon = require("sinon");
const resourceUtils = require("../utils/resource-utils");
const { resourceEnum } = require("../models/Resource");

const sampleResourceInfo = {
  companyName: "Google",
  contactName: "Alice",
  contactPhone: "123456789",
  contactEmail: "123@gmail.com",
  description: "Let me dream",
  address: {
    streetAddress: "10 Silicon Way",
    city: "Silicon Valley",
    state: "IL",
    postalCode: 61820,
  },
  location: {
    coordinates: [35, 40],
  },
  tags: ["tech"],
  type: resourceEnum.GROUP,
};

const sampleResourceInfo2 = {
  companyName: "Facebook",
  contactName: "Bob",
  contactPhone: "123456789",
  contactEmail: "123@gmail.com",
  description: "Let me dream",
  address: {
    streetAddress: "10 Silicon Way",
    city: "Silicon Valley",
    state: "IL",
    postalCode: 61820,
  },
  location: {
    coordinates: [40, 40],
  },
  tags: ["social"],
  type: resourceEnum.GROUP,
};

const sampleResourceInfo3 = {
  companyName: "Facebook",
  contactName: "Evan",
  contactPhone: "123456789",
  contactEmail: "123@gmail.com",
  description: "Let me dream",
  address: "Silicon Valley",
  location: {
    coordinates: [40, 40],
  },
  tags: ["social"],
  type: resourceEnum.GROUP,
};

const createSampleResource = async (resourceInfo = sampleResourceInfo) => {
  const newResource = new (require("../models/GroupResource"))(resourceInfo);
  await newResource.save();
};

const createSampleResource2 = async (resourceInfo = sampleResourceInfo2) => {
  const newResource = new (require("../models/GroupResource"))(resourceInfo);
  await newResource.save();
};

beforeEach(createSampleResource);
afterEach(() => Resource.deleteMany({}));

describe("GET /resources", () => {
  beforeEach(() => Resource.deleteMany({}));
  it("should get no Resources", async () => {
    const res = await request(app).get(`/api/resources`).expect(200);
    expect(res.body.result).to.be.an("array").that.is.empty;
    expect(didCheckIsVolunteer()).to.be.true;
  });

  it("should get one Resource and verify properties", async () => {
    await createSampleResource();
    const res = await request(app).get(`/api/resources`).expect(200);
    expect(res.body.result).to.have.lengthOf(1);
    expect(res.body.result[0]).to.include({
      contactName: "Alice",
      companyName: "Google",
      type: "GROUP",
    });
    expect(didCheckIsVolunteer()).to.be.true;
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
    expect(didCheckIsVolunteer()).to.be.true;
  });
});

describe("GET /resources/filter", () => {
  it("should sort existing Resources by closest lat/long", async () => {
    await createSampleResource2();
    const radius = 12500;
    const address = "Chicago, IL";
    const stub = sinon
      .stub(resourceUtils, "geocodeAddress")
      .callsFake(() => ({ lat: 30, lng: 20, region: 2 }));

    const res = await request(app)
      .get(`/api/resources/filter?radius=${radius}&address=${address}`)
      .expect(200);
    expect(res.body.result.resources).to.have.lengthOf(2);
    expect(res.body.result.resources[0].companyName).equals("Google");
    expect(res.body.result.resources[1].companyName).equals("Facebook");
    expect(didCheckIsVolunteer()).to.be.true;
    stub.restore();
  });
  it("should fuzzy search on tags", async () => {
    await createSampleResource2();
    const query = "social";
    const stub = sinon
      .stub(resourceUtils, "geocodeAddress")
      .callsFake(() => ({ lat: 30, lng: 20, region: 2 }));

    const res = await request(app)
      .get(`/api/resources/filter?keyword=${query}`)
      .expect(200);
    expect(res.body.result.resources).to.have.lengthOf(1);
    expect(res.body.result.resources[0].companyName).equals("Facebook");
    expect(didCheckIsVolunteer()).to.be.true;
    stub.restore();
  });
});

describe("POST /resources", () => {
  it("should create a new Resource", async () => {
    const stub = sinon.stub(resourceUtils, "geocodeAddress").callsFake(() => ({
      lat: 30,
      lng: 20,
      region: 2,
      streetAddress: "10 Silicon Way",
      city: "Silicon Valley",
      state: "IL",
      postalCode: 61820,
    }));

    await request(app)
      .post(`/api/resources/`)
      .send(
        Object.fromEntries(
          Object.entries(sampleResourceInfo3).filter(
            ([key]) => key !== "location",
          ),
        ),
      )
      .expect(201);
    const resource = await Resource.findOne({ companyName: "Facebook" });
    expect(resource.contactName).equals("Evan");
    expect(didCheckIsAdmin()).to.be.true;
    stub.restore();
  });
});

describe("PUT /resources", () => {
  it("should edit an existing Resource", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    const resourceId = resource._id;
    const newData = {
      companyName: "new name",
      contactName: "new contact",
      description: "new description",
      type: "GROUP",
    };

    const stub = sinon.stub(resourceUtils, "geocodeAddress").callsFake(() => ({
      lat: 30,
      lng: 20,
      region: 2,
      streetAddress: "10 Silicon Way",
      city: "Silicon Valley",
      state: "IL",
      postalCode: 61820,
    }));

    await request(app)
      .put(`/api/resources/${resourceId}`)
      .send(newData)
      .expect(200);
    const newResource = await Resource.findById(resourceId);
    expect(newResource.description).to.eq("new description");
    expect(newResource.address.city).to.eq("Silicon Valley");
    expect(newResource.location.coordinates).to.deep.eq([35, 40]);
    expect(stub.called).to.eq(false);
    expect(didCheckIsAdmin()).to.be.true;
    stub.restore();
  });
});

describe("DELETE /resource", () => {
  it("should delete an existing Resource", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    const resourceId = resource._id;
    await request(app).delete(`/api/resources/${resourceId}`).expect(200);
    const resources = await Resource.find();
    expect(resources).to.be.an("array").that.is.empty;
    expect(didCheckIsAdmin()).to.be.true;
  });
});

describe("resource validation boundaries", () => {
  it("returns 404 for a missing resource", async () => {
    await request(app)
      .get("/api/resources/507f1f77bcf86cd799439011")
      .expect(404);
  });
  it("rejects resource type changes", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    await request(app)
      .put(`/api/resources/${resource._id}`)
      .send({ type: "INDIVIDUAL" })
      .expect(400);
    expect((await Resource.findById(resource._id)).type).to.eq("GROUP");
  });
  it("rejects unsafe website schemes and forged coordinates", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    for (const data of [
      { websiteURL: "javascript:alert(1)" },
      { location: { coordinates: [0, 0] } },
    ]) {
      await request(app)
        .put(`/api/resources/${resource._id}`)
        .send(data)
        .expect(400);
    }
  });
  it("rejects oversized searches", async () => {
    await request(app)
      .get("/api/resources/filter")
      .query({ keyword: "x".repeat(201) })
      .expect(400);
  });
});

describe("legacy resource safety", () => {
  it("does not return executable website URLs from old records", async () => {
    const resource = await Resource.findOne({ companyName: "Google" });
    await Resource.updateOne(
      { _id: resource._id },
      { websiteURL: "javascript:alert(1)" },
    );
    const response = await request(app)
      .get(`/api/resources/${resource._id}`)
      .expect(200);
    expect(response.body.result.websiteURL).to.eq("");
  });
});
