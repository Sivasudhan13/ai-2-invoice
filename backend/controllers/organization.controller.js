import Organization from '../models/Organization.model.js';
import User from '../models/User.model.js';
import History from '../models/History.model.js';

// Create organization (during signup)
export const createOrganization = async (req, res) => {
  try {
    const { name, email, address, phone, gstin } = req.body;

    const organization = await Organization.create({
      name,
      email,
      address,
      phone,
      gstin,
      adminId: req.user._id
    });

    // Update user role to organization_admin
    await User.findByIdAndUpdate(req.user._id, {
      role: 'organization_admin',
      organizationId: organization._id
    });

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create organization'
    });
  }
};

// Create supplier account
export const createSupplier = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user is organization admin
    if (req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only organization admins can create supplier accounts'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use'
      });
    }

    // Create supplier user
    const supplier = await User.create({
      name,
      email,
      password,
      role: 'supplier',
      organizationId: req.user.organizationId,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: {
        id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        role: supplier.role,
        permissions: supplier.permissions
      }
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create supplier account'
    });
  }
};

// Create mentor account
export const createMentor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Only organization admins can create mentor accounts'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use'
      });
    }

    const mentor = await User.create({
      name,
      email,
      password,
      role: 'mentor',
      organizationId: req.user.organizationId,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        permissions: mentor.permissions
      }
    });
  } catch (error) {
    console.error('Create mentor error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create mentor account'
    });
  }
};

// Get all users in organization
export const getOrganizationUsers = async (req, res) => {
  try {
    if (req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const users = await User.find({
      organizationId: req.user.organizationId
    }).select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch users'
    });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, organizationId: req.user.organizationId },
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user status'
    });
  }
};


// Get organization invoices with filtering
export const getOrganizationInvoices = async (req, res) => {
  try {
    // Verify user has organizationId
    if (!req.user.organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - no organization associated with this account'
      });
    }

    // Verify user has canView permission or is organization_admin
    if (!req.user.permissions?.canView && req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied - canView permission required'
      });
    }

    const { supplierId, startDate, endDate } = req.query;
    const organizationId = req.user.organizationId;

    // Build query filter
    const filter = { organizationId };

    // Filter by supplier if provided
    if (supplierId) {
      filter.userId = supplierId;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day for endDate
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Fetch invoices with user details (supplier name)
    const invoices = await History.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 }); // Sort by upload date (newest first)

    // Format response with confidence scores
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice._id,
      invoiceNumber: invoice.extractedData?.invoiceNumber || 'N/A',
      supplier: {
        id: invoice.userId?._id,
        name: invoice.userId?.name || 'Unknown',
        email: invoice.userId?.email
      },
      uploadDate: invoice.createdAt,
      grandTotal: invoice.extractedData?.grandTotal || 0,
      status: invoice.extractedData ? 'processed' : 'pending',
      filename: invoice.filename,
      confidenceScores: invoice.confidenceScores || {},
      extractedData: invoice.extractedData
    }));

    res.json({
      success: true,
      count: formattedInvoices.length,
      data: formattedInvoices
    });
  } catch (error) {
    console.error('Get organization invoices error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organization invoices'
    });
  }
};

// Get organization analytics
export const getAnalytics = async (req, res) => {
  try {
    // Verify user is organization_admin
    if (req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const organizationId = req.user.organizationId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all invoices for this organization
    const allInvoices = await History.find({
      organizationId
    }).populate('userId', 'name email');

    // Get invoices from this month
    const monthInvoices = allInvoices.filter(inv => 
      new Date(inv.createdAt) >= startOfMonth
    );

    // Calculate total invoices this month
    const totalInvoicesThisMonth = monthInvoices.length;

    // Calculate total invoice value this month
    let totalValueThisMonth = 0;
    monthInvoices.forEach(invoice => {
      const grandTotal = invoice.extractedData?.grandTotal || 0;
      totalValueThisMonth += typeof grandTotal === 'string' 
        ? parseFloat(grandTotal.replace(/[^0-9.-]+/g, '')) || 0
        : grandTotal;
    });

    // Generate 30-day upload trend data
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = allInvoices.filter(inv => 
        inv.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      trendData.push({
        date: dateStr,
        count
      });
    }

    // Calculate invoice distribution by supplier
    const supplierDistribution = {};
    monthInvoices.forEach(invoice => {
      const supplierName = invoice.userId?.name || 'Unknown';
      supplierDistribution[supplierName] = (supplierDistribution[supplierName] || 0) + 1;
    });

    const supplierData = Object.entries(supplierDistribution).map(([name, count]) => ({
      name,
      count
    }));

    // Calculate average confidence score
    let totalConfidence = 0;
    let confidenceCount = 0;
    allInvoices.forEach(invoice => {
      if (invoice.confidenceScores) {
        const scores = Object.values(invoice.confidenceScores);
        scores.forEach(score => {
          if (typeof score === 'number') {
            totalConfidence += score;
            confidenceCount++;
          }
        });
      }
    });
    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    // Calculate percentage of low-confidence invoices (< 70%)
    let lowConfidenceCount = 0;
    allInvoices.forEach(invoice => {
      if (invoice.confidenceScores) {
        const scores = Object.values(invoice.confidenceScores);
        const hasLowScore = scores.some(score => 
          typeof score === 'number' && score < 70
        );
        if (hasLowScore) {
          lowConfidenceCount++;
        }
      }
    });
    const lowConfidencePercentage = allInvoices.length > 0 
      ? (lowConfidenceCount / allInvoices.length) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalInvoicesThisMonth,
        totalValueThisMonth: Math.round(totalValueThisMonth * 100) / 100,
        uploadTrend: trendData,
        supplierDistribution: supplierData,
        averageConfidenceScore: Math.round(avgConfidence * 100) / 100,
        lowConfidencePercentage: Math.round(lowConfidencePercentage * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics'
    });
  }
};
