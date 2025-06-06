const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for local development
const users = new Map();
const sessions = new Map();
const questions = [
  {
    id: 'q1',
    text: 'あなたのビジネスや製品・サービスについて教えてください',
    category: 'business',
    order: 1,
    isActive: true,
    helperText: '提供している商品やサービスの概要、特徴、強みなどを記入してください',
    sampleAnswer: '私たちは、中小企業向けのクラウド会計ソフトを提供しています。簿記の知識がなくても簡単に使える操作性と、税理士との連携機能が特徴です。'
  },
  {
    id: 'q2',
    text: 'ターゲットとなる顧客層について教えてください',
    category: 'target',
    order: 2,
    isActive: true,
    helperText: '年齢層、性別、職業、興味関心、抱えている課題など、具体的に記入してください',
    sampleAnswer: '30-50代の中小企業経営者や個人事業主。日々の経理作業に時間を取られ、本業に集中できないことに悩んでいる方々。'
  },
  {
    id: 'q3',
    text: '競合他社と比較した際の差別化ポイントは何ですか？',
    category: 'differentiation',
    order: 3,
    isActive: true,
    helperText: '価格、品質、サービス、技術など、他社にない強みを記入してください',
    sampleAnswer: '月額2,980円という業界最安値クラスの価格設定と、24時間365日のカスタマーサポート。さらに、AIによる自動仕訳機能で作業時間を大幅に削減。'
  }
];

// Routes - Direct mock implementation without Lambda functions

// Signup endpoint
app.post('/v1/users/signup', async (req, res) => {
  try {
    console.log('POST /v1/users/signup - Request:', req.body);
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'email, password, name は必須です' 
      });
    }
    
    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ 
        message: 'そのメールアドレスは既に登録されています' 
      });
    }
    
    // Create new user
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    const newUser = {
      id: userId,
      email,
      password, // In real app, this should be hashed
      name,
      createdAt: timestamp,
      confirmed: true // Auto-confirm for local development
    };
    
    users.set(email, newUser);
    console.log('User created:', { email, name, userId });
    
    res.status(201).json({
      message: 'ユーザー登録に成功しました',
      userId: userId
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// Login endpoint
app.post('/v1/users/login', async (req, res) => {
  try {
    console.log('POST /v1/users/login - Request:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'email と password は必須です' 
      });
    }
    
    // Check user exists
    const user = users.get(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ 
        message: '認証に失敗しました' 
      });
    }
    
    // Generate mock tokens
    const token = 'mock-token-' + Date.now();
    const sessionId = uuidv4();
    sessions.set(sessionId, { email, token });
    
    console.log('Login successful:', { email });
    
    res.status(200).json({
      idToken: token,
      accessToken: token,
      refreshToken: 'mock-refresh-' + Date.now(),
      expiresIn: 3600
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// Get user endpoint
app.get('/v1/users/:userId', async (req, res) => {
  try {
    console.log('GET /v1/users/:userId - Request:', req.params.userId);
    
    // Find user by ID
    const user = Array.from(users.values()).find(u => u.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'ユーザーが見つかりません' 
      });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// Questions endpoints
app.get('/v1/questions', (req, res) => {
  console.log('GET /v1/questions - 質問一覧取得');
  res.json(questions);
});

app.get('/v1/questions/:id', (req, res) => {
  const question = questions.find(q => q.id === req.params.id);
  if (!question) {
    return res.status(404).json({ message: '質問が見つかりません' });
  }
  res.json(question);
});

app.post('/v1/questions', (req, res) => {
  const newQuestion = {
    ...req.body,
    id: `q${Date.now()}`
  };
  questions.push(newQuestion);
  res.status(201).json(newQuestion);
});

app.put('/v1/questions/:id', (req, res) => {
  const index = questions.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '質問が見つかりません' });
  }
  questions[index] = { ...questions[index], ...req.body };
  res.json(questions[index]);
});

app.delete('/v1/questions/:id', (req, res) => {
  const index = questions.findIndex(q => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '質問が見つかりません' });
  }
  questions.splice(index, 1);
  res.status(204).send();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    users: users.size,
    sessions: sessions.size,
    questions: questions.length
  });
});

// Options handler for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`\n🚀 Local backend server running at http://localhost:${port}`);
  console.log('\n📝 Available endpoints:');
  console.log('- POST http://localhost:3001/v1/users/signup');
  console.log('- POST http://localhost:3001/v1/users/login');
  console.log('- GET  http://localhost:3001/v1/users/:userId');
  console.log('- GET  http://localhost:3001/v1/questions');
  console.log('- GET  http://localhost:3001/health\n');
}); 