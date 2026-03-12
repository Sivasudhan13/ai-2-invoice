import Alert from '../models/Alert.model.js';
import History from '../models/History.model.js';

// Get all alerts for organization
export const getAlerts = async (req, res) => {
  try {
    // Verify user is organization_admin
    if (req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied - organization_admin role required'
      });
    }

    const organizationId = req.user.organizationId;

    // Fetch alerts with invoice details
    const alerts = await Alert.find({ organizationId })
      .populate({
        path: 'invoiceId',
        select: 'filename extractedData createdAt userId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate unreviewed alert count
    const unreviewedCount = alerts.filter(alert => alert.status === 'unreviewed').length;

    // Format response with invoice details
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      invoiceId: alert.invoiceId?._id,
      invoiceNumber: alert.invoiceId?.extractedData?.invoiceNumber || 'N/A',
      filename: alert.invoiceId?.filename || 'Unknown',
      supplier: {
        name: alert.invoiceId?.userId?.name || 'Unknown',
        email: alert.invoiceId?.userId?.email
      },
      affectedFields: alert.affectedFields,
      confidenceScores: alert.confidenceScores,
      status: alert.status,
      uploadTimestamp: alert.invoiceId?.createdAt,
      createdAt: alert.createdAt
    }));

    res.json({
      success: true,
      count: formattedAlerts.length,
      unreviewedCount,
      data: formattedAlerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch alerts'
    });
  }
};

// Mark alert as reviewed
export const markAlertAsReviewed = async (req, res) => {
  try {
    // Verify user is organization_admin
    if (req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied - organization_admin role required'
      });
    }

    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Find and update alert, ensuring it belongs to the user's organization
    const alert = await Alert.findOneAndUpdate(
      { _id: id, organizationId },
      { status: 'reviewed' },
      { returnDocument: 'after' }
    ).populate({
      path: 'invoiceId',
      select: 'filename extractedData'
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found or access denied'
      });
    }

    res.json({
      success: true,
      data: {
        id: alert._id,
        status: alert.status,
        invoiceNumber: alert.invoiceId?.extractedData?.invoiceNumber || 'N/A'
      }
    });
  } catch (error) {
    console.error('Mark alert as reviewed error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update alert'
    });
  }
};
