"use client";

import { useEffect, useState, useRef } from 'react';
import { useSupabase } from '../../lib/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  level: number;
  experience_points: number;
  coins: number;
}

interface UserOutfit {
  id: string;
  name: string;
  created_at: string;
  outfit_data: any;
  votes_brilliant: number;
  votes_meh: number;
}

export default function ProfilePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [outfits, setOutfits] = useState<UserOutfit[]>([]);
  const [mostVoted, setMostVoted] = useState<UserOutfit | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [timePlayed, setTimePlayed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareTooltip, setShareTooltip] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);
      setEditName(profileData.display_name || '');
      setEditAvatarUrl(profileData.avatar_url || '');

      // Fetch user outfits
      const { data: outfitData } = await supabase
        .from('user_outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // For each outfit, fetch vote counts
      const outfitsWithVotes: UserOutfit[] = [];
      let total = 0;
      let maxVotes = 0;
      let mostVotedOutfit: UserOutfit | null = null;
      for (const outfit of outfitData || []) {
        // Get vote counts using the function
        const { data: voteCounts } = await supabase.rpc('get_vote_counts', { submission_id: outfit.id });
        const votes_brilliant = voteCounts?.[0]?.brilliant_count || 0;
        const votes_meh = voteCounts?.[0]?.meh_count || 0;
        const totalForThis = votes_brilliant + votes_meh;
        total += totalForThis;
        const outfitWithVotes = {
          ...outfit,
          votes_brilliant,
          votes_meh,
        };
        outfitsWithVotes.push(outfitWithVotes);
        if (totalForThis > maxVotes) {
          maxVotes = totalForThis;
          mostVotedOutfit = outfitWithVotes;
        }
      }
      setOutfits(outfitsWithVotes);
      setMostVoted(mostVotedOutfit);
      setTotalVotes(total);
      setTimePlayed((outfitData?.length || 0) * 3);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatar(file);
      setEditAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    let avatarUrl = profile.avatar_url;
    try {
      // Upload avatar if changed
      if (editAvatar) {
        const fileName = `${profile.id}-avatar-${Date.now()}`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, editAvatar, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }
      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ display_name: editName, avatar_url: avatarUrl })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setEditModal(false);
      fetchProfileData();
    } catch (error) {
      alert('Error saving profile.');
      const err = error as any;
      console.error('Profile update error:', err, err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (url: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareTooltip(`Link copied!`);
      setTimeout(() => setShareTooltip(null), 2000);
    } catch {
      setShareTooltip('Failed to copy');
      setTimeout(() => setShareTooltip(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-xl text-red-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-4xl text-gray-400">👤</div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.display_name || profile.username}</h1>
          <div className="flex gap-4 text-gray-600 mb-2">
            <span>Level {profile.level}</span>
            <span>⭐ {profile.experience_points} XP</span>
            <span>💰 {profile.coins} coins</span>
          </div>
          <div className="flex gap-6 text-lg mt-2">
            <span>🕒 Time Played: {timePlayed} min</span>
            <span>🏆 Total Votes: {totalVotes}</span>
          </div>
          <button
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
        </div>

        {/* Edit Profile Modal */}
        {editModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <label className="block mb-2 font-semibold">Display Name</label>
              <input
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
              <label className="block mb-2 font-semibold">Avatar</label>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                  {editAvatarUrl ? (
                    <Image src={editAvatarUrl} alt="Avatar Preview" width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-2xl text-gray-400">👤</div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </button>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                  onClick={() => setEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Most Voted Look */}
        {mostVoted && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-center">Most Voted Look</h2>
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 relative mb-2">
                <Image
                  src={mostVoted.outfit_data.public_url || mostVoted.outfit_data.image_url || '/api/placeholder-image'}
                  alt={mostVoted.name}
                  fill
                  className="object-cover rounded-lg border-4 border-yellow-400"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="text-lg font-bold text-gray-800">{mostVoted.name}</div>
              <div className="text-gray-600">{mostVoted.votes_brilliant} BRILLIANT / {mostVoted.votes_meh} MEH</div>
            </div>
          </div>
        )}

        {/* Uploaded Looks */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Your Uploaded Looks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {outfits.map((outfit, idx) => (
              <div key={outfit.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
                <div className="w-32 h-32 relative mb-2">
                  <Image
                    src={outfit.outfit_data.public_url || outfit.outfit_data.image_url || '/api/placeholder-image'}
                    alt={outfit.name}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="font-semibold text-gray-800 mb-1">{outfit.name}</div>
                <div className="text-gray-600 text-sm">{outfit.votes_brilliant} BRILLIANT / {outfit.votes_meh} MEH</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(outfit.created_at).toLocaleDateString()}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 text-xs"
                    onClick={() => handleShare(outfit.outfit_data.public_url || outfit.outfit_data.image_url, idx)}
                  >
                    {shareTooltip ? shareTooltip : 'Copy Link'}
                  </button>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white px-3 py-1 rounded text-xs font-semibold hover:opacity-90"
                  >
                    Share to Instagram
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 