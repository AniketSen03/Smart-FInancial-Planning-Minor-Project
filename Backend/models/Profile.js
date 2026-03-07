const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Income
    monthlyIncome: { type: Number, default: 0 },
    otherIncome: { type: Number, default: 0 },

    // Expenses
    monthlyExpenses: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },
    utilities: { type: Number, default: 0 },
    groceries: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },

    // EMI / Loans summary
    totalEMI: { type: Number, default: 0 },

    // Savings & Investments
    monthlySavings: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },
    monthlyInvestments: { type: Number, default: 0 },
    totalInvestments: { type: Number, default: 0 },

    // Emergency fund
    emergencyFund: { type: Number, default: 0 },
    emergencyFundTarget: { type: Number, default: 0 },

    // Risk profile
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },

    // Age (used for retirement & SIP calculations)
    age: { type: Number, default: null },
    retirementAge: { type: Number, default: 60 },

    // Currency preference
    currency: { type: String, default: 'INR' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
