// Initiates an emergency system shutdown
import SystemStatus from '../../models/SystemStatus.js';

export const emergencyShutdown = async (req, res, next) => {
  try {
    const { reason, duration } = req.body;

    await SystemStatus.findOneAndUpdate(
      { key: 'shutdown' },
      {
        isActive: true,
        reason,
        shutdownTime: new Date(),
        duration,
        estimatedRestoreTime: new Date(Date.now() + 60 * 60000),
      },
      { upsert: true, new: true }
    );

    // Log the shutdown event
    console.warn('Emergency shutdown initiated', {
      adminId: req.user.id,
      reason,
      duration,
    });

    // Schedule automatic restoration after the duration
    setTimeout(async () => {
      await SystemStatus.findOneAndUpdate(
        { key: 'shutdown' },
        { isActive: false },
        { new: true }
      );
      console.log('System automatically restored after emergency shutdown');
    }, duration * 60000);

    res.status(200).json({
      success: true,
      message: 'Emergency shutdown initiated successfully',
      data: {
        shutdownTime: new Date(),
        reason,
        duration,
        estimatedRestoreTime: new Date(Date.now() + duration * 60000),
      },
    });
  } catch (error) {
    console.error(
      'Emergency shutdown failed:',
      error?.response || error?.message || error
    );
    next(error);
  }
};

// Restores system functionality after emergency shutdown
export const emergencyRestore = async (req, res, next) => {
  try {
    const systemStatus = await SystemStatus.findOne({ key: 'shutdown' });

    if (!systemStatus || !systemStatus.isActive) {
      return res.status(400).json({
        success: false,
        message: 'System is not currently shut down.',
      });
    }

    // Restore system functionality
    await SystemStatus.findOneAndUpdate(
      { key: 'shutdown' },
      {
        isActive: false,
        reason: null,
        shutdownTime: null,
        duration: 0,
        estimatedRestoreTime: null,
      },
      { new: true }
    );

    console.log('System restoration initiated', {
      adminId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'System restored successfully',
      data: {
        restoreTime: new Date(),
      },
    });
  } catch (error) {
    console.error(
      'System restoration failed:',
      error?.response || error?.message || error
    );
    next(error);
  }
};
