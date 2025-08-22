import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, TrendingUp, Activity, Edit3, Save, X, Camera, Shield, Star, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService, UserProfile as FirebaseUserProfile } from '../services/firebase';

interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  bestTrade: number;
  avgHoldTime: string;
  sharpeRatio: number;
}

const ProfilePage: React.FC = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FirebaseUserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<FirebaseUserProfile>>({});

  // Load user profile from Firebase
  React.useEffect(() => {
    if (!currentUser) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        let userProfile = await firebaseService.getUserProfile(currentUser.uid);
        
        if (!userProfile) {
          // Create default profile if it doesn't exist
          const defaultProfile: Partial<FirebaseUserProfile> = {
            name: currentUser.displayName || 'User',
            email: currentUser.email || '',
            phone: '',
            location: '',
            bio: '',
            accountType: 'free',
            tradingExperience: '< 1 year',
            riskTolerance: 'medium',
            preferredAssets: ['AAPL', 'TSLA', 'MSFT', 'NVDA']
          };
          
          await firebaseService.createUserProfile(currentUser.uid, defaultProfile);
          userProfile = await firebaseService.getUserProfile(currentUser.uid);
        }
        
        setProfile(userProfile);
        setEditedProfile(userProfile || {});
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const [defaultProfile] = useState({
    name: currentUser?.displayName || 'John Doe',
    email: currentUser?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2023-06-15',
    bio: 'Experienced trader with a focus on sentiment-driven strategies. Passionate about leveraging AI and machine learning for market analysis.',
    avatar: '',
    accountType: 'premium',
    tradingExperience: '5+ years',
    riskTolerance: 'medium',
    preferredAssets: ['AAPL', 'TSLA', 'MSFT', 'NVDA']
  });

  const [tradingStats] = useState<TradingStats>({
    totalTrades: 1247,
    winRate: 78.5,
    totalPnL: 45678.90,
    bestTrade: 2341.50,
    avgHoldTime: '2.3 days',
    sharpeRatio: 1.85
  });

  const handleSave = async () => {
    if (!currentUser || !profile) return;
    
    try {
      await firebaseService.updateUserProfile(currentUser.uid, editedProfile);
      const updatedProfile = await firebaseService.getUserProfile(currentUser.uid);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'enterprise': return 'from-purple-500 to-violet-600';
      case 'premium': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'enterprise': return <Star className="h-4 w-4" />;
      case 'premium': return <Zap className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className={`ml-4 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`rounded-2xl shadow-xl border p-8 ${
        isDark 
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-700' 
          : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings
          </h1>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <Edit3 className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <Save className="h-5 w-5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info Card */}
          <div className={`rounded-2xl shadow-xl border p-8 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <User className="h-12 w-12 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className={`text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      />
                    ) : (
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {profile.name}
                      </h2>
                    )}
                    <div className={`flex items-center space-x-2 mt-1 px-3 py-1 rounded-full bg-gradient-to-r ${getAccountTypeColor(profile.accountType || 'free')} text-white text-sm font-medium`}>
                      {getAccountTypeIcon(profile.accountType || 'free')}
                      <span className="capitalize">{profile.accountType || 'free'} Account</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                        className={`flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      />
                    ) : (
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{profile.email || ''}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile.phone || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                        className={`flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      />
                    ) : (
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{profile.phone || ''}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.location || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                        className={`flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      />
                    ) : (
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{profile.location || ''}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      Joined {profile.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                About
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  rows={3}
                  className={`w-full p-3 rounded-lg border focus:border-blue-500 focus:outline-none resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{profile.bio || 'No bio available'}</p>
              )}
            </div>
          </div>

          {/* Trading Preferences */}
          <div className={`rounded-2xl shadow-xl border p-8 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Trading Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Trading Experience
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.tradingExperience || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, tradingExperience: e.target.value})}
                    className={`w-full p-3 rounded-lg border focus:border-blue-500 focus:outline-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="< 1 year">Less than 1 year</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                ) : (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{profile.tradingExperience || '< 1 year'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Risk Tolerance
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.riskTolerance || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, riskTolerance: e.target.value as 'low' | 'medium' | 'high'})}
                    className={`w-full p-3 rounded-lg border focus:border-blue-500 focus:outline-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={`capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.riskTolerance || 'medium'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Preferred Assets
              </label>
              <div className="flex flex-wrap gap-2">
                {(profile.preferredAssets || []).map((asset) => (
                  <span
                    key={asset}
                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-medium"
                  >
                    {asset}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-8">
          {/* Trading Stats */}
          <div className={`rounded-2xl shadow-xl border p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
              Trading Stats
            </h3>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Trades</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {tradingStats.totalTrades.toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Win Rate</div>
                <div className="text-2xl font-bold text-green-400">
                  {tradingStats.winRate}%
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total P&L</div>
                <div className="text-2xl font-bold text-green-400">
                  +${tradingStats.totalPnL.toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best Trade</div>
                <div className="text-2xl font-bold text-green-400">
                  +${tradingStats.bestTrade.toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Hold Time</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {tradingStats.avgHoldTime}
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sharpe Ratio</div>
                <div className="text-2xl font-bold text-blue-400">
                  {tradingStats.sharpeRatio}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className={`rounded-2xl shadow-xl border p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Award className="h-6 w-6 mr-2 text-yellow-500" />
              Achievements
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Profit Master
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    100+ profitable trades
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Active Trader
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    1000+ trades executed
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Consistent Winner
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    70%+ win rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;