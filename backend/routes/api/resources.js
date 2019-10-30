const express = require("express");
const router = express.Router();
const Resource = require("../../models/Resource");
const { celebrate, Joi } = require("celebrate");

// get all resources
router.get("/", async (req, res) => {
  const resources = await Resource.find({});
  res.json({
    code: 200,
    result: resources,
    success: true
  });
});

// get one resource
router.get("/:resource_id", async (req, res) => {
  const resourceId = req.params.resource_id;
  const resource = await Resource.findById(resourceId);
  res.json({
    code: 200,
    result: resource,
    success: true
  });
});

// get list of resources filtered by location radius
router.get("/filter", async (req, res) => {
  const radius = req.query.radius;
  const lat = parseInt(req.query.lat);
  const long = parseInt(req.query.long);
  const resource = await Resource.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius / 3963.2] } }
  });
  res.json({
    code: 200,
    result: resource,
    success: true
  });
});

// create new resource
router.post(
  "/",
  celebrate({
    body: Joi.object().keys({
      companyName: Joi.string().required(),
      contactName: Joi.string().required(),
      contactPhone: Joi.string().required(),
      contactEmail: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      location: Joi.object({
        type: Joi.string().default("Point"),
        coordinates: Joi.array()
          .length(2)
          .items(Joi.number())
      }).required(),
      notes: Joi.string(),
      tags: Joi.array()
        .items(Joi.string())
        .required()
    })
  }),
  async (req, res) => {
    const data = req.body;
    const newResource = new Resource({
      companyName: data.companyName,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      description: data.description,
      address: data.address,
      location: data.location,
      notes: data.notes,
      tags: data.tags
    });
    await newResource.save();
    res.json({
      code: 200,
      message: "Resource Successfully Created",
      success: true
    });
  }
);

// edit resource
router.put(
  "/:resource_id",
  celebrate({
    body: Joi.object().keys({
      companyName: Joi.string(),
      contactName: Joi.string(),
      contactPhone: Joi.string(),
      contactEmail: Joi.string(),
      description: Joi.string(),
      address: Joi.string(),
      location: Joi.object({
        type: Joi.string().default("Point"),
        coordinates: Joi.array()
          .length(2)
          .items(Joi.number())
      }),
      notes: Joi.string(),
      tags: Joi.array().items(Joi.string())
    })
  }),
  async (req, res) => {
    const data = req.body;
    const resourceId = req.params.resource_id;

    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { $set: data },
      { new: true }
    );

    const ret = resource
      ? {
          code: 200,
          message: "Resource Updated Successfully",
          success: true
        }
      : {
          code: 404,
          message: "Resource Not Found",
          success: false
        };
    res.status(ret.code).json(ret);
  }
);

// delete resource
router.delete("/:resource_id", async (req, res) => {
  const resourceId = req.params.resource_id;
  const resource = await Resource.findByIdAndRemove(resourceId);
  const ret = resource
    ? {
        code: 200,
        message: "Resource deleted successfully",
        success: true
      }
    : {
        code: 404,
        message: "Resource not found",
        success: false
      };
  res.status(ret.code).json(ret);
});

module.exports = router;
