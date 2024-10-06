import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from 'next/link';

export default function BrandRankChecker() {
  const [brandName, setBrandName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert('Report generated! (This is a placeholder)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-md mt-8 mb-8">
        <div className="flex items-center justify-end space-x-2">
          <span className="text-sm text-blue-900">Created by</span>
          <Link href="https://phonetool.amazon.com/users/khadiana" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Naman Khadia
          </Link>
        </div>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Check if Your Brand Ranks on 1st Page</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-blue-900 mb-1">Brand Name</label>
              <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Enter your brand name" required className="w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-blue-900 mb-1">Keywords (one per line):</label>
              <Textarea id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Enter keywords, one per line" required className="w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500" rows={5} />
            </div>
            <Button type="submit" disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              {isGenerating ? 'Analyzing...' : 'Analyze Brand Ranking'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}a