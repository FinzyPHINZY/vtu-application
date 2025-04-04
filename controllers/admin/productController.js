import axios from 'axios';
import CablePlan from '../../models/CablePlan.js';
import DataPlan from '../../models/DataPlans.js';
import ApiError from '../../utils/error.js';
import { logUserActivity } from '../../utils/userActivity.js';
import ogDams from '../../models/Ogdams.js';

export const fetchAndUpdatePlans = async (req, res, next) => {
  try {
    console.log('Fetching data from API...');

    const response = await axios.get(
      `${process.env.DATASTATION_ENDPOINT}/api/user`,
      {
        headers: {
          Authorization: `Token ${process.env.DATASTATION_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('data fetched successfully');

    const { MTN_PLAN, GLO_PLAN, AIRTEL_PLAN } = response.data.Dataplans;
    const nineMobilePlan = response.data.Dataplans['9MOBILE_PLAN'];
    const { GOTVPLAN, DSTVPLAN, STARTIMEPLAN } = response.data.Cableplan;

    const tvPlans = [...GOTVPLAN, ...DSTVPLAN, ...STARTIMEPLAN];

    const parsedTvPlans = [];
    const parsedDataPlans = [];

    const internetPlans = [
      ...nineMobilePlan.ALL,
      ...MTN_PLAN.ALL,
      ...GLO_PLAN.ALL,
      ...AIRTEL_PLAN.ALL,
    ];

    for (const plan of tvPlans) {
      const newPlan = {
        cablePlanID: Number(plan.cableplan_id),
        cablename: plan.cable,
        amount: plan.plan_amount,
      };

      parsedTvPlans.push(newPlan);
    }

    for (const plan of internetPlans) {
      const newPlan = {
        data_id: Number(plan.dataplan_id),
        network: plan.plan_network,
        planType: plan.plan_type,
        amount: Number(plan.plan_amount),
        size: plan.plan,
        validity: plan.month_validate,
      };

      parsedDataPlans.push(newPlan);
    }

    // empty collections
    await DataPlan.deleteMany({});
    await CablePlan.deleteMany({});

    console.log('Collections emptied.');

    // populate collections
    await DataPlan.insertMany(parsedDataPlans);
    await CablePlan.insertMany(parsedTvPlans);

    return res.status(200).json({
      success: true,
      message: 'Data fetched and updated successfully',
    });
  } catch (error) {
    console.log(
      'ERROR: Failed to update plans',
      error?.response || error?.message || error
    );
    next(error);
  }
};

export const fetchandUpdateOgdamsData = async (req, res, next) => {
  try {
    const responseOgdams = await axios.get(
      `${process.env.OGDAMS_ENDPOINT}/api/v4/get/data/plans`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OGDAMS_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const { data, status } = responseOgdams.data;

    if (!status) {
      throw new ApiError(400, false, 'Failed to fetch OGDAMS data');
    }

    const airtelPlans = data.AIRTEL.filter((plan) => plan.type === 'AWOOF');

    const parsedPlans = [];

    for (const plan of airtelPlans) {
      const newPlan = {
        networkId: plan.networkId,
        planId: plan.planId,
        name: plan.name,
        validity: plan.validity,
        currency: plan.currency,
        amount: Number(plan.ourPrice),
        sellingPrice: Number(plan.ourPrice),
        type: plan.type,
      };

      parsedPlans.push(newPlan);
    }

    await ogDams.deleteMany({});

    await ogDams.insertMany(parsedPlans);

    return res.status(200).json({
      success: true,
      message: 'Data fetched and updated successfully',
    });
  } catch (error) {
    console.log(
      'Failed to fetch data',
      error?.response || error?.message || error
    );

    next(error);
  }
};

export const updateDataPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { sellingPrice, isAvailable } = req.body;

    const existingPlan = await DataPlan.findById(planId);
    if (!existingPlan) {
      throw new ApiError(404, false, 'Data plan not found');
    }

    // if (amount < existingPlan.amount) {
    //   throw new ApiError(
    //     400,
    //     false,
    //     'New amount cannot be less than existing price'
    //   );
    // }

    if (sellingPrice !== undefined) {
      if (typeof sellingPrice !== 'number' || sellingPrice <= 0) {
        throw new ApiError(
          400,
          false,
          'Selling price must be a positive number'
        );
      }

      if (sellingPrice < existingPlan.amount) {
        throw new ApiError(
          400,
          false,
          'Selling price cannot be less than cost price',
          {
            costPrice: existingPlan.amount,
            attemptedSellingPrice: sellingPrice,
          }
        );
      }
    }

    const updateFields = {};
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable;
    if (sellingPrice !== undefined) updateFields.sellingPrice = sellingPrice;

    const updatedPlan = await DataPlan.findByIdAndUpdate(planId, updateFields, {
      new: true,
      runValidators: true,
      select: '-__v', // Exclude version key from response
    });

    if (!updatedPlan) {
      throw new ApiError(404, false, 'Data plan not found');
    }

    // Log the update
    console.log('Data plan updated', {
      planId,
      updatedBy: req.user.id,
      changes: updateFields,
      timestamp: new Date().toISOString(),
    });

    await logUserActivity(req.user.id, 'update_data_plan', {
      planId,
      changes: updateFields,
    });

    res.status(200).json({
      success: true,
      message: 'Data plan updated successfully',
      data: {
        id: updatedPlan._id,
        network: updatedPlan.network,
        planType: updatedPlan.planType,
        isAvailable: updatedPlan.isAvailable,
        sellingPrice: updatedPlan.sellingPrice,
        previousSellingPrice: existingPlan.sellingPrice,
      },
    });
  } catch (error) {
    console.error(`Failed to update data plan ${req.params.planId}:`, error);
    next(error);
  }
};

export const updateCablePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { sellingPrice, isAvailable } = req.body;

    const existingPlan = await CablePlan.findById(planId);

    if (!existingPlan) {
      throw new ApiError(404, false, 'Cable Plan not found');
    }

    // if (amount < existingPlan.amount) {
    //   throw new ApiError(
    //     400,
    //     false,
    //     'New Amount cannot be less than existing price'
    //   );
    // }

    if (sellingPrice !== undefined) {
      if (typeof sellingPrice !== 'number' || sellingPrice <= 0) {
        throw new ApiError(
          400,
          false,
          'Selling price must be a positive number'
        );
      }

      if (sellingPrice < existingPlan.amount) {
        throw new ApiError(
          400,
          false,
          'Selling price cannot be less than cost price',
          {
            costPrice: existingPlan.amount,
            attemptedSellingPrice: sellingPrice,
          }
        );
      }
    }

    const updateFields = {};
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable;
    if (sellingPrice !== undefined) updateFields.sellingPrice = sellingPrice;

    const updatedCablePlan = await CablePlan.findByIdAndUpdate(
      planId,
      updateFields,
      {
        new: true,
        runValidators: true,
        select: '-__v', // Exclude version key from response
      }
    );

    if (!updatedCablePlan) {
      throw new ApiError(404, false, 'Cable plan not found');
    }

    console.log(`Cable plan updated: ${planId}`, {
      updatedBy: req.user.id,
      changes: updateFields,
      timestamp: new Date().toISOString(),
    });

    await logUserActivity(req.user.id, 'update_cable_plan', {
      planId,
      changes: updateFields,
    });

    res.status(200).json({
      success: true,
      message: 'Cable plan updated successfully',
      data: {
        id: updatedCablePlan._id,
        cablePlanID: updatedCablePlan.cablePlanID,
        cablename: updatedCablePlan.cablename,
        isAvailable: updatedCablePlan.isAvailable,
        sellingPrice: updatedCablePlan.sellingPrice,
        previousSellingPrice: existingPlan.sellingPrice,
      },
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

export const updateOgdamsDataPlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { sellingPrice, isAvailable } = req.body;

    const existingPlan = await ogDams.findById(planId);
    if (!existingPlan) {
      throw new ApiError(404, false, 'Data plan not found', planId);
    }

    // if (amount < existingPlan.amount) {
    //   throw new ApiError(
    //     400,
    //     false,
    //     'New amount cannot be less than existing price'
    //   );
    // }

    if (sellingPrice !== undefined) {
      if (typeof sellingPrice !== 'number' || sellingPrice <= 0) {
        throw new ApiError(
          400,
          false,
          'Selling price must be a positive number'
        );
      }

      if (sellingPrice < existingPlan.amount) {
        throw new ApiError(
          400,
          false,
          'Selling price cannot be less than cost price',
          {
            costPrice: existingPlan.amount,
            attemptedSellingPrice: sellingPrice,
          }
        );
      }
    }

    const updateFields = {};
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable;
    if (sellingPrice !== undefined) updateFields.sellingPrice = sellingPrice;

    const updatedPlan = await ogDams.findByIdAndUpdate(planId, updateFields, {
      new: true,
      runValidators: true,
      select: '-__v',
    });

    if (!updatedPlan) {
      throw new ApiError(404, false, 'Data plan not found');
    }

    console.log('Data plan updated', {
      planId,
      updatedBy: req.user.id,
      changes: updateFields,
      timestamp: new Date().toISOString(),
    });

    await logUserActivity(req.user.id, 'update_data_plam', {
      planId,
      changes: updateFields,
    });

    res.status(200).json({
      success: true,
      message: 'Data plan updated successfully',
      data: {
        id: updatedPlan._id,
        network: updatedPlan.name,
        planType: updatedPlan.type,
        isAvailable: updatedPlan.isAvailable,
        sellingPrice: updatedPlan.sellingPrice,
        previousSellingPrice: existingPlan.sellingPrice,
      },
    });
  } catch (error) {
    console.error(`Failed to update data plan ${req.params.planId}:`, error);
    next(error);
  }
};
