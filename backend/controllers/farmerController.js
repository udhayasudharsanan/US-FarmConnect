const Farmer = require('../models/Farmer'); // Assuming you have a Farmer model

// Example function to get farmer details
const getFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ msg: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

module.exports = {
  getFarmer,
};
