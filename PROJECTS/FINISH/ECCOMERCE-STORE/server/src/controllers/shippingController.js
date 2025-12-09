import Shipping from "../models/Shipping.js";

// @desc    Get all shipping methods
// @route   GET /api/shipping or GET /api/admin/shipping
// @access  Public or Private/Admin
export const getShippingMethods = async (req, res) => {
  try {
    const { country, region } = req.query;

    // If accessed via admin route, show all methods (not just active)
    const isAdminRoute = req.baseUrl.includes('/admin');
    const filter = isAdminRoute ? {} : { isActive: true };

    if (country && !isAdminRoute) {
      filter.$or = [
        { countries: country },
        { countries: { $size: 0 } }, // Available for all countries
      ];
    }

    if (region && !isAdminRoute) {
      filter.$or = [
        { regions: region },
        { regions: { $size: 0 } }, // Available for all regions
      ];
    }

    const shippingMethods = await Shipping.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { 
        methods: shippingMethods,
        shippingMethods // Keep for backward compatibility
      },
    });
  } catch (error) {
    console.error("Get shipping methods error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch shipping methods",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get shipping method by ID
// @route   GET /api/shipping/:id
// @access  Public
export const getShippingMethodById = async (req, res) => {
  try {
    const shippingMethod = await Shipping.findById(req.params.id);

    if (!shippingMethod) {
      return res.status(404).json({
        status: "error",
        message: "Shipping method not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { shippingMethod },
    });
  } catch (error) {
    console.error("Get shipping method error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch shipping method",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create shipping method (Admin)
// @route   POST /api/shipping
// @access  Private/Admin
export const createShippingMethod = async (req, res) => {
  try {
    const {
      name,
      description,
      zones,
      estimatedDays,
      isActive,
    } = req.body;

    // Validation
    if (!name || !estimatedDays) {
      return res.status(400).json({
        status: "error",
        message: "Name and estimatedDays are required",
      });
    }

    const shippingMethod = await Shipping.create({
      name,
      description,
      zones: zones || [],
      estimatedDays,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      status: "success",
      message: "Shipping method created successfully",
      data: { shippingMethod },
    });
  } catch (error) {
    console.error("Create shipping method error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create shipping method",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update shipping method (Admin)
// @route   PUT /api/shipping/:id
// @access  Private/Admin
export const updateShippingMethod = async (req, res) => {
  try {
    const shippingMethod = await Shipping.findById(req.params.id);

    if (!shippingMethod) {
      return res.status(404).json({
        status: "error",
        message: "Shipping method not found",
      });
    }

    const {
      name,
      description,
      zones,
      estimatedDays,
      isActive,
    } = req.body;

    if (name !== undefined) shippingMethod.name = name;
    if (description !== undefined) shippingMethod.description = description;
    if (zones !== undefined) shippingMethod.zones = zones;
    if (estimatedDays !== undefined)
      shippingMethod.estimatedDays = estimatedDays;
    if (isActive !== undefined) shippingMethod.isActive = isActive;

    const updatedShippingMethod = await shippingMethod.save();

    res.status(200).json({
      status: "success",
      message: "Shipping method updated successfully",
      data: { shippingMethod: updatedShippingMethod },
    });
  } catch (error) {
    console.error("Update shipping method error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update shipping method",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete shipping method (Admin)
// @route   DELETE /api/shipping/:id
// @access  Private/Admin
export const deleteShippingMethod = async (req, res) => {
  try {
    const shippingMethod = await Shipping.findById(req.params.id);

    if (!shippingMethod) {
      return res.status(404).json({
        status: "error",
        message: "Shipping method not found",
      });
    }

    await shippingMethod.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Shipping method deleted successfully",
    });
  } catch (error) {
    console.error("Delete shipping method error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete shipping method",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Calculate shipping cost
// @route   POST /api/shipping/calculate
// @access  Public
export const calculateShippingCost = async (req, res) => {
  try {
    const { shippingMethodId, country, region, weight } = req.body;

    if (!shippingMethodId) {
      return res.status(400).json({
        status: "error",
        message: "Shipping method ID is required",
      });
    }

    const shippingMethod = await Shipping.findById(shippingMethodId);

    if (!shippingMethod || !shippingMethod.isActive) {
      return res.status(404).json({
        status: "error",
        message: "Shipping method not found or inactive",
      });
    }

    // Check if shipping method is available for the country/region
    if (country && shippingMethod.countries.length > 0) {
      if (!shippingMethod.countries.includes(country)) {
        return res.status(400).json({
          status: "error",
          message: "Shipping method not available for this country",
        });
      }
    }

    if (region && shippingMethod.regions.length > 0) {
      if (!shippingMethod.regions.includes(region)) {
        return res.status(400).json({
          status: "error",
          message: "Shipping method not available for this region",
        });
      }
    }

    // Find matching zone for the country/region
    let matchingZone = null;
    if (shippingMethod.zones && shippingMethod.zones.length > 0) {
      if (country) {
        matchingZone = shippingMethod.zones.find(zone => 
          zone.countries.includes(country) || zone.countries.length === 0
        );
      }
      // If no match found, use first zone as default
      if (!matchingZone) {
        matchingZone = shippingMethod.zones[0];
      }
    }

    if (!matchingZone) {
      return res.status(400).json({
        status: "error",
        message: "No shipping zones configured for this method",
      });
    }

    // Calculate cost based on zone rates
    let cost = matchingZone.baseRate;

    // Add weight-based pricing
    if (weight && weight > 0) {
      cost += weight * matchingZone.perKgRate;
    }

    res.status(200).json({
      status: "success",
      data: {
        shippingMethod: {
          id: shippingMethod._id,
          name: shippingMethod.name,
          estimatedDays: shippingMethod.estimatedDays,
        },
        cost,
        zone: {
          baseRate: matchingZone.baseRate,
          perKgRate: matchingZone.perKgRate,
        },
      },
    });
  } catch (error) {
    console.error("Calculate shipping cost error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to calculate shipping cost",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
