import prisma from '../prisma';

export interface TimetableInput {
  lectureId: string;
  weekday: string;
  period: number;
  semester: string;
}

export class LectureService {
  // 全講義データの取得
  static async listLectures() {
    return prisma.lecture.findMany({
      include: {
        textbooks: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  // ユーザーの時間割取得
  static async getUserTimetable(userId: string) {
    return prisma.timeTable.findMany({
      where: {
        userId
      },
      include: {
        lecture: {
          include: {
            textbooks: true
          }
        }
      },
      orderBy: [
        { weekday: 'asc' },
        { period: 'asc' }
      ]
    });
  }

  // 講義を時間割に登録
  static async upsertTimetable(userId: string, input: TimetableInput) {
    // 既に同じ曜日・時限・学期に登録されているコマがあるか確認
    const existing = await prisma.timeTable.findFirst({
      where: {
        userId,
        weekday: input.weekday,
        period: input.period,
        semester: input.semester
      }
    });

    if (existing) {
      // 既存のコマを上書き更新
      return prisma.timeTable.update({
        where: { id: existing.id },
        data: {
          lectureId: input.lectureId
        },
        include: {
          lecture: true
        }
      });
    }

    // 新規登録
    return prisma.timeTable.create({
      data: {
        userId,
        lectureId: input.lectureId,
        weekday: input.weekday,
        period: input.period,
        semester: input.semester
      },
      include: {
        lecture: true
      }
    });
  }

  // 時間割から削除
  static async removeFromTimetable(userId: string, timetableId: string) {
    const record = await prisma.timeTable.findUnique({
      where: { id: timetableId }
    });

    if (!record) {
      throw new Error('Timetable slot not found');
    }

    if (record.userId !== userId) {
      throw new Error('Unauthorized to remove this slot');
    }

    return prisma.timeTable.delete({
      where: { id: timetableId }
    });
  }
}
