"use client";

import { useEffect, useState } from 'react';
import { useSupabase } from '../../lib/SupabaseProvider';
import Image from 'next/image';

interface LeaderboardLook {
  id: string;
  name: string;
  created_at: string;
  outfit_data: any;
  user_id: string;
  display_name: string;
  votes_brilliant: number;
}

export default function LeaderboardPage() {
  const supabase = useSupabase();
  const [looks, setLooks] = useState<LeaderboardLook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all outfits with user info
      const { data: outfitData } = await supabase
        .from('user_outfits')
        .select('*, user_profiles(display_name)')
        .order('created_at', { ascending: false });

      // For each outfit, fetch vote counts
      const looksWithVotes: LeaderboardLook[] = [];
      for (const outfit of outfitData || []) {
        const { data: voteCounts } = await supabase.rpc('get_vote_counts', { submission_id: outfit.id });
        const votes_brilliant = voteCounts?.[0]?.brilliant_count || 0;
        looksWithVotes.push({
          ...outfit,
          display_name: outfit.user_profiles?.display_name || 'Anonymous',
          votes_brilliant,
        });
      }
      // Sort by most BRILLIANT votes
      looksWithVotes.sort((a, b) => b.votes_brilliant - a.votes_brilliant);
      setLooks(looksWithVotes.slice(0, 20));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Leaderboard: Most Liked Looks</h1>
        {loading ? (
          <div className="text-center text-xl">Loading leaderboard...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {looks.map((look, idx) => (
              <div key={look.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <div className="w-32 h-32 relative mb-2">
                  <Image
                    src={look.outfit_data.public_url || look.outfit_data.image_url || '/api/placeholder-image'}
                    alt={look.name}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="font-semibold text-gray-800 mb-1">{look.name}</div>
                <div className="text-gray-600 text-sm mb-1">by {look.display_name}</div>
                <div className="text-yellow-600 font-bold text-lg">{look.votes_brilliant} BRILLIANT</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(look.created_at).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400">Rank #{idx + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 