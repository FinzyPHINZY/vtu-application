// Initiates an emergency system shutdown
import SystemStatus from '../../models/SystemStatus.js';
import ApiError from '@utils/error.js';

export const emergencyShutdown = async (req, res, next) => {
  try {
    const { reason, duration, services } = req.body;

    if (!services || !services.length) {
      throw new ApiError(
        400,
        false,
        'Please specify services to update or shutdown'
      );
    }

    const validServices = ['data', 'airtime', 'cable-tv', 'utility', 'system'];
    const invalidServices = services.filter(
      (service) => !validServices.includes(service)
    );
    if (invalidServices.length) {
      throw new ApiError(
        400,
        false,
        'Invalid Services. Try again',
        `${invalidServices.join(', ')}`
      );
    }

    const shutdownPromises = services.map((service) =>
      SystemStatus.findOneAndUpdate(
        { key: service },
        {
          isActive: true,
          reason,
          shutdownTime: new Date(),
          duration,
          estimatedRestoreTime: new Date(Date.now() + 60 * 60000),
        },
        { upsert: true, new: true }
      )
    );

    const updatedServices = await Promise.all(shutdownPromises);

    // await SystemStatus.findOneAndUpdate(
    //   { key: 'shutdown' },
    //   {
    //     isActive: true,
    //     reason,
    //     shutdownTime: new Date(),
    //     duration,
    //     estimatedRestoreTime: new Date(Date.now() + 60 * 60000),
    //   },
    //   { upsert: true, new: true }
    // );

    // Log the shutdown event
    console.warn('Emergency shutdown initiated', {
      adminId: req.user.id,
      reason,
      duration,
    });

    // Schedule automatic restoration after the duration
    // setTimeout(async () => {
    //   await SystemStatus.findOneAndUpdate(
    //     { key: 'shutdown' },
    //     { isActive: false },
    //     { new: true }
    //   );
    //   console.log('System automatically restored after emergency shutdown');
    // }, duration * 60000);

    // Schedule automatic restoration for each service
    for (const service of services) {
      setTimeout(async () => {
        await SystemStatus.findOneAndUpdate(
          { key: service },
          { isActive: false },
          { new: true }
        );
        console.log(
          `Service ${service} automatically restored after emergency shutdown`
        );
      }, duration * 60000);
    }

    res.status(200).json({
      success: true,
      message: 'Emergency shutdown initiated successfully',
      data: {
        services: updatedServices,
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
    const { services } = req.body;

    if (!services || !services.length) {
      throw new ApiError(400, false, 'Please specify services to restore');
    }

    // Validate services
    const validServices = ['data', 'airtime', 'cable-tv', 'utility', 'system'];
    const invalidServices = services.filter(
      (service) => !validServices.includes(service)
    );
    if (invalidServices.length) {
      throw new ApiError(
        400,
        false,
        `Invalid services: ${invalidServices.join(', ')}`
      );
    }

    // Check if specified services are actually shut down
    const serviceStatuses = await SystemStatus.find({ key: { $in: services } });
    const activeServices = serviceStatuses.filter((status) => status.isActive);

    // if (!systemStatus || !systemStatus.isActive) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'System is not currently shut down.',
    //   });
    // }

    if (!activeServices.length) {
      throw new ApiError(
        400,
        false,
        'None of the specified services are currently shut down.'
      );
    }

    const restorePromises = activeServices.map((service) =>
      SystemStatus.findOneAndUpdate(
        { key: service.key },
        {
          isActive: false,
          reason: null,
          shutdownTime: null,
          duration: 0,
          estimatedRestoredTime: null,
        },
        { new: true }
      )
    );

    await Promise.all(restorePromises);

    // Restore system functionality
    // await SystemStatus.findOneAndUpdate(
    //   { key: 'shutdown' },
    //   {
    //     isActive: false,
    //     reason: null,
    //     shutdownTime: null,
    //     duration: 0,
    //     estimatedRestoreTime: null,
    //   },
    //   { new: true }
    // );

    console.log('System restoration initiated', {
      adminId: req.user.id,
      services: activeServices.map((s) => s.key),
    });

    res.status(200).json({
      success: true,
      message: 'Services restored successfully',
      data: {
        restoredServices: activeServices.map((s) => s.key),
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

export const getServicesStatus = async (req, res, next) => {
  try {
    const statuses = await SystemStatus.find({});

    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    next(error);
  }
};
