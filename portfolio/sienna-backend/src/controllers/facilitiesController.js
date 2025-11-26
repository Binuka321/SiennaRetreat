const FacilityGroup = require('../models/FacilityGroup');

exports.getAll = async (req, res) => {
  try {
    const groups = await FacilityGroup.find().sort({ order: 1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, iconName, items, order } = req.body;
    const group = new FacilityGroup({ title, iconName, items, order });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
