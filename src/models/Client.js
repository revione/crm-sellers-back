import mongoose from 'mongoose';
import { isValidEmail, isValidPhone } from '../utils/validators.js';

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    lastname: {
      type: String,
      required: [true, 'Lastname is required'],
      trim: true,
      minlength: [2, 'Lastname must be at least 2 characters'],
      maxlength: [50, 'Lastname cannot exceed 50 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidEmail,
        message: 'Please provide a valid email address',
      },
    },
    tel: {
      type: String,
      trim: true,
      validate: {
        validator: isValidPhone,
        message: 'Please provide a valid phone number',
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    created: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔍 Indexes for better performance
ClientSchema.index({ email: 1 });
ClientSchema.index({ seller: 1 });
ClientSchema.index({ company: 1 });
ClientSchema.index({ active: 1 });
ClientSchema.index({ created: -1 });

// 🔍 Compound index for seller + active clients
ClientSchema.index({ seller: 1, active: 1 });

// 🎭 Virtual for full name
ClientSchema.virtual('fullName').get(function () {
  return `${this.name} ${this.lastname}`;
});

// 🧹 Clean up response
ClientSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Client', ClientSchema);
