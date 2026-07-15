import { Request, Response, NextFunction } from 'express';
import { LectureService } from '../services/lecture.service';

export class LectureController {
  static async listLectures(req: Request, res: Response, next: NextFunction) {
    try {
      const lectures = await LectureService.listLectures();
      return res.status(200).json({ lectures });
    } catch (error) {
      next(error);
    }
  }

  static async getTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const timetable = await LectureService.getUserTimetable(userId);
      return res.status(200).json({ timetable });
    } catch (error) {
      next(error);
    }
  }

  static async upsertTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { lectureId, weekday, period, semester } = req.body;
      if (!lectureId || !weekday || !period || !semester) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const slot = await LectureService.upsertTimetable(userId, {
        lectureId,
        weekday,
        period: Number(period),
        semester
      });

      return res.status(200).json({
        message: 'Timetable updated successfully',
        slot
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await LectureService.removeFromTimetable(userId, id);
      return res.status(200).json({ message: 'Slot removed from timetable' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
