const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// インメモリデータストレージ
const users = new Map();
const sessions = new Map();

// ユーザー登録エンドポイント
app.post('/v1/users/signup', (req, res) => {
  try {
    const { email, password, name, company, position } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'email, password, name は必須です' 
      });
    }

    // 既存ユーザーチェック
    for (const user of users.values()) {
      if (user.email === email) {
        return res.status(400).json({ 
          message: 'そのメールアドレスは既に登録されています' 
        });
      }
    }

    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      name,
      company: company || '',
      position: position || '',
      role: 'user',
      plan: 'free',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      usageLimit: 100,
      apiAccess: false,
      usage: {
        lpGenerated: 0,
        apiCalls: 0
      }
    };

    users.set(userId, user);

    // アクセストークン生成
    const accessToken = `mock-token-${userId}-${Date.now()}`;
    sessions.set(accessToken, { userId, expiresAt: Date.now() + 3600000 }); // 1時間

    res.status(201).json({
      message: 'ユーザー登録に成功しました',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ログインエンドポイント
app.post('/v1/users/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'email と password は必須です' 
      });
    }

    // ユーザー検索
    let foundUser = null;
    for (const user of users.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ message: '認証に失敗しました' });
    }

    // パスワードチェック（簡易実装）
    if (password !== 'password123') { // デモ用固定パスワード
      return res.status(401).json({ message: '認証に失敗しました' });
    }

    // ログイン時刻更新
    foundUser.lastLoginAt = new Date().toISOString();
    users.set(foundUser.id, foundUser);

    // アクセストークン生成
    const accessToken = `mock-token-${foundUser.id}-${Date.now()}`;
    sessions.set(accessToken, { userId: foundUser.id, expiresAt: Date.now() + 3600000 });

    res.json({
      accessToken,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(401).json({ message: '認証に失敗しました' });
  }
});

// ユーザー情報取得エンドポイント
app.get('/v1/users/:userId', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '認証トークンがありません' });
    }

    const token = authHeader.slice('Bearer '.length);
    const session = sessions.get(token);
    
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ message: 'トークンが無効です' });
    }

    const user = users.get(session.userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザー情報が見つかりません' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 全ユーザー取得エンドポイント（管理者用）
app.get('/v1/users', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '認証トークンがありません' });
    }

    const allUsers = Array.from(users.values());
    res.json(allUsers);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 質問取得エンドポイント
app.get('/v1/questions', (req, res) => {
  try {
    const mockQuestions = [
      {
        id: '1',
        text: 'あなたの事業・サービスの名前を教えてください',
        category: 'basic',
        order: 1,
        isActive: true,
        helperText: '正式名称またはブランド名を入力してください',
        isRequired: true
      },
      {
        id: '2',
        text: 'どのような業界・分野で事業を行っていますか？',
        category: 'basic',
        order: 2,
        isActive: true,
        helperText: '例：IT、飲食、教育、医療など',
        isRequired: true
      },
      {
        id: '3',
        text: 'あなたのターゲット顧客は誰ですか？',
        category: 'target',
        order: 3,
        isActive: true,
        helperText: '年齢、性別、職業、興味関心などを具体的に',
        isRequired: true
      }
    ];

    res.json(mockQuestions);
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// デモユーザーを事前作成
const demoUser = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  name: 'デモユーザー',
  company: 'デモ会社',
  position: 'マネージャー',
  role: 'user',
  plan: 'standard',
  isActive: true,
  createdAt: new Date().toISOString(),
  lastLoginAt: null,
  usageLimit: 500,
  apiAccess: true,
  usage: {
    lpGenerated: 15,
    apiCalls: 120
  }
};
users.set(demoUser.id, demoUser);

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log('📝 Available endpoints:');
  console.log('  POST /v1/users/signup - ユーザー登録');
  console.log('  POST /v1/users/login - ログイン');
  console.log('  GET  /v1/users/:userId - ユーザー情報取得');
  console.log('  GET  /v1/users - 全ユーザー取得');
  console.log('  GET  /v1/questions - 質問一覧取得');
  console.log('');
  console.log('🔑 デモアカウント:');
  console.log('  Email: demo@example.com');
  console.log('  Password: password123');
}); 