import InvoiceHistory from '../models/InvoiceHistory.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getHistory = async (req, res) => {
  try {
    const history = await InvoiceHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error fetching invoice history' });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the record and verify ownership
    const record = await InvoiceHistory.findOne({ _id: id, user: req.user._id });
    
    if (!record) {
      return res.status(404).json({ message: 'History record not found or unauthorized' });
    }

    // Try to delete the associated file if it exists
    if (record.fileUrl) {
      try {
        // extract filename from URL (e.g. /uploads/filename.pdf)
        const filename = record.fileUrl.split('/').pop();
        if (filename) {
          const filePath = path.join(__dirname, '..', 'uploads', filename);
          await fs.unlink(filePath);
        }
      } catch (fileErr) {
        console.error('Error deleting file associated with history record:', fileErr);
        // We still proceed to delete the DB record even if file deletion fails
      }
    }

    // Delete the database record
    await InvoiceHistory.findByIdAndDelete(id);

    res.json({ message: 'History record deleted successfully' });
  } catch (error) {
    console.error('Error deleting history record:', error);
    res.status(500).json({ message: 'Server error deleting history record' });
  }
};
