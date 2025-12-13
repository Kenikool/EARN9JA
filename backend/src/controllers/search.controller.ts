import { Request, Response } from "express";
import SearchService from "../services/SearchService.js";

export class SearchController {
  async globalSearch(req: Request, res: Response) {
    try {
      const { q, type, page = 1, limit = 20 } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const results = await SearchService.search(
        q,
        type as string | undefined,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        message: "Search failed",
        error: error.message,
      });
    }
  }
}

export default new SearchController();
