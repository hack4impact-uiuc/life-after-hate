const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Shortlist",
  new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    owner_id: { type: String, required: true },
    created_at: { type: String, default: () => new Date().toISOString() },
    resourceIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "BaseResource" },
    ],
  }),
);
