"use client";

import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../../lib/SupabaseProvider';
import { useRouter } from 'next/navigation';

interface FashionPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  keywords: string[];
}

export default function GamePage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardcoded fashion prompt
  const currentPrompt: FashionPrompt = {
    id: '1',
    title: 'Summer Beach Glam',
    description: 'Create a stunning beach outfit that combines comfort with high fashion. Think flowing fabrics, sun protection, and Instagram-worthy style.',
    category: 'Casual',
    difficulty: 'Medium',
    keywords: ['beach', 'summer', 'flowing', 'comfortable', 'stylish', 'sunglasses', 'hat']
  };

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setUploadMessage('Time\'s up! Submit your photo quickly!');
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => {
    setIsTimerRunning(true);
    setTimeLeft(180);
    setUploadMessage('');
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(180);
    setUploadMessage('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a photo first!');
      return;
    }

    setUploading(true);
    setUploadMessage('Uploading...');

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload to Supabase Storage (simplified path)
      const fileName = `${user.id}-${Date.now()}-${selectedFile.name}`;
      console.log('Uploading file:', fileName);
      
      const { data, error } = await supabase.storage
        .from('outfit-images')
        .upload(fileName, selectedFile);

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Storage error: ${error.message}`);
      }

      console.log('File uploaded successfully:', data);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('outfit-images')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_outfits')
        .insert({
          user_id: user.id,
          name: currentPrompt.title,
          description: `Recreation of: ${currentPrompt.description}`,
          outfit_data: {
            prompt_id: currentPrompt.id,
            image_url: data.path,
            public_url: urlData.publicUrl,
            uploaded_at: new Date().toISOString()
          }
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      setUploadMessage('Photo uploaded successfully! 🎉');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Redirect to reveal page after a short delay
      setTimeout(() => {
        router.push('/reveal');
      }, 1500);

    } catch (error) {
      console.error('Upload error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      setUploadMessage(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Fashion Challenge</h1>
          <p className="text-lg text-gray-600">Recreate the look and upload your photo!</p>
        </div>

        {/* Timer Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-600 mb-4">
              {formatTime(timeLeft)}
            </div>
            <div className="flex justify-center gap-4">
              {!isTimerRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Start Timer
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Fashion Prompt Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{currentPrompt.title}</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentPrompt.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {currentPrompt.difficulty}
              </span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 text-lg">{currentPrompt.description}</p>
          
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Keywords to avoid:</h3>
            <div className="flex flex-wrap gap-2">
              {currentPrompt.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Your Recreation</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div>
                <p className="text-green-600 font-medium mb-2">✓ Photo selected: {selectedFile.name}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Choose different photo
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Click to select your photo</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Choose Photo
                </button>
              </div>
            )}
          </div>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          )}

          {uploadMessage && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              uploadMessage.includes('successfully') 
                ? 'bg-green-100 text-green-800' 
                : uploadMessage.includes('failed') 
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {uploadMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 