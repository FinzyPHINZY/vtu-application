import Transaction from '../../models/Transaction.js';
import { getDateRange } from '../../utils/admin/helpers.js';
import ApiError from '../../utils/error.js';

export const getRevenue = async (req, res, next) => {
  try {
    const { period } = req.query;

    if (!period || !['weekly', 'monthly', 'yearly'].includes(period)) {
      throw new ApiError(400, false, 'Invalid period', period);
    }

    const { startDate, endDate, prevStartDate, prevEndDate } =
      getDateRange(period);

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$serviceType',
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);

    const breakdown = {
      airtime: 0,
      data: 0,
      electricity: 0,
      bank_transfer: 0,
      deposit: 0,
      tvSubscription: 0,
    };

    let totalRevenue = 0;

    revenueData.forEach(({ _id, totalRevenue: revenue }) => {
      breakdown[_id] += revenue;
      totalRevenue += revenue;
    });

    console.log(breakdown);

    // Fetch revenue for the previous period
    const prevRevenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: prevStartDate, $lte: prevEndDate },
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    const prevRevenue = prevRevenueData.length
      ? prevRevenueData[0].totalRevenue
      : 0;

    // Calculate percentage change
    let percentageChange = 0;
    let trend = 'stable';
    if (prevRevenue > 0) {
      percentageChange = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
      trend =
        percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable';
    }

    console.log(`Revenue report generated for period: ${period}`, {
      adminId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Revenue data retrieved successfully',
      data: {
        period,
        total: totalRevenue, // Replace with actual total
        breakdown,
        comparisonWithPrevious: {
          percentage: percentageChange.toFixed(2),
          trend,
        },
      },
    });
  } catch (error) {
    console.error('Revenue report generation failed:', error);
    next(error);
  }
};

export const getTransactionsSummary = async (req, res, next) => {
  try {
    // Count transactions directly from the database for efficiency
    const [successful, pending, failed, total] = await Promise.all([
      Transaction.countDocuments({ status: 'success' }),
      Transaction.countDocuments({ status: 'pending' }),
      Transaction.countDocuments({ status: 'failed' }),
      Transaction.countDocuments({}),
    ]);

    const successRate =
      total > 0 ? `${Math.round((successful / total) * 100)}%` : '0%';

    console.log('Transaction summary generated', { adminId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Transaction summary retrieved successfully',
      data: { total, successful, failed, pending, successRate },
    });
  } catch (error) {
    console.error('Transaction summary generation failed:', error);
    next(error);
  }
};

export const getActiveUsers = async (req, res, next) => {
  try {
    // TODO: Implement active users calculation logic
    // This could include:
    // 1. Counting daily/monthly active users
    // 2. Analyzing user engagement
    // 3. Identifying most active users
    // 4. Tracking user retention

    console.log('Active users report generated', {
      adminId: req.userId,
    });

    res.status(200).json({
      success: true,
      message: 'Active users data retrieved successfully',
      data: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        retentionRate: '0%',
        topUsers: [],
      },
    });
  } catch (error) {
    console.error('Active users report generation failed:', error);
    next(error);
  }
};
