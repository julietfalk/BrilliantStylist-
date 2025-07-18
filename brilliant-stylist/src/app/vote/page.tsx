"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '../../lib/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface VotePair {
  id: string;
  prompt: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    keywords: string[];
  };
  userSubmission: {
    id: string;
    imageUrl: string;
    userName: string;
    createdAt: string;
  };
  votes: {
    brilliant: number;
    meh: number;
  };
}

export default function VotePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [currentPair, setCurrentPair] = useState<VotePair | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState<'brilliant' | 'meh' | null>(null);

  useEffect(() => {
    loadVotePair();
  }, []);

  const loadVotePair = async () => {
    try {
      // For now, we'll use mock data since we don't have prompt images yet
      // In the future, this would fetch from a voting queue or random selection
      const mockVotePair: VotePair = {
        id: 'vote-1',
        prompt: {
          id: '1',
          title: 'Summer Beach Glam',
          description: 'Create a stunning beach outfit that combines comfort with high fashion. Think flowing fabrics, sun protection, and Instagram-worthy style.',
          category: 'Casual',
          difficulty: 'Medium',
          keywords: ['beach', 'summer', 'flowing', 'comfortable', 'stylish', 'sunglasses', 'hat']
        },
        userSubmission: {
          id: 'sub-1',
          imageUrl: 'https://ddshrnxhaptbedtnurrg.supabase.co/storage/v1/object/public/outfit-images/placeholder.jpg',
          userName: 'Fashionista123',
          createdAt: new Date().toISOString()
        },
        votes: {
          brilliant: 42,
          meh: 8
        }
      };

      setCurrentPair(mockVotePair);
    } catch (error) {
      console.error('Error loading vote pair:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote: 'brilliant' | 'meh') => {
    if (!currentPair || voting) return;

    setVoting(true);
    setUserVote(vote);

    try {
      // Store the vote in Supabase
      const { error } = await supabase
        .from('votes')
        .insert({
          vote_pair_id: currentPair.id,
          user_submission_id: currentPair.userSubmission.id,
          vote_type: vote,
          voted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing vote:', error);
        throw error;
      }

      // Update local vote counts
      setCurrentPair(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          votes: {
            ...prev.votes,
            [vote]: prev.votes[vote] + 1
          }
        };
      });

      // Show success message briefly
      setTimeout(() => {
        // Load next vote pair or show completion
        loadVotePair();
        setUserVote(null);
      }, 2000);

    } catch (error) {
      console.error('Voting error:', error);
      setUserVote(null);
    } finally {
      setVoting(false);
    }
  };

  const handleSkip = () => {
    loadVotePair();
    setUserVote(null);
  };

  const handleHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl">Loading voting pairs...</div>
      </div>
    );
  }

  if (!currentPair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl text-red-600">No voting pairs available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vote on Fashion</h1>
          <p className="text-lg text-gray-600">Rate these fashion recreations!</p>
        </div>

        {/* Prompt Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{currentPair.prompt.title}</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentPair.prompt.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {currentPair.prompt.difficulty}
              </span>
            </div>
          </div>
          <p className="text-gray-700 text-lg">{currentPair.prompt.description}</p>
        </div>

        {/* Image Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Original Prompt */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Original Prompt</h3>
            </div>
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-gray-600">Prompt Image</p>
                <p className="text-sm text-gray-500 mt-2">(Coming soon!)</p>
              </div>
            </div>
          </div>

          {/* User Submission */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">User Submission</h3>
              <p className="text-sm text-gray-600">by {currentPair.userSubmission.userName}</p>
            </div>
            <div className="aspect-square bg-gray-100 relative">
              {currentPair.userSubmission.imageUrl && currentPair.userSubmission.imageUrl !== 'placeholder.jpg' ? (
                <Image
                  src={currentPair.userSubmission.imageUrl}
                  alt="User fashion submission"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-gray-600">User Photo</p>
                    <p className="text-sm text-gray-500 mt-2">(Loading...)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Vote Counts */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Votes</h3>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currentPair.votes.brilliant}
              </div>
              <div className="text-sm text-gray-600">BRILLIANT</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {currentPair.votes.meh}
              </div>
              <div className="text-sm text-gray-600">MEH</div>
            </div>
          </div>
        </div>

        {/* Voting Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={() => handleVote('brilliant')}
            disabled={voting || userVote !== null}
            className={`px-12 py-6 rounded-full text-2xl font-bold transition-all transform hover:scale-105 ${
              userVote === 'brilliant'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {userVote === 'brilliant' ? '✓ VOTED BRILLIANT' : 'BRILLIANT'}
          </button>

          <button
            onClick={() => handleVote('meh')}
            disabled={voting || userVote !== null}
            className={`px-12 py-6 rounded-full text-2xl font-bold transition-all transform hover:scale-105 ${
              userVote === 'meh'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {userVote === 'meh' ? '✓ VOTED MEH' : 'MEH'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSkip}
            disabled={voting}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleHome}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Success Message */}
        {userVote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">
                {userVote === 'brilliant' ? '🎉' : '👍'}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Vote Recorded!
              </h3>
              <p className="text-gray-600">
                Loading next pair...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 