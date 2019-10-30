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

// get list of resources filtered by location radius
router.get("/", async (req, res) => {
  const tags = req.query.query;
  const resource = await Resource.find({
    tags
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
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      oauthId: Joi.string().required(),
      propicUrl: Joi.string().required(),
      isApproved: Joi.boolean().default(false),
      role: Joi.string().required(),
      location: Joi.string().required()
    })
  }),
  async (req, res) => {
    const data = req.body;
    const newResource = new Resource({
      firstName: data.firstName,
      lastName: data.lastName,
      oauthId: data.oauthId,
      propicUrl: data.propicUrl,
      role: data.role,
      location: data.location
    });
    await newResource.save();
    res.json({
      code: 200,
      message: "Resource Successfully Created",
      success: true
    });
  }
);

// set role
router.put(
  "/:resource_id/role",
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      oauthId: Joi.string(),
      propicUrl: Joi.string(),
      isApproved: Joi.boolean(),
      role: Joi.string().required(),
      location: Joi.string()
    })
  }),
  async (req, res) => {
    const data = req.body;
    const resourceId = req.params.resource_id;

    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { $set: { role: data.role } },
      { new: true }
    );
    const ret = resource
      ? {
          code: 200,
          message: "Resource Role Updated Successfully",
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

// approve resource
router.put(
  "/:resource_id/approve",
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      oauthId: Joi.string(),
      propicUrl: Joi.string(),
      isApproved: Joi.boolean(),
      role: Joi.string(),
      location: Joi.string()
    })
  }),
  async (req, res) => {
    const resourceId = req.params.resource_id;

    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { $set: { isApproved: true } },
      { new: true }
    );
    const ret = resource
      ? {
          code: 200,
          message: "Resource Approved Successfully",
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
