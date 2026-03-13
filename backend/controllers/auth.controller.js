import User from '../models/User.model.js';
import Organization from '../models/Organization.model.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, accountType } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    let user;
    let organization = null;

    // If organization account type, create organization and set user as admin
    if (accountType === 'organization') {
      // Create user first without organizationId
      user = await User.create({ 
        name, 
        email, 
        password, 
        role: 'organization_admin'
      });

      // Create organization with this user as admin
      organization = await Organization.create({
        name: `${name}'s Organization`,
        email: email,
        address: 'Not specified',
        phone: 'Not specified',
        adminId: user._id
      });

      // Update user with organizationId
      user.organizationId = organization._id;
      await user.save();

    } else {
      // Personal account - create regular user
      user = await User.create({ 
        name, 
        email, 
        password, 
        role: 'personal'
      });
    }

    // Build response data
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      token: generateToken(user._id)
    };

    // Add organization data if applicable
    if (organization) {
      responseData.organizationId = organization._id;
      responseData.organizationName = organization.name;
    }

    res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during signup'
    });
  }
};

export const login = async (req, res) => {
  console.log('\n=== LOGIN REQUEST ===');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('ERROR: Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email }).populate('organizationId', 'name');
    
    if (!user) {
      console.log('ERROR: User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log('User found:', { id: user._id, name: user.name, role: user.role });
    console.log('Comparing password...');
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('ERROR: Password does not match');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Build response data with organization information
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      token: generateToken(user._id)
    };

    // Add organization data if user belongs to an organization
    if (user.organizationId) {
      responseData.organizationId = user.organizationId._id;
      responseData.organizationName = user.organizationId.name;
    }

    console.log('SUCCESS: Login successful');
    console.log('=== END LOGIN ===\n');

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('EXCEPTION in login:', error);
    console.log('=== END LOGIN (ERROR) ===\n');
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during login'
    });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};
