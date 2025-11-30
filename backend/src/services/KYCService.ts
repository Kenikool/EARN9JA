import { KYC } from "../models/KYC.js";
import { User } from "../models/User.js";

class KYCService {
  async submitKYC(userId: string, data: any) {
    try {
      // Check if KYC already exists
      const existingKYC = await KYC.findOne({ userId });

      if (existingKYC && existingKYC.status === "approved") {
        return {
          success: false,
          message: "KYC already verified",
        };
      }

      if (existingKYC && existingKYC.status === "pending") {
        return {
          success: false,
          message: "KYC verification is already pending",
        };
      }

      // Create or update KYC
      const kycData = {
        userId,
        verificationType: data.verificationType,
        identityNumber: data.identityNumber,
        documents: data.documents || {},
        verificationData: data.verificationData || {},
        status: "pending",
        submittedAt: new Date(),
      };

      let kyc;
      if (existingKYC) {
        kyc = await KYC.findByIdAndUpdate(existingKYC._id, kycData, {
          new: true,
        });
      } else {
        kyc = await KYC.create(kycData);
      }

      return {
        success: true,
        message: "KYC submitted successfully",
        kyc,
      };
    } catch (error) {
      console.error("Submit KYC error:", error);
      return {
        success: false,
        message: "Failed to submit KYC",
      };
    }
  }

  async getKYCStatus(userId: string) {
    try {
      const kyc = await KYC.findOne({ userId }).lean();

      if (!kyc) {
        return {
          success: true,
          status: "not_submitted",
          kyc: null,
        };
      }

      return {
        success: true,
        status: kyc.status,
        kyc,
      };
    } catch (error) {
      console.error("Get KYC status error:", error);
      return {
        success: false,
        message: "Failed to fetch KYC status",
      };
    }
  }

  async approveKYC(kycId: string, adminId: string) {
    try {
      const kyc = await KYC.findByIdAndUpdate(
        kycId,
        {
          status: "approved",
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
        { new: true }
      );

      if (!kyc) {
        return {
          success: false,
          message: "KYC not found",
        };
      }

      // Update user's KYC status
      await User.findByIdAndUpdate(kyc.userId, {
        isKYCVerified: true,
      });

      return {
        success: true,
        message: "KYC approved successfully",
        kyc,
      };
    } catch (error) {
      console.error("Approve KYC error:", error);
      return {
        success: false,
        message: "Failed to approve KYC",
      };
    }
  }

  async rejectKYC(kycId: string, adminId: string, reason: string) {
    try {
      const kyc = await KYC.findByIdAndUpdate(
        kycId,
        {
          status: "rejected",
          rejectionReason: reason,
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
        { new: true }
      );

      if (!kyc) {
        return {
          success: false,
          message: "KYC not found",
        };
      }

      return {
        success: true,
        message: "KYC rejected",
        kyc,
      };
    } catch (error) {
      console.error("Reject KYC error:", error);
      return {
        success: false,
        message: "Failed to reject KYC",
      };
    }
  }

  async getPendingKYCs(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const kycs = await KYC.find({ status: "pending" })
        .populate("userId", "email phoneNumber profile")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await KYC.countDocuments({ status: "pending" });

      return {
        success: true,
        kycs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get pending KYCs error:", error);
      return {
        success: false,
        message: "Failed to fetch pending KYCs",
      };
    }
  }
}

export const kycService = new KYCService();
