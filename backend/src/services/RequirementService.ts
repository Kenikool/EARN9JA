import {
  requirementTemplates,
  RequirementTemplate,
} from "../data/requirementTemplates.js";

export class RequirementService {
  /**
   * Get requirement suggestions based on category and platform
   */
  static getSuggestions(filters: {
    category?: string;
    platform?: string;
    popularOnly?: boolean;
    limit?: number;
  }): RequirementTemplate[] {
    let filtered = [...requirementTemplates];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(
        (req) => req.category === filters.category || req.category === "GENERAL"
      );
    }

    // Filter by platform
    if (filters.platform) {
      filtered = filtered.filter(
        (req) => !req.platform || req.platform === filters.platform
      );
    }

    // Filter by popularity
    if (filters.popularOnly) {
      filtered = filtered.filter((req) => req.popular);
    }

    // Sort by popularity and difficulty
    filtered.sort((a, b) => {
      if (a.popular !== b.popular) {
        return a.popular ? -1 : 1;
      }

      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    // Apply limit
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Get requirement by ID
   */
  static getRequirementById(id: string): RequirementTemplate | undefined {
    return requirementTemplates.find((req) => req.id === id);
  }

  /**
   * Get all categories
   */
  static getCategories(): string[] {
    const categories = new Set(requirementTemplates.map((req) => req.category));
    return Array.from(categories).filter((cat) => cat !== "GENERAL");
  }

  /**
   * Get platforms for a category
   */
  static getPlatformsForCategory(category: string): string[] {
    const platforms = new Set(
      requirementTemplates
        .filter((req) => req.category === category && req.platform)
        .map((req) => req.platform!)
    );
    return Array.from(platforms);
  }

  /**
   * Calculate difficulty impact
   */
  static calculateDifficultyImpact(requirements: string[]): {
    difficulty: "easy" | "medium" | "hard";
    score: number;
  } {
    let totalScore = 0;
    const difficultyScores = { easy: 1, medium: 2, hard: 3 };

    requirements.forEach((reqText) => {
      const template = requirementTemplates.find((t) => t.text === reqText);
      if (template) {
        totalScore += difficultyScores[template.difficulty];
      } else {
        // Unknown requirement, assume medium difficulty
        totalScore += 2;
      }
    });

    const avgScore = totalScore / Math.max(requirements.length, 1);

    let difficulty: "easy" | "medium" | "hard";
    if (avgScore <= 1.5) {
      difficulty = "easy";
    } else if (avgScore <= 2.5) {
      difficulty = "medium";
    } else {
      difficulty = "hard";
    }

    return { difficulty, score: totalScore };
  }

  /**
   * Suggest additional requirements
   */
  static suggestAdditionalRequirements(
    currentRequirements: string[],
    category: string,
    platform?: string
  ): RequirementTemplate[] {
    // Get all suggestions for category/platform
    const allSuggestions = this.getSuggestions({
      category,
      platform,
      popularOnly: false,
    });

    // Filter out requirements already added
    const suggestions = allSuggestions.filter(
      (suggestion) => !currentRequirements.includes(suggestion.text)
    );

    // Return top 5 suggestions
    return suggestions.slice(0, 5);
  }
}
