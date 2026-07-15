import prisma from '../prisma';
import { ItemStatus } from '@prisma/client';
import { CloudinaryService } from './cloudinary.service';

export interface CreateItemInput {
  title: string;
  description: string;
  price: number;
  condition: string;
  textbookId: string;
}

export class ItemService {
  // 商品一覧の取得 (各種フィルタ対応)
  static async listItems(filters: {
    faculty?: string;
    lectureId?: string;
    textbookId?: string;
    search?: string;
    sellerId?: string;
  }) {
    const where: any = {};

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
      where.status = {
        not: ItemStatus.DELETED
      };
    } else {
      where.status = ItemStatus.AVAILABLE;
    }

    if (filters.textbookId) {
      where.textbookId = filters.textbookId;
    } else if (filters.lectureId) {
      where.textbook = {
        lectureId: filters.lectureId
      };
    } else if (filters.faculty) {
      where.textbook = {
        lecture: {
          faculty: filters.faculty
        }
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        {
          textbook: {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { author: { contains: filters.search, mode: 'insensitive' } },
              {
                lecture: {
                  name: { contains: filters.search, mode: 'insensitive' }
                }
              }
            ]
          }
        }
      ];
    }

    return prisma.item.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            average_rating: true
          }
        },
        textbook: {
          include: {
            lecture: true
          }
        },
        images: {
          orderBy: {
            displayOrder: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // 商品詳細と統計情報の取得
  static async getItemById(itemId: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            average_rating: true,
            review_count: true
          }
        },
        textbook: {
          include: {
            lecture: true
          }
        },
        images: {
          orderBy: {
            displayOrder: 'asc'
          }
        }
      }
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // 閲覧数を増やす
    await prisma.item.update({
      where: { id: itemId },
      data: { viewCount: { increment: 1 } }
    });

    // 統計価格（平均値、中央値、最高値、最安値）の算出
    const soldItems = await prisma.item.findMany({
      where: {
        textbookId: item.textbookId,
        status: ItemStatus.SOLD
      },
      select: {
        price: true
      }
    });

    const prices = soldItems.map(si => si.price).sort((a, b) => a - b);
    
    let stats = {
      average: item.price,
      median: item.price,
      min: item.price,
      max: item.price,
      count: prices.length
    };

    if (prices.length > 0) {
      const sum = prices.reduce((acc, p) => acc + p, 0);
      const avg = Math.round(sum / prices.length);
      
      let median = 0;
      const mid = Math.floor(prices.length / 2);
      if (prices.length % 2 === 0) {
        median = Math.round((prices[mid - 1] + prices[mid]) / 2);
      } else {
        median = prices[mid];
      }

      stats = {
        average: avg,
        median: median,
        min: prices[0],
        max: prices[prices.length - 1],
        count: prices.length
      };
    }

    return {
      item,
      stats
    };
  }

  // 出品
  static async createItem(
    sellerId: string,
    input: CreateItemInput,
    fileBuffers: Buffer[]
  ) {
    const urls: string[] = [];

    // 画像のアップロード (最大10枚制限はコントローラー側でバリデーション)
    for (const buf of fileBuffers) {
      const url = await CloudinaryService.uploadImage(buf);
      urls.push(url);
    }

    // 出品作成
    const item = await prisma.item.create({
      data: {
        sellerId,
        textbookId: input.textbookId,
        title: input.title,
        description: input.description,
        price: Number(input.price),
        condition: input.condition,
        status: ItemStatus.AVAILABLE
      }
    });

    // 画像との紐付け
    if (urls.length > 0) {
      await prisma.itemImage.createMany({
        data: urls.map((url, index) => ({
          itemId: item.id,
          imageUrl: url,
          displayOrder: index
        }))
      });
    }

    return prisma.item.findUnique({
      where: { id: item.id },
      include: {
        images: true,
        textbook: true
      }
    });
  }

  // 出品情報の編集
  static async updateItem(sellerId: string, itemId: string, data: Partial<CreateItemInput> & { status?: ItemStatus }) {
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new Error('Item not found');
    }

    if (item.sellerId !== sellerId) {
      throw new Error('Unauthorized to edit this item');
    }

    return prisma.item.update({
      where: { id: itemId },
      data: {
        ...data,
        price: data.price ? Number(data.price) : undefined
      },
      include: {
        images: true
      }
    });
  }

  // 出品削除
  static async deleteItem(sellerId: string, itemId: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new Error('Item not found');
    }

    if (item.sellerId !== sellerId) {
      throw new Error('Unauthorized to delete this item');
    }

    return prisma.item.update({
      where: { id: itemId },
      data: {
        status: ItemStatus.DELETED
      }
    });
  }
}
