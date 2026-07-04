const hostelModel = require('../models/hostelModel');

const createHostel = async (req, res) => {
  try {
    const hostelData = req.body;
    const newHostel = await hostelModel.createHostel(hostelData);
    res.status(201).json({
      success: true,
      message: 'Hostel created successfully',
      data: newHostel
    });
  } catch (error) {
    console.error('Error creating hostel:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating hostel',
      error: error.message
    });
  }
};

const getAllHostels = async (req, res) => {
  try {
    const hostels = await hostelModel.getAllHostels();
    res.json({
      success: true,
      count: hostels.length,
      data: hostels
    });
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hostels',
      error: error.message
    });
  }
};

const getHostelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hostel = await hostelModel.getHostelById(id);
    
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }
    
    res.json({
      success: true,
      data: hostel
    });
  } catch (error) {
    console.error('Error fetching hostel:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hostel',
      error: error.message
    });
  }
};

const updateHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const hostelData = req.body;
    const updatedHostel = await hostelModel.updateHostel(id, hostelData);
    
    if (!updatedHostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hostel updated successfully',
      data: updatedHostel
    });
  } catch (error) {
    console.error('Error updating hostel:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating hostel',
      error: error.message
    });
  }
};

const deleteHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHostel = await hostelModel.deleteHostel(id);
    
    if (!deletedHostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hostel deleted successfully',
      data: deletedHostel
    });
  } catch (error) {
    console.error('Error deleting hostel:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting hostel',
      error: error.message
    });
  }
};

module.exports = { createHostel, getAllHostels, getHostelById, updateHostel, deleteHostel };