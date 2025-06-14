import moment from 'moment';
import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';
import { getDateRange } from '../../utils/admin/helpers.js';
import ApiError from '../../utils/error.js';
import {
  getActiveUsers,
  getActivityBreakdown,
  getTransactingUsers,
  getUserRetention,
} from '../../utils/userActivity.js';

export const getRevenue = async (req, res, next) => {
  try {
    const { period } = req.query;

    if (!period || !['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
      throw new ApiError(400, false, 'Invalid period', period);
    }

    const { startDate, endDate, prevStartDate, prevEndDate } =
      getDateRange(period);

    // Current period revenue - using updatedAt for successful transactions
    const revenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          updatedAt: {
            $gte: startDate,
            $lte: endDate,
          },
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
      deposit: period === 'daily' ? undefined : 0,
      tvSubscription: 0,
    };

    let totalRevenue = 0;

    revenueData.forEach(({ _id, totalRevenue: revenue }) => {
      if (period === 'daily' && _id === 'deposit') {
        return;
      }
      breakdown[_id] = (breakdown[_id] || 0) + revenue;
      totalRevenue += revenue;
    });

    const prevRevenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          updatedAt: {
            $gte: prevStartDate,
            $lte: prevEndDate,
          },
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

    return res.status(200).json({
      success: true,
      message: 'Revenue data retrieved successfully',
      data: {
        period,
        total: totalRevenue,
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

export const getPreviousDayDeposits = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(now.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const deposits = await Transaction.aggregate([
      {
        $match: {
          serviceType: 'deposit',
          status: 'success',
          updatedAt: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
        },
      },
      {
        $project: {
          _id: 1,
          reference: 1,
          amount: 1,
          currency: 1,
          user: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const profits = await Transaction.aggregate([
      {
        $match: {
          serviceType: {
            $in: ['data', 'airtime', 'electricity', 'tvSubscription'],
          },
          status: 'success',
          updatedAt: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
        },
      },
      {
        $addFields: {
          actualCost: {
            $cond: {
              if: { $ifNull: ['$metadata.plan.costPrice', false] },
              then: '$metadata.plan.costPrice',
              else: {
                $cond: {
                  if: { $eq: ['$serviceType', 'airtime'] },
                  then: { $subtract: ['$sellingPrice', '$profit'] },
                  else: '$amount',
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: { $ifNull: ['$profit', 0] } },
          totalSales: { $sum: { $ifNull: ['$sellingPrice', 0] } },
          totalCost: { $sum: { $ifNull: ['$actualCost', 0] } },
          totalCount: { $sum: 1 },
          breakdown: {
            $push: {
              serviceType: '$serviceType',
              profit: '$profit',
              sellingPrice: '$sellingPrice',
              actualCost: '$actualCost',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProfit: 1,
          totalSales: 1,
          totalCost: 1,
          totalCount: 1,
          // breakdown: {
          //   $reduce: {
          //     input: '$breakdown',
          //     initialValue: {},
          //     in: {
          //       $mergeObjects: [
          //         '$$value',
          //         {
          //           $cond: [
          //             { $eq: ['$$this.serviceType', null] },
          //             {},
          //             {
          //               $arrayToObject: [
          //                 [
          //                   [
          //                     '$$this.serviceType',
          //                     {
          //                       profit: '$$this.profit',
          //                       sales: '$$this.sellingPrice',
          //                       cost: '$$this.actualCost',
          //                     },
          //                   ],
          //                 ],
          //               ],
          //             },
          //           ],
          //         },
          //       ],
          //     },
          //   },
          // },
        },
      },
    ]);

    const totalDeposits = deposits.reduce(
      (sum, deposit) => sum + deposit.amount,
      0
    );

    return res.status(200).json({
      success: true,
      message: 'Previous day deposits retrieved successfully',
      data: {
        deposits: {
          date: endOfYesterday.toISOString().split('T')[0],
          totalAmount: totalDeposits,
          count: deposits.length,
          deposits,
        },
        profits: profits[0] || {
          totalProfit: 0,
          totalSales: 0,
          totalCost: 0,
          totalCount: 0,
          // breakdown: {},
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch previous day deposits:', error);
    next(error);
  }
};

export const getTransactionsSummary = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query; // 'daily', 'weekly', 'monthly', or 'all'

    const adminId = req.user.id;

    // Date range calculation based on period
    let startDate = new Date();
    const endDate = new Date();

    switch (period.toLowerCase()) {
      case 'daily':
        startDate = moment().startOf('day').toDate();
        break;
      case 'weekly':
        startDate = moment().startOf('week').toDate();
        break;
      case 'monthly':
        startDate = moment().startOf('month').toDate();
        break;
      // case "all":
      default:
        startDate = null;
    }

    const baseQuery = {};
    if (startDate) {
      baseQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Count transactions directly from the database for efficiency
    const [successful, pending, failed, total] = await Promise.all([
      Transaction.countDocuments({ ...baseQuery, status: 'success' }),
      Transaction.countDocuments({ ...baseQuery, status: 'pending' }),
      Transaction.countDocuments({ ...baseQuery, status: 'failed' }),
      Transaction.countDocuments(baseQuery),
    ]);

    const successRate =
      total > 0 ? `${Math.round((successful / total) * 100)}%` : '0%';

    console.log(`Transaction summary generated for ${period} period`, {
      adminId,
    });

    res.status(200).json({
      success: true,
      message: `Transaction summary (${period}) retrieved successfully`,
      period,
      dateRange: startDate
        ? {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          }
        : null,
      data: { total, successful, failed, pending, successRate },
    });
  } catch (error) {
    console.error('Transaction summary generation failed:', error);
    next(error);
  }
};

export const fetchActiveUsers = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const data = {
      totalUsers: await User.countDocuments(),
      activeUsers: {
        daily: await getActiveUsers('daily'),
        weekly: await getActiveUsers('weekly'),
        monthly: await getActiveUsers('monthly'),
        quarterly: await getActiveUsers('quarterly'),
      },
      transactingUsers: {
        daily: await getTransactingUsers(todayStart, todayEnd),
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
    const { range, customDate } = req.query;

    const allowedRanges = ['daily', 'weekly', 'monthly', 'yearly'];
    if (range && !allowedRanges.includes(range)) {
      throw new ApiError(
        400,
        false,
        `Invalid range. Use: ${allowedRanges.join(', ')}`
      );
    }

    let startDate;
    let endDate;
    const referenceDate = customDate ? new Date(customDate) : new Date();

    switch (range) {
      case 'daily':
        startDate = new Date(referenceDate);
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(referenceDate);
        endDate.setUTCHours(23, 59, 59, 999);
        break;

      case 'weekly':
        startDate = new Date(referenceDate);
        startDate.setUTCDate(startDate.getUTCDate() - 6);
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(referenceDate);
        endDate.setUTCHours(23, 59, 59, 999);
        break;

      case 'monthly':
        startDate = new Date(referenceDate);
        startDate.setUTCDate(1);
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(referenceDate);
        endDate.setUTCMonth(endDate.getUTCMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);
        break;

      case 'yearly':
        startDate = new Date(referenceDate);
        startDate.setUTCMonth(0, 1); // January 1st
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(referenceDate);
        endDate.setUTCMonth(11, 31); // December 31st
        endDate.setUTCHours(23, 59, 59, 999);
        break;

      default:
        break;
    }

    const match = {
      status: 'success',
      serviceType: {
        $in: ['data', 'airtime', 'electricity', 'tvSubscription'],
      },
    };

    if (range) {
      match.createdAt = { $gte: startDate, $lte: endDate };
    }

    const overallResults = await Transaction.aggregate([
      { $match: match },
      {
        $addFields: {
          actualCost: {
            $cond: {
              if: { $ifNull: ['$metadata.plan.costPrice', false] },
              then: '$metadata.plan.costPrice',
              else: {
                $cond: {
                  if: { $eq: ['$serviceType', 'airtime'] },
                  then: { $subtract: ['$sellingPrice', '$profit'] }, // For airtime: cost = sellingPrice - profit
                  else: '$amount', // Fallback for other types
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: { $ifNull: ['$profit', 0] } },
          totalSales: { $sum: { $ifNull: ['$sellingPrice', 0] } },
          totalCost: { $sum: { $ifNull: ['$actualCost', 0] } },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const breakdownResults = await Transaction.aggregate([
      { $match: match },
      {
        $addFields: {
          actualCost: {
            $cond: {
              if: { $ifNull: ['$metadata.plan.costPrice', false] },
              then: '$metadata.plan.costPrice',
              else: {
                $cond: {
                  if: { $eq: ['$serviceType', 'airtime'] },
                  then: { $subtract: ['$sellingPrice', '$profit'] },
                  else: '$amount',
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$serviceType',
          profit: { $sum: { $ifNull: ['$profit', 0] } },
          sales: { $sum: { $ifNull: ['$sellingPrice', 0] } },
          totalCost: { $sum: { $ifNull: ['$actualCost', 0] } },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...(overallResults[0] || {
          totalProfit: 0,
          totalSales: 0,
          totalCost: 0,
          totalCount: 0,
        }),
        breakdown: breakdownResults.reduce(
          (acc, curr) => ({ ...acc, [curr._id]: curr }),
          {}
        ),
        meta: { range, startDate, endDate }, // Optional: return time range details
      },
    });
  } catch (error) {
    console.log('failed to calculate profit', error);
    next(error);
  }
};
