import UserActivity from '../models/UserActivity.js';
import User from '../models/User.js';

export const logUserActivity = async (userId, activityType, metadata = {}) => {
  try {
    await UserActivity.create({
      userId,
      activityType,
      metadata,
      timestamp: new Date(),
    });

    await User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
    });
  } catch (error) {
    console.error(
      'Failed to log user activity',
      error?.response || error?.message || error
    );
  }
};

// services/analytics.js
export async function getActiveUsers(timeframe) {
  const now = new Date();
  let startDate;

  switch (timeframe) {
    case 'daily':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarterly':
      startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
  }

  // Count distinct users with activity after the start date
  const activeUserCount = await UserActivity.distinct('userId', {
    timestamp: { $gte: startDate },
  }).countDocuments();

  return activeUserCount;
}

// Get activity breakdown
export async function getActivityBreakdown(timeframe = 'monthly') {
  const now = new Date();
  const startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); // Default to monthly

  return await UserActivity.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    {
      $project: {
        activityType: '$_id',
        count: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
        _id: 0,
      },
    },
  ]);
}

export async function getUserRetention() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Users active last month
  const lastMonthUsers = await UserActivity.distinct('userId', {
    timestamp: {
      $gte: lastMonth,
      $lt: thisMonth,
    },
  });

  // Users from last month who are also active this month
  const retainedUsers = await UserActivity.distinct('userId', {
    userId: { $in: lastMonthUsers },
    timestamp: { $gte: thisMonth },
  });

  return {
    lastMonthActiveUsers: lastMonthUsers.length,
    retainedUsers: retainedUsers.length,
    retentionRate: lastMonthUsers.length
      ? (retainedUsers.length / lastMonthUsers.length) * 100
      : 0,
  };
}
