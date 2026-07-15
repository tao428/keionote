import { Router } from 'express';
import { LectureController } from '../controllers/lecture.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, LectureController.listLectures);
router.get('/timetable', authenticateToken, LectureController.getTimetable);
router.post('/timetable', authenticateToken, LectureController.upsertTimetable);
router.delete('/timetable/:id', authenticateToken, LectureController.removeTimetable);

export default router;
export {};
