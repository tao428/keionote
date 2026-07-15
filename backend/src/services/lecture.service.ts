import prisma from '../prisma';

export interface TimetableInput {
  lectureId: string;
  weekday: string;
  period: number;
  semester: string;
}

export class LectureService {
  // 全講義データの取得 (シラバス詳細検索に対応)
  static async listLectures(filters?: {
    year?: number;
    semester?: string;
    campus?: string;
    faculty?: string;
    department?: string;
    grade?: number;
    weekday?: string;
    period?: number;
    name?: string;
    teacher?: string;
    keywords?: string;
    language?: string;
    classStyle?: string;
    deliveryMethod?: string;
    activeLearning?: string;
  }) {
    const where: any = {};

    if (filters) {
      if (filters.year) where.year = Number(filters.year);
      if (filters.semester && filters.semester !== 'ALL') where.semester = filters.semester;
      if (filters.campus && filters.campus !== 'ALL') where.campus = filters.campus;
      if (filters.faculty && filters.faculty !== 'ALL') where.faculty = filters.faculty;
      if (filters.department) where.department = { contains: filters.department, mode: 'insensitive' };
      if (filters.grade) where.grade = Number(filters.grade);
      if (filters.weekday) where.weekday = filters.weekday;
      if (filters.period) where.period = Number(filters.period);
      if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' };
      if (filters.teacher) where.teacher = { contains: filters.teacher, mode: 'insensitive' };
      if (filters.language) where.language = filters.language;
      if (filters.classStyle) where.classStyle = filters.classStyle;
      if (filters.deliveryMethod) where.deliveryMethod = filters.deliveryMethod;
      
      if (filters.keywords) {
        where.OR = [
          { name: { contains: filters.keywords, mode: 'insensitive' } },
          { teacher: { contains: filters.keywords, mode: 'insensitive' } },
          { keywords: { contains: filters.keywords, mode: 'insensitive' } }
        ];
      }

      if (filters.activeLearning) {
        where.activeLearning = { contains: filters.activeLearning, mode: 'insensitive' };
      }
    }

    return prisma.lecture.findMany({
      where,
      include: {
        textbooks: {
          include: {
            items: {
              where: {
                status: 'AVAILABLE'
              }
            }
          }
        }
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
            textbooks: {
              include: {
                items: {
                  where: {
                    status: 'AVAILABLE'
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  // 講義を時間割に登録
  static async upsertTimetable(userId: string, input: TimetableInput) {
    // すでにその時限に登録されているコマがあるか、紐づくLectureの曜日時限から判定
    const existing = await prisma.timeTable.findFirst({
      where: {
        userId,
        lecture: {
          weekday: input.weekday,
          period: input.period,
          semester: input.semester
        }
      }
    });

    if (existing) {
      // 既存の時限のコマを今回の新しい講義に更新
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
        lectureId: input.lectureId
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
