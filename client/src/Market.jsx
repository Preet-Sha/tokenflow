import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Brain, 
  Cpu, 
  Atom, 
  Rocket, 
  StarHalf 
} from 'lucide-react';

const aiTokens = [
  {
    id: 1,
    name: 'Claude',
    logo: <Brain className="w-12 h-12 text-blue-400" />,
    totalTokens: 1000000,
    costPerToken: 0.15,
    sellers: ['Anthropic Inc.'],
    description: 'Advanced conversational AI with strong reasoning capabilities'
  },
  {
    id: 2,
    name: 'GPT',
    logo: <Cpu className="w-12 h-12 text-green-400" />,
    totalTokens: 5000000,
    costPerToken: 0.20,
    sellers: ['OpenAI LLC'],
    description: 'Powerful language model with wide-ranging capabilities'
  },
  {
    id: 3,
    name: 'Gemini',
    logo: <Atom className="w-12 h-12 text-purple-400" />,
    totalTokens: 2500000,
    costPerToken: 0.18,
    sellers: ['Google AI'],
    description: 'Multimodal AI with advanced reasoning skills'
  },
  {
    id: 4,
    name: 'Perplexity',
    logo: <Cloud className="w-12 h-12 text-indigo-400" />,
    totalTokens: 750000,
    costPerToken: 0.25,
    sellers: ['Perplexity AI'],
    description: 'AI-powered search and information retrieval'
  },
  {
    id: 5,
    name: 'Grok',
    logo: <Rocket className="w-12 h-12 text-red-400" />,
    totalTokens: 500000,
    costPerToken: 0.30,
    sellers: ['xAI'],
    description: 'Rebellious and witty AI with unique personality'
  },
  {
    id: 6,
    name: 'LLaMA',
    logo: <StarHalf className="w-12 h-12 text-orange-400" />,
    totalTokens: 1500000,
    costPerToken: 0.16,
    sellers: ['Meta AI'],
    description: 'Open-source large language model'
  }
];

const AITokenMarketplace = () => {
  const [tokens, setTokens] = useState(aiTokens);

  return (
    <div className="bg-gray-900 min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          AI Token Marketplace
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <Card key={token.id} className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="flex flex-row items-center space-x-4">
                {token.logo}
                <CardTitle className="text-2xl">{token.name} Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">{token.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Total Tokens</p>
                      <p className="font-bold">{token.totalTokens.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cost per Token</p>
                      <p className="font-bold text-green-400">${token.costPerToken.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Sellers</p>
                    <div className="flex space-x-2">
                      {token.sellers.map((seller) => (
                        <span 
                          key={seller} 
                          className="bg-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {seller}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Buy Tokens
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITokenMarketplace;