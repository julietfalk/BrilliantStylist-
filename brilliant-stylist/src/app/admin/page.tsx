"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '../../lib/SupabaseProvider';
import FashionPromptCard from '@/components/FashionPromptCard';

export default function AdminPage() {
  const supabase = useSupabase();
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [designer, setDesigner] = useState('');
  const [brand, setBrand] = useState('');
  const [styleDescription, setStyleDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fashion_cards')
      .select('*')
      .order('created_at', { ascending: false });
    setCards(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.from('fashion_cards').insert({
      title,
      image_url: imageUrl,
      designer,
      brand,
      style_description: styleDescription,
    });
    if (error) {
      setError(error.message || 'Error adding card');
    } else {
      setSuccess('Card added!');
      setTitle('');
      setImageUrl('');
      setDesigner('');
      setBrand('');
      setStyleDescription('');
      fetchCards();
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Admin: Add Fashion Card</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col gap-4">
          <input
            className="p-3 border rounded"
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            className="p-3 border rounded"
            type="url"
            placeholder="Image URL"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            required
          />
          <input
            className="p-3 border rounded"
            type="text"
            placeholder="Designer"
            value={designer}
            onChange={e => setDesigner(e.target.value)}
            required
          />
          <input
            className="p-3 border rounded"
            type="text"
            placeholder="Brand"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            required
          />
          <textarea
            className="p-3 border rounded"
            placeholder="Style Description"
            value={styleDescription}
            onChange={e => setStyleDescription(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-purple-600 text-white py-3 rounded font-semibold hover:bg-purple-700 transition-colors"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Card'}
          </button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </form>
        <h2 className="text-xl font-semibold mb-4 text-center">Existing Fashion Cards</h2>
        {loading ? (
          <div className="text-center">Loading cards...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map(card => (
              <FashionPromptCard
                key={card.id}
                imageUrl={card.image_url}
                designer={card.designer}
                brand={card.brand}
                styleDescription={card.style_description}
                title={card.title}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 