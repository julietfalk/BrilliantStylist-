"use client";

import { useState } from 'react';
import { useSupabase } from '../lib/SupabaseProvider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const supabase = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : 'Check your email for confirmation!');
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : 'Signed in!');
    if (!error) {
      setShowAuth(false);
      router.push('/profile');
    }
  };

  const startGame = () => {
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Brilliant Stylist
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl md:text-3xl font-semibold text-purple-600 mb-8">
              It's Charades for Fashion
            </p>
            
            {/* Description */}
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Challenge your friends to guess your outfit descriptions, create stunning looks, 
              and become the ultimate fashion detective in this stylish party game!
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button 
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Game
              </button>
              
              <button className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Browse Looks
              </button>
              
              <button 
                onClick={() => { setShowAuth(true); setAuthMode('signup'); }}
                className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Create Account
              </button>
              <button
                onClick={() => { setShowAuth(true); setAuthMode('signin'); }}
                className="bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign In
              </button>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🎭</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fashion Charades</h3>
                <p className="text-gray-600">Describe outfits without saying the obvious words</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">👗</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Looks</h3>
                <p className="text-gray-600">Design and share your favorite outfit combinations</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compete & Win</h3>
                <p className="text-gray-600">Challenge friends and climb the fashion leaderboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{authMode === 'signup' ? 'Create Account' : 'Sign In'}</h2>
              <button 
                onClick={() => setShowAuth(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <input
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            
            <div className="flex gap-3 mb-4">
              {authMode === 'signup' ? (
                <button 
                  onClick={handleSignUp}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </button>
              ) : (
                <button 
                  onClick={handleSignIn}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
            
            {message && (
              <p className="text-sm text-center text-gray-600">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
