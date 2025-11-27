const mongoose = require('mongoose');

const FacilityGroupSchema = new mongoose.Schema({
  title: { type: String, required: true },
  iconName: { type: String },
  items: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('FacilityGroup', FacilityGroupSchema);
