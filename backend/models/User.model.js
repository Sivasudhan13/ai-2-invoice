import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['personal', 'organization_admin', 'supplier', 'mentor'],
    default: 'personal'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  permissions: {
    canUpload: { type: Boolean, default: true },
    canView: { type: Boolean, default: true },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Set permissions based on role if role is modified
  if (this.isModified('role')) {
    switch (this.role) {
      case 'organization_admin':
        this.permissions = {
          canUpload: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          canManageUsers: true
        };
        break;
      case 'supplier':
        this.permissions = {
          canUpload: true,
          canView: true,
          canEdit: false,
          canDelete: false,
          canManageUsers: false
        };
        break;
      case 'mentor':
        this.permissions = {
          canUpload: false,
          canView: true,
          canEdit: false,
          canDelete: false,
          canManageUsers: false
        };
        break;
      case 'personal':
      default:
        this.permissions = {
          canUpload: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          canManageUsers: false
        };
    }
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
