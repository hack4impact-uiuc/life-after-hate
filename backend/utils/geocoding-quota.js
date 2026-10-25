const Boom = require("@hapi/boom");
const GeocodingQuota = require("../models/GeocodingQuota");

async function consumeGeocodingQuota(userId) {
  if (!userId) throw Boom.unauthorized();
  const minute = Math.floor(Date.now() / 60000);
  const key = { _id: `${userId}:${minute}` };
  let quota;
  try {
    // The indexed account/window key and atomic increment are shared by every
    // server instance. Reserve the attempt before contacting the provider.
    quota = await GeocodingQuota.findOneAndUpdate(
      key,
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date((minute + 2) * 60000) },
      },
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    // A concurrent first insert can win the unique-key race. Increment its
    // counter rather than granting an uncounted attempt or resetting it.
    if (error.code !== 11000) throw error;
    quota = await GeocodingQuota.findOneAndUpdate(
      key,
      { $inc: { count: 1 } },
      { returnDocument: "after" },
    );
  }
  if (!quota) throw new Error("Geocoding quota unavailable");
  if (quota.count > 20) throw Boom.tooManyRequests();
}

module.exports = { consumeGeocodingQuota };
