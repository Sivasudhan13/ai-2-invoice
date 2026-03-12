import History from '../models/History.model.js';
import fs from 'fs/promises';

export const getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch history'
    });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const history = await History.findById(req.params.id);

    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History record not found'
      });
    }

    if (history.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this record'
      });
    }

    // Delete associated file if exists
    if (history.filePath) {
      try {
        await fs.unlink(history.filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await History.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'History record deleted successfully'
    });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete history'
    });
  }
};
