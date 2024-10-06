'use client'; // Add this line to indicate it's a Client Component

import { useState } from 'react';
import { Button, Input, Textarea, Flex, Box, Heading, Text, VStack } from '@chakra-ui/react';

// Define the type for props
interface BrandFormProps {
  brandName: string;
  setBrandName: (name: string) => void;
  keywords: string;
  setKeywords: (keywords: string) => void;
  isGenerating: boolean;
}

const BrandForm = ({ brandName, setBrandName, keywords, setKeywords, isGenerating }: BrandFormProps) => (
  <form onSubmit={handleSubmit}>
    <VStack spacing={4}>
      <Box w="100%">
        <Text mb={1}>Brand Name</Text>
        <Input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enter your brand name"
          required
        />
      </Box>
      <Box w="100%">
        <Text mb={1}>Keywords (one per line):</Text>
        <Textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Enter keywords, one per line"
          required
          rows={5}
        />
      </Box>
      <Button
        type="submit"
        isLoading={isGenerating}
        loadingText="Generating..."
        colorScheme="blue"
        w="100%"
      >
        Generate Report
      </Button>
    </VStack>
  </form>
);

export default function BrandRankChecker() {
  const [brandName, setBrandName] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/check-brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_name: brandName,
          keywords: keywords.split('\n').filter(k => k.trim() !== ''),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'amazon_search_results.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Flex direction="column" align="center" justify="start" minHeight="100vh" bg="gray.50" p={4}>
      <Box w="100%" maxW="md" bg="white" boxShadow="lg" borderRadius="lg" p={6}>
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Check if Your Brand Ranks on 1st Page
        </Heading>
        <BrandForm 
          brandName={brandName}
          setBrandName={setBrandName}
          keywords={keywords}
          setKeywords={setKeywords}
          isGenerating={isGenerating}
        />
      </Box>
    </Flex>
  );
}
