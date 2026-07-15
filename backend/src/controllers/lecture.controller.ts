import { Request, Response, NextFunction } from 'express';
import { LectureService } from '../services/lecture.service';

export class LectureController {
  static async listLectures(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        year, semester, campus, faculty, department, grade,
        weekday, period, name, teacher, keywords, language,
        classStyle, deliveryMethod, activeLearning
      } = req.query;

      const lectures = await LectureService.listLectures({
        year: year ? Number(year) : undefined,
        semester: semester as string,
        campus: campus as string,
        faculty: faculty as string,
        department: department as string,
        grade: grade ? Number(grade) : undefined,
        weekday: weekday as string,
        period: period ? Number(period) : undefined,
        name: name as string,
        teacher: teacher as string,
        keywords: keywords as string,
        language: language as string,
        classStyle: classStyle as string,
        deliveryMethod: deliveryMethod as string,
        activeLearning: activeLearning as string
      });
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
