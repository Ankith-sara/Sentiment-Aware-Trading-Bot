import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  accountType: 'free' | 'premium' | 'enterprise';
  tradingExperience: string;
  riskTolerance: 'low' | 'medium' | 'high';
  preferredAssets: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserConfiguration {
  userId: string;
  maxPositionSize: number;
  maxDailyLoss: number;
  maxOpenPositions: number;
  riskTolerance: 'low' | 'medium' | 'high';
  autoTradingEnabled: boolean;
  tradingMode: 'paper' | 'live';
  minSentimentThreshold: number;
  maxSentimentThreshold: number;
  sentimentWeight: number;
  technicalWeight: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  apiKeys: {
    alpacaApiKey?: string;
    alpacaSecretKey?: string;
    finnhubApiKey?: string;
    newsApiKey?: string;
  };
  watchedSymbols: string[];
  notifications: {
    emailNotifications: boolean;
    tradeAlerts: boolean;
    sentimentAlerts: boolean;
    riskAlerts: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Trade {
  id?: string;
  userId: string;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalValue: number;
  fees: number;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  brokerOrderId?: string;
  sentimentScore?: number;
  signalId?: string;
  executedAt?: Timestamp;
  pnl: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TradingSignal {
  id?: string;
  userId: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  sentimentScore?: number;
  technicalScore?: number;
  combinedScore: number;
  reasoning: string;
  isExecuted: boolean;
  executedTradeId?: string;
  marketPrice?: number;
  volume?: number;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SentimentScore {
  id?: string;
  userId: string;
  symbol?: string;
  text: string;
  sentimentScore: number;
  confidence: number;
  label: 'positive' | 'negative' | 'neutral';
  source: 'news' | 'social' | 'earnings' | 'manual';
  sourceUrl?: string;
  processingTime?: number;
  modelVersion: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewsItem {
  id?: string;
  headline: string;
  summary: string;
  source: string;
  url?: string;
  symbols: string[];
  sentimentScore?: number;
  sentimentLabel?: string;
  confidence?: number;
  impact: 'high' | 'medium' | 'low';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firebase Service Class
export class FirebaseService {
  // User Profile Methods
  async createUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...profileData,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserProfile;
    }
    return null;
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  // User Configuration Methods
  async getUserConfiguration(userId: string): Promise<UserConfiguration | null> {
    const configRef = doc(db, 'userConfigurations', userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return { id: configSnap.id, ...configSnap.data() } as UserConfiguration;
    }
    return null;
  }

  async updateUserConfiguration(userId: string, config: Partial<UserConfiguration>): Promise<void> {
    const configRef = doc(db, 'userConfigurations', userId);
    await updateDoc(configRef, {
      ...config,
      userId,
      updatedAt: serverTimestamp()
    });
  }

  async createDefaultUserConfiguration(userId: string): Promise<void> {
    const configRef = doc(db, 'userConfigurations', userId);
    const defaultConfig: Partial<UserConfiguration> = {
      userId,
      maxPositionSize: 10000,
      maxDailyLoss: 1000,
      maxOpenPositions: 5,
      riskTolerance: 'medium',
      autoTradingEnabled: false,
      tradingMode: 'paper',
      minSentimentThreshold: 0.6,
      maxSentimentThreshold: 0.8,
      sentimentWeight: 0.7,
      technicalWeight: 0.3,
      stopLossPercentage: 5,
      takeProfitPercentage: 15,
      apiKeys: {},
      watchedSymbols: ['AAPL', 'TSLA', 'MSFT', 'NVDA'],
      notifications: {
        emailNotifications: true,
        tradeAlerts: true,
        sentimentAlerts: true,
        riskAlerts: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(configRef, defaultConfig);
  }

  // Trading Methods
  async createTrade(tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const tradesRef = collection(db, 'trades');
    const docRef = await addDoc(tradesRef, {
      ...tradeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getTrades(userId: string, limitCount: number = 50): Promise<Trade[]> {
    const tradesRef = collection(db, 'trades');
    const q = query(
      tradesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Trade[];
  }

  async updateTrade(tradeId: string, updates: Partial<Trade>): Promise<void> {
    const tradeRef = doc(db, 'trades', tradeId);
    await updateDoc(tradeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  // Trading Signals Methods
  async createTradingSignal(signalData: Omit<TradingSignal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const signalsRef = collection(db, 'tradingSignals');
    const docRef = await addDoc(signalsRef, {
      ...signalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getTradingSignals(userId: string, limitCount: number = 20): Promise<TradingSignal[]> {
    const signalsRef = collection(db, 'tradingSignals');
    const q = query(
      signalsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TradingSignal[];
  }

  // Sentiment Scores Methods
  async createSentimentScore(sentimentData: Omit<SentimentScore, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const sentimentRef = collection(db, 'sentimentScores');
    const docRef = await addDoc(sentimentRef, {
      ...sentimentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getSentimentScores(userId: string, symbol?: string, limitCount: number = 50): Promise<SentimentScore[]> {
    const sentimentRef = collection(db, 'sentimentScores');
    let q = query(
      sentimentRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (symbol) {
      q = query(
        sentimentRef,
        where('userId', '==', userId),
        where('symbol', '==', symbol),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SentimentScore[];
  }

  // News Methods
  async createNewsItem(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newsRef = collection(db, 'news');
    const docRef = await addDoc(newsRef, {
      ...newsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getNews(symbols?: string[], limitCount: number = 20): Promise<NewsItem[]> {
    const newsRef = collection(db, 'news');
    let q = query(
      newsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (symbols && symbols.length > 0) {
      q = query(
        newsRef,
        where('symbols', 'array-contains-any', symbols),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsItem[];
  }

  // Real-time listeners
  subscribeToTrades(userId: string, callback: (trades: Trade[]) => void): () => void {
    const tradesRef = collection(db, 'trades');
    const q = query(
      tradesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const trades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      callback(trades);
    });
  }

  subscribeToTradingSignals(userId: string, callback: (signals: TradingSignal[]) => void): () => void {
    const signalsRef = collection(db, 'tradingSignals');
    const q = query(
      signalsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const signals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TradingSignal[];
      callback(signals);
    });
  }
}

export const firebaseService = new FirebaseService();