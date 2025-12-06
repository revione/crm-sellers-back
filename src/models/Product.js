import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    existence: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be a whole number',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: (value) => value >= 0,
        message: 'Price must be a positive number',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    active: {
      type: Boolean,
      default: true,
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

// 🔍 Text index for search functionality
ProductSchema.index({ name: 'text', description: 'text' });

// 📊 Regular indexes for performance
ProductSchema.index({ price: 1 });
ProductSchema.index({ existence: 1 });
ProductSchema.index({ active: 1 });
ProductSchema.index({ created: -1 });

// 🎭 Virtual for stock status
ProductSchema.virtual('inStock').get(function () {
  return this.existence > 0;
});

ProductSchema.virtual('stockStatus').get(function () {
  if (this.existence === 0) return 'OUT_OF_STOCK';
  if (this.existence < 10) return 'LOW_STOCK';
  return 'IN_STOCK';
});

// 🧹 Clean up response
ProductSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Product', ProductSchema);
