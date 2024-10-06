'use client'

import { useState } from 'react'
import { 
  Button, 
  Input, 
  Textarea, 
  Flex, 
  Box, 
  Heading, 
  Text, 
  Link as ChakraLink,
  VStack
} from '@chakra-ui/react'
import Link from 'next/link'

export default function BrandRankChecker() {
  const [brandName, setBrandName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    alert('Report generated! (This is a placeholder)')
  }

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
                loadingText="Analyzing..."
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
                Analyze Brand Ranking
              </Button>
            </VStack>
          </form>
        </Box>
      </Box>
    </Flex>
  )
}