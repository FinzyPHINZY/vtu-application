import CablePlan from '../../models/CablePlan.js';
import DataPlan from '../../models/DataPlans.js';
import ApiError from '../../utils/error.js';

export const updateDataPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { amount } = req.body;

    const updatedPlan = await DataPlan.findByIdAndUpdate(
      planId,
      { amount },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      throw new ApiError(404, false, 'Data plan not found');
    }

    console.log(`Data plan updated: ${planId}`, {
      adminId: req.user.id,
      updates: { amount },
    });

    res.status(200).json({
      success: true,
      message: 'Data plan updated successfully',
      data: updatedPlan,
    });
  } catch (error) {
    console.error(`Failed to update data plan ${req.params.planId}:`, error);
    next(error);
  }
};

export const updateCablePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { amount } = req.body;

    const updatedCablePlan = await CablePlan.findByIdAndUpdate(
      planId,
      { amount },
      { new: true, runValidators: true }
    );

    if (!updatedCablePlan) {
      throw new ApiError(404, false, 'Cable plan not found');
    }

    console.log(`Cable plan updated: ${planId}`, {
      adminId: req.user.id,
      updates: { amount },
    });

    res.status(200).json({
      success: true,
      message: 'Cable plan updated successfully',
      data: updatedCablePlan,
    });
  } catch (error) {
    console.error(`Failed to update cable plan ${req.params.planId}:`, error);
    next(error);
  }
};

export const createDataPlan = async (req, res, next) => {
  try {
    const { data_id, amount, network, size, planType, validity } = req.body;

    const existingPlan = await DataPlan.findOne({ data_id });
    if (existingPlan) {
      throw new ApiError(400, false, 'Data plan already exists');
    }

    const newDataPlan = await DataPlan.create({
      data_id,
      amount,
      network,
      size,
      planType,
      validity,
    });

    if (!newDataPlan) {
      throw new ApiError(400, false, 'failed to create data plan. Try again');
    }

    console.log('New data plan created');

    res.status(201).json({
      success: true,
      message: 'Data plan created successfully',
      data: newDataPlan,
    });
  } catch (error) {
    console.error('Failed to create data plan:', error);
    next(error);
  }
};

export const createCablePlan = async (req, res, next) => {
  try {
    const { cablePlanID, cablename, amount } = req.body;

    const existingPlan = await CablePlan.findOne({ cablePlanID });

    if (existingPlan) {
      throw new ApiError(400, false, 'Cable Plan already exists');
    }

    const newCablePlan = await CablePlan.create({
      cablePlanID,
      cablename,
      amount,
    });

    if (!newCablePlan) {
      throw new ApiError(400, false, 'failed to create cable plan. Try again');
    }

    console.log('New cable plan created', {
      adminId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Cable plan created successfully',
      data: newCablePlan,
    });
  } catch (error) {
    console.error('Failed to create cable plan:', error);
    next(error);
  }
};

export const deleteDataPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    const deletedDataPlan = await DataPlan.findByIdAndDelete(planId);

    if (!deletedDataPlan) {
      throw new ApiError(404, false, 'Data plan not found');
    }

    console.log(`Data plan deleted: ${planId}`);

    res.status(200).json({
      success: true,
      message: 'Data plan deleted successfully',
    });
  } catch (error) {
    console.error(`Failed to delete data plan ${req.params.planId}:`, error);
    next(error);
  }
};

export const deleteCablePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;

    // TODO: Implement database deletion logic

    const deletedCablePlan = await CablePlan.findByIdAndDelete(planId);

    if (!deletedCablePlan) {
      throw new ApiError(404, false, 'Cable plan not found');
    }

    console.log(`Cable plan deleted: ${planId}`);

    res.status(200).json({
      success: true,
      message: 'Cable plan deleted successfully',
    });
  } catch (error) {
    console.error(`Failed to delete cable plan ${req.params.planId}:`, error);
    next(error);
  }
};
