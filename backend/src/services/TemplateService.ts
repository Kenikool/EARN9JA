import { TaskTemplate, ITaskTemplate } from "../models/TaskTemplate.js";
import mongoose from "mongoose";

export class TemplateService {
  /**
   * Create a new template
   */
  static async createTemplate(
    templateData: Partial<ITaskTemplate>,
    userId?: string
  ): Promise<ITaskTemplate> {
    const template = new TaskTemplate({
      ...templateData,
      createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      usageCount: 0,
    });

    return template.save();
  }

  /**
   * Get all templates with optional filtering
   */
  static async getTemplates(filters: {
    category?: string;
    platform?: string;
    isOfficial?: boolean;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ templates: ITaskTemplate[]; total: number }> {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.platform) {
      query.platform = filters.platform;
    }

    if (filters.isOfficial !== undefined) {
      query.isOfficial = filters.isOfficial;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const limit = filters.limit || 50;
    const skip = filters.skip || 0;

    const [templates, total] = await Promise.all([
      TaskTemplate.find(query)
        .sort({ isOfficial: -1, usageCount: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      TaskTemplate.countDocuments(query),
    ]);

    return { templates: templates as any, total };
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(
    templateId: string
  ): Promise<ITaskTemplate | null> {
    return TaskTemplate.findById(templateId);
  }

  /**
   * Update template
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<ITaskTemplate>
  ): Promise<ITaskTemplate | null> {
    return TaskTemplate.findByIdAndUpdate(templateId, updates, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete template
   */
  static async deleteTemplate(templateId: string): Promise<boolean> {
    const result = await TaskTemplate.findByIdAndDelete(templateId);
    return !!result;
  }

  /**
   * Increment usage count
   */
  static async incrementUsage(templateId: string): Promise<void> {
    await TaskTemplate.findByIdAndUpdate(templateId, {
      $inc: { usageCount: 1 },
    });
  }

  /**
   * Apply template with variable replacement
   */
  static applyTemplate(
    template: ITaskTemplate,
    variables: Record<string, string>
  ): any {
    const { templateData } = template;

    // Replace variables in title
    let title = templateData.title;
    let description = templateData.description;
    let targetUrl = templateData.targetUrl || "";
    const requirements = [...templateData.requirements];

    // Replace variables
    if (templateData.variables) {
      templateData.variables.forEach((variable) => {
        const value = variables[variable] || `{${variable}}`;
        const regex = new RegExp(`\\{${variable}\\}`, "g");

        title = title.replace(regex, value);
        description = description.replace(regex, value);
        targetUrl = targetUrl.replace(regex, value);

        for (let i = 0; i < requirements.length; i++) {
          requirements[i] = requirements[i].replace(regex, value);
        }
      });
    }

    return {
      title,
      description,
      requirements,
      estimatedTime: templateData.estimatedTime,
      targetUrl: targetUrl || undefined,
      category: template.category,
      platform: template.platform,
      taskType: template.taskType,
    };
  }

  /**
   * Get popular templates
   */
  static async getPopularTemplates(
    limit: number = 10
  ): Promise<ITaskTemplate[]> {
    return TaskTemplate.find({ isOfficial: true })
      .sort({ usageCount: -1 })
      .limit(limit)
      .lean() as any;
  }
}
