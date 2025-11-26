const UserProfile = require('../models/UserProfile');

exports.getByEmail = async (req, res) => {
  try {
    const user = await UserProfile.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.createOrUpdate = async (req, res) => {
  try {
    const { name, email, phone, address, photoURL } = req.body;
    const user = await UserProfile.findOneAndUpdate(
      { email },
      { name, phone, address, photoURL },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
