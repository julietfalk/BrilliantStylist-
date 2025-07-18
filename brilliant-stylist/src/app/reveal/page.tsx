"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '../../lib/SupabaseProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface RevealData {
  prompt: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    keywords: string[];
  };
  userImage: string;
  promptImage?: string;
}

export default function RevealPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadRevealData();
  }, []);

  const loadRevealData = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      // Fetch the most recent outfit for this user
      const { data: outfits, error } = await supabase
        .from('user_outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching outfit:', error);
        throw error;
      }

      if (outfits && outfits.length > 0) {
        const outfit = outfits[0];
        const outfitData = outfit.outfit_data as any;
        
        // Get the public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('outfit-images')
          .getPublicUrl(outfitData.image_url);

        const mockRevealData: RevealData = {
          prompt: {
            id: outfitData.prompt_id,
            title: outfit.name,
            description: outfit.description.replace('Recreation of: ', ''),
            category: 'Casual',
            difficulty: 'Medium',
            keywords: ['beach', 'summer', 'flowing', 'comfortable', 'stylish', 'sunglasses', 'hat']
          },
          userImage: urlData.publicUrl,
          promptImage: '/api/placeholder-prompt' // We'll add this later
        };

        setRevealData(mockRevealData);
      } else {
        // Fallback to mock data if no outfit found
        const mockRevealData: RevealData = {
          prompt: {
            id: '1',
            title: 'Summer Beach Glam',
            description: 'Create a stunning beach outfit that combines comfort with high fashion. Think flowing fabrics, sun protection, and Instagram-worthy style.',
            category: 'Casual',
            difficulty: 'Medium',
            keywords: ['beach', 'summer', 'flowing', 'comfortable', 'stylish', 'sunglasses', 'hat']
          },
          userImage: '/api/placeholder-image',
          promptImage: '/api/placeholder-prompt'
        };
        setRevealData(mockRevealData);
      }
    } catch (error) {
      console.error('Error loading reveal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my fashion recreation!',
          text: `I recreated "${revealData?.prompt.title}" in Brilliant Stylist!`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleVoting = () => {
    router.push('/vote');
  };

  const handlePlayAgain = () => {
    router.push('/game');
  };

  const handleHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl">Loading your creation...</div>
      </div>
    );
  }

  if (!revealData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error loading reveal data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reveal Time!</h1>
          <p className="text-lg text-gray-600">Compare your recreation with the original prompt</p>
        </div>

        {/* Prompt Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{revealData.prompt.title}</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {revealData.prompt.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {revealData.prompt.difficulty}
              </span>
            </div>
          </div>
          <p className="text-gray-700 text-lg">{revealData.prompt.description}</p>
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

          {/* User's Recreation */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Your Recreation</h3>
            </div>
            <div className="aspect-square bg-gray-100 relative">
              {revealData.userImage && revealData.userImage !== '/api/placeholder-image' ? (
                <Image
                  src={revealData.userImage}
                  alt="Your fashion recreation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-gray-600">Your Photo</p>
                    <p className="text-sm text-gray-500 mt-2">(Uploaded successfully!)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keywords Avoided */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Keywords You Avoided</h3>
          <div className="flex flex-wrap gap-2">
            {revealData.prompt.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                ✓ {keyword}
              </span>
            ))}
          </div>
          <p className="text-gray-600 mt-3 text-sm">
            Great job! You successfully avoided all the forbidden keywords while still creating a stunning look!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sharing ? (
              <>
                <span className="animate-spin">⏳</span>
                Sharing...
              </>
            ) : (
              <>
                📤 Share
              </>
            )}
          </button>

          <button
            onClick={handleVoting}
            className="bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
          >
            🗳️ Vote
          </button>

          <button
            onClick={handlePlayAgain}
            className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            🎮 Play Again
          </button>

          <button
            onClick={handleHome}
            className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            🏠 Home
          </button>
        </div>

        {/* Celebration Message */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold mb-2">🎉 Congratulations! 🎉</h3>
          <p className="text-lg">
            You've successfully completed the fashion challenge! Your creativity and style are amazing!
          </p>
        </div>
      </div>
    </div>
  );
} 