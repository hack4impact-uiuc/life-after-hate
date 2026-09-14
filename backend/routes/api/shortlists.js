const mongoose = require("mongoose");
const router = require("express").Router();
const Boom = require("@hapi/boom");
const { celebrate, Joi } = require("celebrate");
const Shortlist = require("../../models/Shortlist");
const Resource = require("../../models/Resource");
const errorWrap = require("../../utils/error-wrap");
const { requireVolunteerStatus } = require("../../utils/auth-middleware");
const presentResource = require("./resources").presentResource;
const nameSchema = celebrate({
  body: Joi.object({ name: Joi.string().trim().min(1).max(120).required() }),
});
router.use(requireVolunteerStatus);
router.param("id", (req, res, next, value) =>
  /^[a-f0-9]{24}$/i.test(value) ? next() : next(Boom.badRequest()),
);
router.param("resourceId", (req, res, next, value) =>
  /^[a-f0-9]{24}$/i.test(value) ? next() : next(Boom.badRequest()),
);
const result = (value) => ({ code: 200, success: true, result: value });
const summary = (list) => ({
  id: String(list._id),
  name: list.name,
  owner_id: list.owner_id,
  created_at: list.created_at,
});
async function find(req, edit = false) {
  const list = await Shortlist.findById(req.params.id).lean();
  if (!list) throw Boom.notFound();
  if (
    edit &&
    list.owner_id !== String(req.user._id) &&
    req.user.role !== "ADMIN"
  )
    throw Boom.forbidden();
  return list;
}
router.get(
  "/",
  errorWrap(async (req, res) => {
    const lists = await Shortlist.find().sort({ created_at: -1 }).lean();
    const rows = await Promise.all(
      lists.map(async (list) => ({
        ...summary(list),
        count: await Resource.countDocuments({
          _id: mongoose.trusted({ $in: list.resourceIds }),
        }),
      })),
    );
    res.json(result(rows));
  }),
);
router.post(
  "/",
  nameSchema,
  errorWrap(async (req, res) => {
    if (!req.user._id) throw Boom.unauthorized();
    const list = await Shortlist.create({
      name: req.body.name,
      owner_id: String(req.user._id),
    });
    res.status(201).json(result(summary(list)));
  }),
);
router.get(
  "/:id",
  errorWrap(async (req, res) => {
    const list = await find(req);
    const resources = await Resource.find({
      _id: mongoose.trusted({ $in: list.resourceIds }),
    }).lean();
    const byId = new Map(resources.map((r) => [String(r._id), r]));
    res.json(
      result({
        ...summary(list),
        resources: list.resourceIds
          .map((id) => byId.get(String(id)))
          .filter(Boolean)
          .map(presentResource),
      }),
    );
  }),
);
router.patch(
  "/:id",
  nameSchema,
  errorWrap(async (req, res) => {
    await find(req, true);
    await Shortlist.updateOne(
      { _id: req.params.id },
      { $set: { name: req.body.name } },
    );
    res.json(result(null));
  }),
);
router.delete(
  "/:id",
  errorWrap(async (req, res) => {
    await find(req, true);
    await Shortlist.deleteOne({ _id: req.params.id });
    res.json(result(null));
  }),
);
router.put(
  "/:id/resources/:resourceId",
  errorWrap(async (req, res) => {
    await find(req, true);
    if (!(await Resource.exists({ _id: req.params.resourceId })))
      throw Boom.notFound();
    await Shortlist.updateOne(
      { _id: req.params.id },
      { $addToSet: { resourceIds: req.params.resourceId } },
    );
    res.json(result(null));
  }),
);
router.delete(
  "/:id/resources/:resourceId",
  errorWrap(async (req, res) => {
    await find(req, true);
    await Shortlist.updateOne(
      { _id: req.params.id },
      { $pull: { resourceIds: req.params.resourceId } },
    );
    res.json(result(null));
  }),
);
module.exports = router;
