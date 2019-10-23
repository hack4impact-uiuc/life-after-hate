var router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

// Corresopnds to a GET request to /api/sample/
router.get(
  "/",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      age: Joi.number().integer(),
      role: Joi.string().default("admin")
    })
  }),
  function(req, res) {
    console.log("HI");
    res.send("Hello world!");
  }
);

router.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      age: Joi.number().integer(),
      role: Joi.string().default("admin")
    })
  }),
  (req, res) => {
    res.send("HI");
    console.log(req.body);
    // At this point, req.body has been validated and
    // req.body.role is equal to req.body.role if provided in the POST or set to 'admin' by joi
  }
);

module.exports = router;
