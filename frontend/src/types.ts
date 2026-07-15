export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  faculty: string;
  department: string;
  grade: number;
  average_rating: number;
  review_count: number;
  transaction_count: number;
}

export interface Lecture {
  id: string;
  name: string;
  teacher: string;
  faculty: string;
  department: string;
  textbooks?: Textbook[];
}

export interface Textbook {
  id: string;
  lectureId: string;
  title: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  lecture?: Lecture;
}

export interface ItemImage {
  id: string;
  itemId: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Item {
  id: string;
  sellerId: string;
  textbookId: string;
  title: string;
  description: string;
  price: number;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'USED';
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN' | 'DELETED';
  viewCount: number;
  createdAt: string;
  seller: {
    id: string;
    nickname: string;
    average_rating: number;
    review_count?: number;
  };
  textbook: Textbook;
  images: ItemImage[];
}

export interface TimetableSlot {
  id: string;
  userId: string;
  lectureId: string;
  weekday: string;
  period: number;
  semester: string;
  lecture: Lecture;
}

export interface PriceStats {
  average: number;
  median: number;
  min: number;
  max: number;
  count: number;
}
