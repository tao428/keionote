import { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services/item.service';
import multer from 'multer';

// Multer設定 (最大10枚、各5MB制限)
const storage = multer.memoryStorage();
export const uploadImagesMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // 最大10枚
  }
}).array('images', 10);

export class ItemController {
  static async listItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { faculty, lectureId, textbookId, search, sellerId } = req.query;
      
      const items = await ItemService.listItems({
        faculty: faculty as string,
        lectureId: lectureId as string,
        textbookId: textbookId as string,
        search: search as string,
        sellerId: sellerId as string
      });

      return res.status(200).json({ items });
    } catch (error) {
      next(error);
    }
  }

  static async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ItemService.getItemById(id);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user?.userId;
      if (!sellerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, description, price, condition, textbookId } = req.body;
      if (!title || !price || !condition || !textbookId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const fileBuffers = files.map(file => file.buffer);

      const item = await ItemService.createItem(
        sellerId,
        { title, description, price: Number(price), condition, textbookId },
        fileBuffers
      );

      return res.status(201).json({
        message: 'Item created successfully',
        item
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user?.userId;
      const { id } = req.params;
      if (!sellerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const item = await ItemService.updateItem(sellerId, id, req.body);
      return res.status(200).json({
        message: 'Item updated successfully',
        item
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user?.userId;
      const { id } = req.params;
      if (!sellerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await ItemService.deleteItem(sellerId, id);
      return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
