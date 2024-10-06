import { useState } from 'react';
import { Button, Input, Textarea, Flex, Box, Heading, Text, Link as ChakraLink, VStack, useToast } from '@chakra-ui/react';
import Link from 'next/link';

export default function BrandRankChecker() {
  const [brandName, setBrandName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
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

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `amazon_search_results_${brandName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: "Report generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "An error occurred",
        description: "Failed to generate the report. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="start"
      minHeight="100vh"
      bgGradient="linear(to-b, blue.100, white)"
      p={4}
    >
      <Box w="100%" maxW="md" mt={8} mb={8}>
        <Flex justify="flex-end" align="center">
          <Text fontSize="sm" color="blue.900" mr={2}>Created by</Text>
          <ChakraLink
            as={Link}
            href="https://phonetool.amazon.com/users/khadiana"
            target="_blank"
            rel="noopener noreferrer"
            fontSize="sm"
            fontWeight="medium"
            color="blue.600"
            _hover={{ color: "blue.800" }}
          >
            Naman Khadia
          </ChakraLink>
        </Flex>
      </Box>

      <Box
        w="100%"
        maxW="md"
        bg="white"
        boxShadow="xl"
        borderRadius="lg"
        overflow="hidden"
      >
        <Box p={6}>
          <Heading as="h1" size="xl" textAlign="center" color="blue.900" mb={6}>
            Check if Your Brand Ranks on 1st Page
          </Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Box w="100%">
                <Text as="label" htmlFor="brandName" fontSize="sm" fontWeight="medium" color="blue.900" mb={1}>
                  Brand Name
                </Text>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter your brand name"
                  required
                  focusBorderColor="blue.500"
                />
              </Box>
              <Box w="100%">
                <Text as="label" htmlFor="keywords" fontSize="sm" fontWeight="medium" color="blue.900" mb={1}>
                  Keywords (one per line):
                </Text>
                <Textarea
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Enter keywords, one per line"
                  required
                  focusBorderColor="blue.500"
                  rows={5}
                />
              </Box>
              <Button
                type="submit"
                isLoading={isGenerating}
                loadingText="Generating..."
                w="100%"
                colorScheme="blue"
                fontWeight="bold"
                py={2}
                px={4}
                borderRadius="md"
                transition="all 0.3s"
                transform="auto"
                _hover={{ transform: "scale(1.05)" }}
                _focus={{ boxShadow: "outline" }}
              >
                Generate Report
              </Button>
            </VStack>
          </form>
        </Box>
      </Box>
    </Flex>
  );
}
