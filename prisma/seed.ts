import { PrismaClient, UserRole, ItemStatus, TransactionStatus, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// 疑似乱数生成器 (シード値固定で毎回同じデータを生成)
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
  console.log('Clearing database...');
  // 依存関係順に削除
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

  console.log('Seeding massive demo data...');

  // 1. 固定ユーザー & デモユーザー
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
  const campuses = ['HIYOSHI', 'MITA', 'YAGAMI', 'SFC', 'SHINANOMACHI', 'SHIBA'];
  const locationsData = [
    { campus: 'HIYOSHI', name: '銀杏並木入口', description: '並木前の大きな横断歩道付近' },
    { campus: 'HIYOSHI', name: 'グリーンハウス（食堂）前', description: '食堂棟1階の自動ドア前' },
    { campus: 'HIYOSHI', name: '協生館1Fアトリウム', description: 'タリーズコーヒー付近のソファ' },
    { campus: 'MITA', name: '山食（食堂）前', description: '西校舎地下の山食入口' },
    { campus: 'MITA', name: '演説館前の中庭', description: '福澤先生像の近くの屋外ベンチ' },
    { campus: 'YAGAMI', name: '創想館2階ロビー', description: 'メインエントランス付近' },
    { campus: 'YAGAMI', name: '14棟フォーラム', description: '食堂前のテラスエリア' },
    { campus: 'SFC', name: 'Ω館（オメガ）正面', description: '大講義棟の階段下' },
    { campus: 'SFC', name: 'メディアセンター入口', description: '図書館入口の自動ドア付近' },
    { campus: 'SHINANOMACHI', name: '孝養舎ロビー', description: '医学部・看護学科エリアの孝養舎入口' },
    { campus: 'SHIBA', name: '薬学部マルチメディア講堂前', description: '芝共立キャンパス1号館1階' }
  ];

  const dbLocations = [];
  for (const loc of locationsData) {
    const dbLoc = await prisma.pickupLocation.create({ data: loc });
    dbLocations.push(dbLoc);
  }

  // 3. ユーザーの生成 (計80名)
  const firstNames = ['健太', '大輔', '翔', '拓也', '翔太', '美咲', '葵', 'さくら', '優花', '陽菜', '結衣', '真央', '陸', '颯太', '春斗', '芽衣', '莉子', '詩織'];
  const lastNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '山口', '斎藤', '松本', '井上', '木村'];
  const faculties = [
    { faculty: '理工学部', depts: ['情報工学科', '物理情報工学科', '管理工学科', '機械工学科', 'システムデザイン工学科', '応用化学科'] },
    { faculty: '経済学部', depts: ['経済学科'] },
    { faculty: '商学部', depts: ['商学科'] },
    { faculty: '法学部', depts: ['法律学科', '政治学科'] },
    { faculty: '文学部', depts: ['人文社会学科'] },
    { faculty: '医学部', depts: ['医学科'] },
    { faculty: '薬学部', depts: ['薬学科', '薬科学科'] },
    { faculty: '看護医療学部', depts: ['看護学科'] },
    { faculty: '環境情報学部', depts: ['環境情報学科'] },
    { faculty: '総合政策学部', depts: ['総合政策学科'] }
  ];

  const dbUsers = [demoUser, adminUser];
  for (let i = 1; i <= 78; i++) {
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
        average_rating: parseFloat((4.0 + random() * 1.0).toFixed(1)),
        review_count: getRandomInt(2, 12),
        transaction_count: getRandomInt(5, 20)
      }
    });
    dbUsers.push(user);
  }
  console.log(`Created ${dbUsers.length} users.`);

  // 4. 講義データの生成 (計420件)
  const lecturePrefixes = [
    '微分積分学', '線形代数学', 'アルゴリズムとデータ構造', 'ミクロ経済学', 'マクロ経済学', '統計解析', 
    '憲法', '民法総則', '刑法総論', 'マーケティング論', '会計学基礎', '心理学入門', '哲学概論', 
    '有機化学', '量子力学', '情報処理の基礎', 'パターンランゲージ', 'デザイン思考', '認知科学', 
    '医療コミュニケーション', '薬理学概論', '生化学', '人間科学', '社会学入門', 'オペレーションズリサーチ'
  ];
  
  const lectureSuffixes = ['Ⅰ', 'Ⅱ', 'A', 'B', '基礎', '演習', '概論', '中級', '上級', '特論'];
  const teacherNames = ['福澤 諭吉', '柴三郎 慶応', '慶應 義塾', '日吉 三田', '矢上 藤沢', '信濃 薬学', '日吉 太郎', '三田 花子', '綱町 礼二', '芝共 薬子'];
  const semesters = ['SPRING', 'AUTUMN', 'FULL_YEAR'];
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const dbLectures = [];
  for (let i = 0; i < 420; i++) {
    const baseName = getRandomElement(lecturePrefixes) + ' ' + getRandomElement(lectureSuffixes);
    const fac = getRandomElement(faculties);
    const dept = getRandomElement(fac.depts);
    const teacher = getRandomElement(teacherNames) + ' 教授';
    const campus = fac.faculty === '環境情報学部' || fac.faculty === '総合政策学部' ? 'SFC' : 
                   fac.faculty === '理工学部' ? 'YAGAMI' :
                   fac.faculty === '薬学部' ? 'SHIBA' :
                   fac.faculty === '医学部' || fac.faculty === '看護医療学部' ? 'SHINANOMACHI' :
                   getRandomElement(['HIYOSHI', 'MITA']); // 他は日吉・三田に分散
    
    const lecture = await prisma.lecture.create({
      data: {
        name: baseName,
        teacher,
        year: 2026,
        semester: getRandomElement(semesters),
        campus,
        faculty: fac.faculty,
        department: dept,
        grade: getRandomInt(1, 4),
        weekday: getRandomElement(weekdays),
        period: getRandomInt(1, 6),
        keywords: `${baseName}, ${fac.faculty}, ${dept}, シラバス, 教科書`,
        language: getRandomElement(['JAPANESE', 'JAPANESE', 'ENGLISH']), // 日本語率高め
        classStyle: getRandomElement(['LECTURE', 'LECTURE', 'SEMINAR', 'PBL']),
        deliveryMethod: getRandomElement(['FACE_TO_FACE', 'FACE_TO_FACE', 'ONLINE_REALTIME', 'ONLINE_ONDEMAND'])
      }
    });
    dbLectures.push(lecture);
  }
  console.log(`Created ${dbLectures.length} lectures.`);

  // 5. 教科書の生成 (計820冊)
  const textbookAdjectives = ['標準', '図解', 'はじめての', '新体系', 'ステップアップ', 'よくわかる', '実践', '基礎から学ぶ', 'コア講義', '大学1年生の'];
  const textbookSubjects = ['微積分', '線形代数', 'C言語プログラミング', 'Python入門', 'ミクロ経済', 'マクロ経済', '日本国憲法', '刑法総論', 'マーケティング', '会計学', '臨床薬理学', '看護技術', '認知プロセス'];
  const textbookSuffixes = ['テキスト', '講義', '入門', 'ハンドブック', '演習ドリル', 'ガイドブック', 'ワークブック'];
  const publishers = ['裳華房', 'サイエンス社', '有斐閣', '日本評論社', '慶應義塾大学出版会', '朝倉書店', '東京大学出版会', '丸善出版', '培風館'];
  const authors = ['佐藤 健', '鈴木 一郎', '高橋 礼治', '田中 洋介', '渡辺 順二', '福澤 信吾', '三田 慶介', 'SFC 崇'];

  const dbTextbooks = [];
  for (const lec of dbLectures) {
    // 1つの講義に1〜3冊
    const bookCount = getRandomInt(1, 2);
    for (let b = 0; b < bookCount; b++) {
      const title = `${getRandomElement(textbookAdjectives)}${getRandomElement(textbookSubjects)}${getRandomElement(textbookSuffixes)}`;
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
          edition: `第${getRandomInt(1, 4)}版`
        }
      });
      dbTextbooks.push(textbook);
    }
  }
  console.log(`Created ${dbTextbooks.length} textbooks.`);

  // 6. 出品（Item）の生成 (計1520件)
  const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'USED'];
  const dummyImages = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'
  ];
  
  const prices = [300, 500, 800, 1000, 1200, 1500, 1800, 2000, 2500];

  const dbItems = [];
  for (let i = 0; i < 1520; i++) {
    const textbook = getRandomElement(dbTextbooks);
    const seller = getRandomElement(dbUsers);
    const cond = getRandomElement(conditions);
    const price = getRandomElement(prices);
    
    const item = await prisma.item.create({
      data: {
        sellerId: seller.id,
        textbookId: textbook.id,
        title: `『${textbook.title}』 ${cond === 'NEW' ? '新品同様' : cond === 'LIKE_NEW' ? '超美品' : cond === 'GOOD' ? '書き込みなし' : 'やや傷あり'}`,
        description: `昨年度の講義で使用しました。${cond === 'USED' ? '中にマーカーや鉛筆でのメモが数ページありますが、授業を受けるには支障ありません。' : '非常にきれいな状態で、折れや汚れもありません。'}日吉または矢上キャンパスでの手渡し希望です。`,
        price,
        condition: cond,
        status: i < 1200 ? ItemStatus.AVAILABLE : i < 1400 ? ItemStatus.SOLD : ItemStatus.RESERVED,
        viewCount: getRandomInt(5, 200),
        favoriteCount: getRandomInt(0, 48)
      }
    });

    // 1つのItemに1〜2枚の画像
    const imgCount = getRandomInt(1, 2);
    for (let img = 0; img < imgCount; img++) {
      await prisma.itemImage.create({
        data: {
          itemId: item.id,
          imageUrl: getRandomElement(dummyImages),
          displayOrder: img
        }
      });
    }
    dbItems.push(item);
  }
  console.log(`Created ${dbItems.length} items.`);

  // 7. 取引 (Transaction) (計160件)
  // SOLD のアイテムに紐づく取引を作成する
  const soldItems = dbItems.filter(item => item.status === ItemStatus.SOLD).slice(0, 160);
  const dbTransactions = [];

  for (let t = 0; t < soldItems.length; t++) {
    const item = soldItems[t];
    const buyer = getRandomElement(dbUsers.filter(u => u.id !== item.sellerId));
    const loc = getRandomElement(dbLocations);
    const isCompleted = t < 120; // 120件は完了、40件は進行中やキャンセル

    const transaction = await prisma.transaction.create({
      data: {
        itemId: item.id,
        sellerId: item.sellerId,
        buyerId: buyer.id,
        pickupLocationId: loc.id,
        pickupTime: new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000),
        status: isCompleted ? TransactionStatus.COMPLETED : TransactionStatus.ACCEPTED,
        completedAt: isCompleted ? new Date() : null
      }
    });
    dbTransactions.push(transaction);
  }
  console.log(`Created ${dbTransactions.length} transactions.`);

  // 8. チャットルーム & メッセージ (計550件)
  let messageCount = 0;
  const chatMessagesPool = [
    'はじめまして！購入させていただきました。',
    'ご連絡ありがとうございます。受け渡しについて調整させてください。',
    '今週の木曜日の昼休み（12:15〜13:00）に日吉キャンパスの銀杏並木前でいかがでしょうか？',
    'そちらで大丈夫です！当日よろしくお願いいたします。',
    '承知いたしました。到着しましたらこちらで連絡します。',
    '今並木の入口付近のベンチに到着しました。青いリュックを背負っています。',
    '今向かっています。あと2分ほどで着きます！',
    '無事に受け取れました。ありがとうございました！',
    'こちらこそ、スムーズな取引をありがとうございました！評価させていただきました。'
  ];

  for (let t = 0; t < dbTransactions.length; t++) {
    const tx = dbTransactions[t];
    const chat = await prisma.chat.create({
      data: {
        transactionId: tx.id
      }
    });

    // 1チャットにつき3〜5通のメッセージ
    const msgCount = getRandomInt(3, 5);
    for (let m = 0; m < msgCount; m++) {
      const isSeller = m % 2 === 0;
      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: isSeller ? tx.sellerId : tx.buyerId,
          message: chatMessagesPool[m % chatMessagesPool.length],
          isRead: true
        }
      });
      messageCount++;
    }
  }
  console.log(`Created ${dbTransactions.length} chats with ${messageCount} messages.`);

  // 9. レビュー (計520件)
  let reviewCount = 0;
  const reviewComments = [
    '非常に丁寧に対応していただきました！教科書も新品同様で大満足です。',
    'スムーズに受け取りができました。ありがとうございました。',
    '事前のメッセージの返信が早くて助かりました。また機会があればお願いします。',
    '教科書の状態が記載より良くて嬉しかったです！大切に使います。',
    '待ち合わせ場所にすぐ現れてくださり、スムーズな手渡しができました。'
  ];

  const completedTransactions = dbTransactions.filter(tx => tx.status === TransactionStatus.COMPLETED);
  for (const tx of completedTransactions) {
    // 買主から売主へのレビュー
    await prisma.review.create({
      data: {
        transactionId: tx.id,
        reviewerId: tx.buyerId,
        reviewedUserId: tx.sellerId,
        rating: getRandomElement([4, 5, 5, 5]), // 4か5が多め
        comment: getRandomElement(reviewComments)
      }
    });
    reviewCount++;

    // 売主から買主へのレビュー
    await prisma.review.create({
      data: {
        transactionId: tx.id,
        reviewerId: tx.sellerId,
        reviewedUserId: tx.buyerId,
        rating: getRandomElement([4, 5, 5, 5]),
        comment: '親切な購入者様で、安心して取引が完了できました。'
      }
    });
    reviewCount++;
  }
  console.log(`Created ${reviewCount} reviews.`);

  // 10. お気に入り (計1020件)
  let favoriteCount = 0;
  const usersForFavorites = dbUsers.slice(0, 50); // 一部のユーザーでお気に入りを多めに生成
  const availableItems = dbItems.filter(item => item.status === ItemStatus.AVAILABLE);

  for (const user of usersForFavorites) {
    const favCount = getRandomInt(15, 25);
    const selectedItems = new Set<string>();
    
    while (selectedItems.size < favCount && availableItems.length > 0) {
      selectedItems.add(getRandomElement(availableItems).id);
    }

    for (const itemId of selectedItems) {
      try {
        await prisma.favorite.create({
          data: {
            userId: user.id,
            itemId
          }
        });
        favoriteCount++;
      } catch (e) {
        // 重複はスキップ
      }
    }
  }
  console.log(`Created ${favoriteCount} favorites.`);

  // 11. 通知 (計510件)
  let notifCount = 0;
  const notifTitles = [
    { title: '購入申請が届きました', type: NotificationType.INQUIRY, content: 'あなたが出品した教科書に購入希望の申請が届いています。' },
    { title: '新しいメッセージを受信しました', type: NotificationType.MESSAGE, content: '取引チャットで新しいメッセージが送信されました。確認してください。' },
    { title: '取引状態が更新されました', type: NotificationType.STATUS_CHANGE, content: '取引の進行ステータスが「受け渡し日程調整中」に変更されました。' },
    { title: 'システムメンテナンスのお知らせ', type: NotificationType.SYSTEM, content: '今週の日曜日の深夜2:00〜4:00にシステムメンテナンスを実施します。' }
  ];

  for (const user of dbUsers.slice(0, 60)) {
    const count = getRandomInt(6, 10);
    for (let n = 0; n < count; n++) {
      const template = getRandomElement(notifTitles);
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: template.type,
          title: template.title,
          content: template.content,
          isRead: random() > 0.3
        }
      });
      notifCount++;
    }
  }
  console.log(`Created ${notifCount} notifications.`);

  // デモ用の時間割登録 (Demo Userに登録する)
  // 理工学部の3年配当講義をいくつか選んで登録
  const demoUserLectures = dbLectures.filter(l => l.faculty === '理工学部' && l.grade === 3).slice(0, 5);
  for (const lec of demoUserLectures) {
    try {
      await prisma.timeTable.create({
        data: {
          userId: demoUser.id,
          lectureId: lec.id
        }
      });
    } catch (e) {
      // スキップ
    }
  }
  console.log('Registered demo user timetable.');

  console.log('Massive seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
