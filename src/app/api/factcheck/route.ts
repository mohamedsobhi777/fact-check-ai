import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface FactCheckResponse {
  verdict: string;
  explanation: string;
  sources: { url: string; snippet: string }[];
  articleTitle?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { claim, url } = await request.json();

    if (!claim && !url) {
      return NextResponse.json({ error: 'Either claim or URL must be provided' }, { status: 400 });
    }

    let factCheckContent = claim;
    let articleTitle = '';

    // If URL is provided, extract article content
    if (url) {
      try {
        const articleContent = await extractArticleContent(url);
        factCheckContent = articleContent.content;
        articleTitle = articleContent.title;
      } catch (error) {
        console.error('Failed to extract article content:', error);
        return NextResponse.json({ error: 'Failed to extract article content from the provided URL' }, { status: 400 });
      }
    }

    if (!factCheckContent || typeof factCheckContent !== 'string') {
      return NextResponse.json({ error: 'No valid content to fact-check' }, { status: 400 });
    }

    const perplexityResponse = await callPerplexityAPI(factCheckContent, url, articleTitle);
    
    if (perplexityResponse) {
      return NextResponse.json(perplexityResponse);
    }

    const anthropicResponse = await callAnthropicAPI(factCheckContent, url, articleTitle);
    
    if (anthropicResponse) {
      return NextResponse.json(anthropicResponse);
    }

    return NextResponse.json({ error: 'Both APIs failed' }, { status: 500 });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function extractArticleContent(url: string): Promise<{ content: string; title: string }> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    timeout: 10000
  });

  const $ = cheerio.load(response.data);

  // Remove script and style elements
  $('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share').remove();

  // Try to get title
  const title = $('title').text() || $('h1').first().text() || 'Article';

  // Try to extract main content using common selectors
  const contentSelectors = [
    'article',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content',
    'main',
    '.main-content',
    '[role="main"]'
  ];

  let content = '';
  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      break;
    }
  }

  // Fallback: get all paragraph text
  if (!content) {
    content = $('p').map((_, el) => $(el).text()).get().join(' ').trim();
  }

  // Final fallback: get body text
  if (!content) {
    content = $('body').text().replace(/\s+/g, ' ').trim();
  }

  if (content.length < 100) {
    throw new Error('Could not extract sufficient content from the article');
  }

  // Limit content length to avoid API limits
  if (content.length > 8000) {
    content = content.substring(0, 8000) + '...';
  }

  return {
    content,
    title: title.trim()
  };
}

async function callPerplexityAPI(content: string, sourceUrl?: string, articleTitle?: string): Promise<FactCheckResponse | null> {
  try {
    const isArticle = Boolean(sourceUrl);
    const contextInfo = isArticle 
      ? `This is content from an article titled "${articleTitle}" from ${sourceUrl}. `
      : 'This is a claim to fact-check. ';

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `You are a fact-checking AI. ${contextInfo}Analyze the content, verify against reliable sources, and return a verdict (True/False/Misleading/Mixed), a detailed explanation, and cited sources. If the content relates to cultural myths, highlight anthropological context. Format your response as JSON with keys: verdict, explanation, sources (array of objects with url and snippet).`
          },
          {
            role: 'user',
            content: `Fact-check this ${isArticle ? 'article content' : 'claim'}: ${content}`
          }
        ],
        max_tokens: 800,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseContent = response.data.choices[0].message.content;
    const result = parseFactCheckResponse(responseContent);
    
    if (articleTitle && result) {
      result.articleTitle = articleTitle;
    }
    
    return result;
    
  } catch (error) {
    console.error('Perplexity API error:', error);
    return null;
  }
}

async function callAnthropicAPI(content: string, sourceUrl?: string, articleTitle?: string): Promise<FactCheckResponse | null> {
  try {
    const isArticle = Boolean(sourceUrl);
    const contextInfo = isArticle 
      ? `This is content from an article titled "${articleTitle}" from ${sourceUrl}. `
      : 'This is a claim to fact-check. ';

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20241022',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: `${contextInfo}Fact-check this ${isArticle ? 'article content' : 'claim'}: ${content}. Provide a verdict (True/False/Misleading/Mixed), detailed explanation, and sources. Format as JSON with keys: verdict, explanation, sources (array with url and snippet).`
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      }
    );

    const responseContent = response.data.content[0].text;
    const result = parseFactCheckResponse(responseContent);
    
    if (articleTitle && result) {
      result.articleTitle = articleTitle;
    }
    
    return result;
    
  } catch (error) {
    console.error('Anthropic API error:', error);
    return null;
  }
}

function parseFactCheckResponse(content: string): FactCheckResponse {
  try {
    const parsed = JSON.parse(content);
    return {
      verdict: parsed.verdict || 'Unknown',
      explanation: parsed.explanation || 'No explanation available',
      sources: parsed.sources || []
    };
  } catch (error) {
    const verdictMatch = content.match(/verdict[:\s]*(True|False|Misleading)/i);
    const verdict = verdictMatch ? verdictMatch[1] : 'Unknown';
    
    const explanationMatch = content.match(/explanation[:\s]*(.+?)(?=sources|$)/is);
    const explanation = explanationMatch ? explanationMatch[1].trim() : content;
    
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];
    const sources = urls.map(url => ({ url, snippet: 'Source reference' }));
    
    return { verdict, explanation, sources };
  }
}