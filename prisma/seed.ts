import { PrismaClient, UserRole, ItemStatus, TransactionStatus, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// 疑似乱数生成器 (シード値固定)
function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
}
const random = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, 1);

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Checking database state...');
  
  // 重複投入防止チェック
  const lectureCount = await prisma.lecture.count();
  if (lectureCount > 0) {
    console.log('Seed data already exists. Skipping seed process.');
    return;
  }

  console.log('Clearing old data (if any)...');
  await prisma.report.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.itemImage.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.textbook.deleteMany({});
  await prisma.timeTable.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.pickupLocation.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Generating optimized demo data for Free plan...');

  // 1. 固定ユーザー
  const demoUser = await prisma.user.create({
    data: {
      id: 'demo-user',
      email: 'demo@keio.jp',
      nickname: 'Demo User',
      role: UserRole.USER,
      faculty: '理工学部',
      department: '情報工学科',
      grade: 3,
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user',
      email: 'admin.note@keio.jp',
      nickname: '管理者ノート',
      role: UserRole.ADMIN,
      faculty: 'システム運営',
      department: '運営事務局',
      grade: 4,
    }
  });

  // 2. 受け渡し場所
  const locationsData = [
    { campus: 'HIYOSHI', name: '銀杏並木入口', description: '並木前の大きな横断歩道付近' },
    { campus: 'HIYOSHI', name: 'グリーンハウス前', description: '食堂棟1階の自動ドア前' },
    { campus: 'MITA', name: '山食（食堂）前', description: '西校舎地下の山食入口' },
    { campus: 'YAGAMI', name: '創想館2階ロビー', description: 'メインエントランス付近' },
    { campus: 'SFC', name: 'メディアセンター入口', description: '図書館入口の自動ドア付近' }
  ];

  const dbLocations = [];
  for (const loc of locationsData) {
    const dbLoc = await prisma.pickupLocation.create({ data: loc });
    dbLocations.push(dbLoc);
  }

  // 3. ユーザーの生成 (計30名)
  const firstNames = ['健太', '大輔', '翔', '拓也', '美咲', '葵', 'さくら', '優花', '陽菜', '結衣', '陸', '颯太', '春斗', '芽衣', '莉子'];
  const lastNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田'];
  const faculties = [
    { faculty: '理工学部', depts: ['情報工学科', '物理情報工学科', '管理工学科'] },
    { faculty: '経済学部', depts: ['経済学科'] },
    { faculty: '商学部', depts: ['商学科'] },
    { faculty: '法学部', depts: ['法律学科', '政治学科'] },
    { faculty: '文学部', depts: ['人文社会学科'] },
    { faculty: '環境情報学部', depts: ['環境情報学科'] }
  ];

  const dbUsers = [demoUser, adminUser];
  for (let i = 1; i <= 28; i++) {
    const lastName = getRandomElement(lastNames);
    const firstName = getRandomElement(firstNames);
    const fac = getRandomElement(faculties);
    const dept = getRandomElement(fac.depts);
    const email = `student_${i}@keio.jp`;
    
    const user = await prisma.user.create({
      data: {
        email,
        nickname: `${lastName} ${firstName}`,
        faculty: fac.faculty,
        department: dept,
        grade: getRandomInt(1, 4),
        average_rating: parseFloat((4.2 + random() * 0.8).toFixed(1)),
        review_count: getRandomInt(1, 5),
        transaction_count: getRandomInt(2, 8)
      }
    });
    dbUsers.push(user);
  }
  console.log(`Created ${dbUsers.length} users.`);

  // 4. 講義データの生成 (計120件)
  const lecturePrefixes = [
    '微分積分学', '線形代数学', 'アルゴリズムとデータ構造', 'ミクロ経済学', 'マクロ経済学', 
    '統計学概論', '憲法', '民法第一部', '経営学基礎', 'マーケティング論', '情報処理の基礎', 
    'パターンランゲージ', 'デザイン思考', '社会学概論', '健康科学'
  ];
  const lectureSuffixes = ['Ⅰ', 'Ⅱ', '基礎', '演習', '概論', '中級'];
  const teacherNames = ['福澤 諭吉', '柴三郎 慶応', '慶應 義塾', '日吉 三田', '矢上 藤沢', '綱町 礼二'];
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const dbLectures = [];
  for (let i = 0; i < 120; i++) {
    const baseName = getRandomElement(lecturePrefixes) + ' ' + getRandomElement(lectureSuffixes);
    const fac = getRandomElement(faculties);
    const dept = getRandomElement(fac.depts);
    const teacher = getRandomElement(teacherNames) + ' 教授';
    const campus = fac.faculty === '環境情報学部' ? 'SFC' : 
                   fac.faculty === '理工学部' ? 'YAGAMI' :
                   getRandomElement(['HIYOSHI', 'MITA']);
    
    const lecture = await prisma.lecture.create({
      data: {
        name: baseName,
        teacher,
        year: 2026,
        semester: getRandomElement(['SPRING', 'AUTUMN']),
        campus,
        faculty: fac.faculty,
        department: dept,
        grade: getRandomInt(1, 3),
        weekday: getRandomElement(weekdays),
        period: getRandomInt(1, 5),
        keywords: `${baseName}, ${fac.faculty}, シラバス, 教科書`,
        language: 'JAPANESE',
        classStyle: 'LECTURE',
        deliveryMethod: 'FACE_TO_FACE'
      }
    });
    dbLectures.push(lecture);
  }
  console.log(`Created ${dbLectures.length} lectures.`);

  // 5. 教科書の生成 (計240冊、1講義あたり平均2冊)
  const publishers = ['裳華房', 'サイエンス社', '有斐閣', '日本評論社', '慶應義塾大学出版会', '岩波書店'];
  const authors = ['佐藤 健', '高橋 礼治', '田中 洋介', '渡辺 順二', '福澤 信吾'];

  const dbTextbooks = [];
  for (const lec of dbLectures) {
    const bookCount = getRandomInt(1, 2);
    for (let b = 0; b < bookCount; b++) {
      const title = `${lec.name.replace(/ Ⅰ| Ⅱ| 基礎| 演習| 概論| 中級/g, '')} 指定テキスト (${b + 1})`;
      const author = getRandomElement(authors);
      const publisher = getRandomElement(publishers);
      const isbn = `9784` + getRandomInt(100000000, 999999999).toString();
      
      const textbook = await prisma.textbook.create({
        data: {
          lectureId: lec.id,
          title,
          author,
          publisher,
          isbn,
          edition: `第${getRandomInt(1, 3)}版`
        }
      });
      dbTextbooks.push(textbook);
    }
  }
  console.log(`Created ${dbTextbooks.length} textbooks.`);

  // 6. 出品（Item）の生成 (計420件)
  const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'USED'];
  const dummyImages = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400'
  ];
  const prices = [300, 500, 800, 1000, 1200, 1500, 2000];

  const dbItems = [];
  for (let i = 0; i < 420; i++) {
    const textbook = getRandomElement(dbTextbooks);
    const seller = getRandomElement(dbUsers);
    const cond = getRandomElement(conditions);
    const price = getRandomElement(prices);
    
    const item = await prisma.item.create({
      data: {
        sellerId: seller.id,
        textbookId: textbook.id,
        title: `『${textbook.title}』 中古本`,
        description: `講義で使用しました。${cond === 'USED' ? '書き込みが少しありますが、読むのには全く問題ありません。' : '非常に綺麗な状態です。'}学内手渡し希望です。`,
        price,
        condition: cond,
        status: i < 350 ? ItemStatus.AVAILABLE : i < 400 ? ItemStatus.SOLD : ItemStatus.RESERVED,
        viewCount: getRandomInt(3, 100),
        favoriteCount: getRandomInt(0, 15)
      }
    });

    await prisma.itemImage.create({
      data: {
        itemId: item.id,
        imageUrl: getRandomElement(dummyImages),
        displayOrder: 0
      }
    });
    dbItems.push(item);
  }
  console.log(`Created ${dbItems.length} items.`);

  // 7. 取引 & チャット (計40件)
  const soldItems = dbItems.filter(item => item.status === ItemStatus.SOLD).slice(0, 40);
  const dbTransactions = [];

  for (let t = 0; t < soldItems.length; t++) {
    const item = soldItems[t];
    const buyer = getRandomElement(dbUsers.filter(u => u.id !== item.sellerId));
    const loc = getRandomElement(dbLocations);
    const isCompleted = t < 30;

    const transaction = await prisma.transaction.create({
      data: {
        itemId: item.id,
        sellerId: item.sellerId,
        buyerId: buyer.id,
        pickupLocationId: loc.id,
        pickupTime: new Date(Date.now() - getRandomInt(1, 10) * 24 * 60 * 60 * 1000),
        status: isCompleted ? TransactionStatus.COMPLETED : TransactionStatus.ACCEPTED,
        completedAt: isCompleted ? new Date() : null
      }
    });
    dbTransactions.push(transaction);

    // チャット作成
    const chat = await prisma.chat.create({
      data: { transactionId: transaction.id }
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: transaction.buyerId,
        message: 'はじめまして。購入希望です！',
        isRead: true
      }
    });
  }
  console.log(`Created ${dbTransactions.length} transactions.`);

  // 8. レビュー (計60件)
  let revCount = 0;
  const completedTransactions = dbTransactions.filter(tx => tx.status === TransactionStatus.COMPLETED);
  for (const tx of completedTransactions) {
    await prisma.review.create({
      data: {
        transactionId: tx.id,
        reviewerId: tx.buyerId,
        reviewedUserId: tx.sellerId,
        rating: getRandomElement([4, 5, 5]),
        comment: 'スムーズにお取引ができました。ありがとうございます！'
      }
    });
    revCount++;
  }
  console.log(`Created ${revCount} reviews.`);

  // デモ用の時間割登録
  const demoUserLectures = dbLectures.filter(l => l.faculty === '理工学部' && l.grade === 3).slice(0, 4);
  for (const lec of demoUserLectures) {
    try {
      await prisma.timeTable.create({
        data: {
          userId: demoUser.id,
          lectureId: lec.id
        }
      });
    } catch (e) {
      // ignore
    }
  }
  console.log('Registered demo user timetable.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
