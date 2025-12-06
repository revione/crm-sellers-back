import mongoose from 'mongoose';
import { ORDER_STATES } from '../config/constants.js';

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number',
      },
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    order: {
      type: [OrderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: (items) => items && items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
    state: {
      type: String,
      enum: {
        values: Object.values(ORDER_STATES),
        message: 'Invalid order state: {VALUE}',
      },
      default: ORDER_STATES.PENDING,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    date: {
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

// 🔍 Indexes for performance
OrderSchema.index({ seller: 1, state: 1 });
OrderSchema.index({ client: 1 });
OrderSchema.index({ state: 1 });
OrderSchema.index({ date: -1 });
OrderSchema.index({ createdAt: -1 });

// 🎭 Virtual for item count
OrderSchema.virtual('itemCount').get(function () {
  return this.order.reduce((sum, item) => sum + item.quantity, 0);
});

// 🎭 Virtual for order status display
OrderSchema.virtual('statusDisplay').get(function () {
  const statusMap = {
    [ORDER_STATES.PENDING]: '⏳ Pending',
    [ORDER_STATES.COMPLETED]: '✅ Completed',
    [ORDER_STATES.CANCELLED]: '❌ Cancelled',
  };
  return statusMap[this.state] || this.state;
});

// 🧹 Clean up response
OrderSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

// 📊 Pre-save hook to validate total matches items
OrderSchema.pre('save', function (next) {
  const calculatedTotal = this.order.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  // Allow small floating point differences (0.01)
  const difference = Math.abs(calculatedTotal - this.total);
  if (difference > 0.01) {
    next(new Error(`Total (${this.total}) doesn't match order items (${calculatedTotal})`));
  } else {
    next();
  }
});

export default mongoose.model('Order', OrderSchema);
