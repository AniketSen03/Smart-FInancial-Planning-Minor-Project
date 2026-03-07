const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [150, 'Goal name cannot exceed 150 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount must be positive'],
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Saved amount cannot be negative'],
    },
    targetDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['emergency', 'education', 'home', 'vehicle', 'travel', 'retirement', 'wedding', 'other'],
      default: 'other',
    },
    monthlySIPRequired: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-mark as completed when savedAmount >= targetAmount
goalSchema.pre('save', function (next) {
  if (this.savedAmount >= this.targetAmount && this.targetAmount > 0) {
    this.isCompleted = true;
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
