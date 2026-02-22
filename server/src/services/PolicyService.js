const Policy = require('../models/Policy');
const User = require('../models/User');

class PolicyService {
  static async searchPoliciesByUsername(firstname) {
    try {
      // Find user by firstname
      const user = await User.findOne({ firstname: new RegExp(firstname, 'i') });
      
      if (!user) {
        return { success: false, message: 'User not found', policies: [] };
      }

      // Find all policies for this user
      const policies = await Policy.find({ user_id: user._id })
        .populate('user_id', 'firstname email phone address')
        .populate('company_id', 'company_name')
        .populate('category_id', 'category_name')
        .lean();

      return {
        success: true,
        user: {
          id: user._id,
          firstname: user.firstname,
          email: user.email,
          phone: user.phone
        },
        policies,
        count: policies.length
      };
    } catch (error) {
      throw new Error(`Error searching policies: ${error.message}`);
    }
  }

  static async getAggregatedPoliciesByUser() {
    try {
      const aggregation = await Policy.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'carriers',
            localField: 'company_id',
            foreignField: '_id',
            as: 'carrier'
          }
        },
        {
          $lookup: {
            from: 'lobs',
            localField: 'category_id',
            foreignField: '_id',
            as: 'lob'
          }
        },
        {
          $group: {
            _id: '$user_id',
            user_info: { $first: { $arrayElemAt: ['$user', 0] } },
            total_policies: { $sum: 1 },
            total_premium: { $sum: '$premium_amount' },
            policies: {
              $push: {
                policy_number: '$policy_number',
                policy_type: '$policy_type',
                premium_amount: '$premium_amount',
                company_name: { $arrayElemAt: ['$carrier.company_name', 0] },
                category_name: { $arrayElemAt: ['$lob.category_name', 0] },
                start_date: '$policy_start_date',
                end_date: '$policy_end_date'
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            firstname: '$user_info.firstname',
            email: '$user_info.email',
            phone: '$user_info.phone',
            total_policies: 1,
            total_premium: 1,
            policies: 1
          }
        },
        {
          $sort: { total_premium: -1 }
        }
      ]);

      return {
        success: true,
        data: aggregation,
        count: aggregation.length
      };
    } catch (error) {
      throw new Error(`Error getting aggregated policies: ${error.message}`);
    }
  }
}

module.exports = PolicyService;
