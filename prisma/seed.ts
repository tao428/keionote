import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. テストユーザーの作成
  const testUsers = [
    {
      email: 'taro.keio@keio.jp',
      nickname: '慶應太郎',
      role: UserRole.USER,
      faculty: '理工学部',
      department: '情報工学科',
      grade: 3,
    },
    {
      email: 'hanako.mita@keio.jp',
      nickname: '三田花子',
      role: UserRole.USER,
      faculty: '経済学部',
      department: '経済学科',
      grade: 2,
    },
    {
      email: 'admin.note@keio.jp',
      nickname: '管理者ノート',
      role: UserRole.ADMIN,
      faculty: 'システム運営',
      department: '運営事務局',
      grade: 4,
    }
  ];

  const dbUsers = [];
  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    dbUsers.push(user);
    console.log(`Created user: ${user.nickname} (${user.email})`);
  }

  // 2. 受け渡し場所マスタの作成
  const locations = [
    // 日吉
    { campus: 'HIYOSHI', name: '銀杏並木入口', description: '日吉駅前の横断歩道を渡ってすぐ、並木の入口付近' },
    { campus: 'HIYOSHI', name: '食堂（グリーンハウス）前', description: '食堂棟の入り口付近' },
    { campus: 'HIYOSHI', name: '協生館入口', description: '日吉駅近くの協生館のメインエントランス' },
    // 三田
    { campus: 'MITA', name: '山食（食堂）内', description: '西校舎地下の食堂「山食」の入り口付近' },
    { campus: 'MITA', name: '東館中庭', description: '東館の前の屋外スペース' },
    // 矢上
    { campus: 'YAGAMI', name: '創想館2階ロビー', description: '創想館エントランスを入ってすぐのソファーエリア' },
    { campus: 'YAGAMI', name: 'フォーラム（生協前）', description: '生協購買部や食堂のあるエリアの広場' },
    // SFC
    { campus: 'SFC', name: 'Ω館（オメガ館）前', description: 'オメガ館（大講義室）の正面入口' },
    { campus: 'SFC', name: 'メディアセンター入り口', description: '図書館（メディアセンター）の自動ドア前' },
  ];

  for (const loc of locations) {
    await prisma.pickupLocation.create({
      data: loc,
    });
  }
  console.log('Created pickup locations.');

  // 3. 各学部の講義データの作成と教科書の紐付け
  const lecturesData = [
    {
      name: 'プログラミング基礎',
      teacher: '慶應 太郎 教授',
      faculty: '理工学部',
      department: '情報工学科',
      textbooks: [
        { title: 'C言語によるプログラミングの基礎', author: '坂下 誠', publisher: 'サイエンス社', isbn: '9784781914321' }
      ]
    },
    {
      name: '線形代数Ⅰ',
      teacher: '矢上 健一 教授',
      faculty: '理工学部',
      department: '共通',
      textbooks: [
        { title: '線形代数とその応用', author: 'ギルバート・ストラング', publisher: '産業図書', isbn: '9784782811111' }
      ]
    },
    {
      name: 'ミクロ経済学初級',
      teacher: '三田 一郎 教授',
      faculty: '経済学部',
      department: '経済学科',
      textbooks: [
        { title: 'ミクロ経済学の力', author: '神取 道宏', publisher: '日本評論社', isbn: '9784535558267' }
      ]
    },
    {
      name: 'マクロ経済学初級',
      teacher: '日吉 次郎 教授',
      faculty: '経済学部',
      department: '経済学科',
      textbooks: [
        { title: 'マクロ経済学（第2版）', author: 'ジョセフ・E・スティグリッツ', publisher: '東洋経済新報社', isbn: '9784492314555' }
      ]
    },
    {
      name: '会計学概論',
      teacher: '福澤 諭 教授',
      faculty: '商学部',
      department: '商学科',
      textbooks: [
        { title: '会計学講義', author: '山下 純', publisher: '中央経済社', isbn: '9784502334444' }
      ]
    },
    {
      name: '憲法Ⅰ',
      teacher: '綱町 雅人 教授',
      faculty: '法学部',
      department: '法律学科',
      textbooks: [
        { title: '憲法1 人権（第8版）', author: '芦部 信喜', publisher: '岩波書店', isbn: '9784000615555' }
      ]
    },
    {
      name: '日本史概説',
      teacher: '芝公園 哲 教授',
      faculty: '文学部',
      department: '人文社会学科',
      textbooks: [
        { title: '詳説日本史研究', author: '佐藤 信', publisher: '山川出版社', isbn: '9784634010444' }
      ]
    },
    {
      name: 'パターンランゲージ',
      teacher: '井庭 崇 教授',
      faculty: '環境情報学部',
      department: '環境情報学科',
      textbooks: [
        { title: 'プレゼンテーション・パターン', author: '井庭 崇', publisher: '慶應義塾大学出版会', isbn: '9784766420555' }
      ]
    }
  ];

  for (const lec of lecturesData) {
    const dbLec = await prisma.lecture.create({
      data: {
        name: lec.name,
        teacher: lec.teacher,
        faculty: lec.faculty,
        department: lec.department,
      }
    });

    for (const tb of lec.textbooks) {
      await prisma.textbook.create({
        data: {
          lectureId: dbLec.id,
          title: tb.title,
          author: tb.author,
          publisher: tb.publisher,
          isbn: tb.isbn,
        }
      });
    }
    console.log(`Created lecture: ${lec.name} with textbooks.`);
  }

  // 4. サンプル出品データの追加
  // 「プログラミング基礎」と「ミクロ経済学初級」に対して出品を作る
  const progLec = await prisma.lecture.findFirst({ where: { name: 'プログラミング基礎' }, include: { textbooks: true } });
  const microLec = await prisma.lecture.findFirst({ where: { name: 'ミクロ経済学初級' }, include: { textbooks: true } });

  if (progLec && progLec.textbooks.length > 0 && dbUsers[0]) {
    const item = await prisma.item.create({
      data: {
        sellerId: dbUsers[0].id,
        textbookId: progLec.textbooks[0].id,
        title: '【極美品】C言語によるプログラミングの基礎',
        description: '去年受けたプログラミング基礎の教科書です。書き込みはなく、非常に綺麗な状態です。',
        price: 1500,
        condition: 'LIKE_NEW',
      }
    });

    await prisma.itemImage.create({
      data: {
        itemId: item.id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        displayOrder: 0
      }
    });
    console.log('Created sample item for programming class.');
  }

  if (microLec && microLec.textbooks.length > 0 && dbUsers[1]) {
    const item = await prisma.item.create({
      data: {
        sellerId: dbUsers[1].id,
        textbookId: microLec.textbooks[0].id,
        title: 'ミクロ経済学の力（少し書き込みあり）',
        description: '授業でよく使いました。マーカーでの線引きが数ページありますが、通読には問題ありません。',
        price: 1000,
        condition: 'USED',
      }
    });

    await prisma.itemImage.create({
      data: {
        itemId: item.id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        displayOrder: 0
      }
    });
    console.log('Created sample item for microeconomics class.');
  }

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
