import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';
import { getDateRange } from '../../utils/admin/helpers.js';
import ApiError from '../../utils/error.js';
import {
  getActiveUsers,
  getActivityBreakdown,
  getUserRetention,
} from '../../utils/userActivity.js';

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

export const fetchActiveUsers = async (req, res, next) => {
  try {
    const data = {
      totalUsers: await User.countDocuments(),
      activeUsers: {
        daily: await getActiveUsers('daily'),
        weekly: await getActiveUsers('weekly'),
        monthly: await getActiveUsers('monthly'),
        quarterly: await getActiveUsers('quarterly'),
      },
      activityBreakdown: await getActivityBreakdown(),
      retention: await getUserRetention(),
      newUsersToday: await User.countDocuments({
        createdAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) },
      }),
    };

    console.log('Active users report generated');

    res.status(200).json({
      success: true,
      message: 'Active users data retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('Active users report generation failed:', error);
    next(error);
  }
};

export const calcProfit = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {
      status: 'success',
      serviceType: {
        $in: ['data', 'airtime', 'electricity', 'tvSubscription'],
      },
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // First aggregation - get totals across all services
    const overallResults = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: { $ifNull: ['$profit', 0] } },
          totalSales: { $sum: { $ifNull: ['$sellingPrice', 0] } },
          totalCost: { $sum: { $ifNull: ['$amount', 0] } },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    // Second aggregation - get breakdown by service type
    const breakdownResults = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$serviceType',
          profit: { $sum: { $ifNull: ['$profit', 0] } },
          sales: { $sum: { $ifNull: ['$sellingPrice', 0] } },
          cost: { $sum: { $ifNull: ['$amount', 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { profit: -1 } }, // Sort by most profitable first
    ]);

    // Format the breakdown into a more accessible object
    const breakdown = breakdownResults.reduce((acc, curr) => {
      acc[curr._id] = {
        profit: curr.profit,
        sales: curr.sales,
        cost: curr.cost,
        count: curr.count,
      };
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        ...(overallResults[0] || {
          totalProfit: 0,
          totalSales: 0,
          totalCost: 0,
          totalCount: 0,
        }),
        breakdown,
      },
    });
  } catch (error) {
    console.error(
      'Failed to calculate profit',
      error?.response || error?.message || error
    );
    next(error);
  }
};
