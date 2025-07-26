import { POST } from '@/app/api/chat/route';

// Mock the HfInference module
jest.mock('@huggingface/inference', () => ({
  HfInference: jest.fn(),
}));

describe('Chat API Route', () => {
  let mockClient;
  let mockStream;
  let consoleErrorSpy;

  beforeEach(() => {
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock TransformStream
    global.TransformStream = jest.fn().mockImplementation(() => ({
      writable: {
        getWriter: jest.fn().mockReturnValue({
          write: jest.fn(),
          close: jest.fn(),
        }),
      },
      readable: {},
    }));

    // Mock TextEncoder
    global.TextEncoder = jest.fn().mockImplementation(() => ({
      encode: jest.fn((text) => new Uint8Array(Buffer.from(text))),
    }));

    // Mock the HfInference client
    mockClient = {
      chatCompletionStream: jest.fn(),
    };
    
    const { HfInference } = require('@huggingface/inference');
    HfInference.mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('should process chat messages and stream responses successfully', async () => {
    const mockMessages = [{ role: 'user', content: 'Hello' }];
    
    // Mock the async iterator for streaming
    const mockChunks = [
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: ' world!' } }] },
    ];

    // Create an async iterator
    const asyncIterator = (async function* () {
      for (const chunk of mockChunks) {
        yield chunk;
      }
    })();

    mockClient.chatCompletionStream.mockResolvedValue(asyncIterator);

    const req = {
      json: jest.fn().mockResolvedValue({ messages: mockMessages }),
    };

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(mockClient.chatCompletionStream).toHaveBeenCalledWith({
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      messages: mockMessages,
      max_tokens: 500,
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('API Error');
    
    // Mock the client to throw an error when chatCompletionStream is called
    mockClient.chatCompletionStream.mockImplementation(() => {
      throw mockError;
    });

    const req = {
      json: jest.fn().mockResolvedValue({ messages: [] }),
    };

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process request');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during API call:', mockError);
  });

  it('should handle streaming errors gracefully', async () => {
    const mockError = new Error('Streaming Error');
    
    // Mock the client to return an async iterator that throws
    const asyncIterator = (async function* () {
      throw mockError;
    })();

    mockClient.chatCompletionStream.mockResolvedValue(asyncIterator);

    const req = {
      json: jest.fn().mockResolvedValue({ messages: [{ role: 'user', content: 'Test' }] }),
    };

    const response = await POST(req);

    // The response should still be 200 because the error is caught in the streaming part
    expect(response.status).toBe(200);
  });

  it('should handle empty messages array', async () => {
    const mockMessages = [];
    
    const asyncIterator = (async function* () {
      yield { choices: [{ delta: { content: 'Response' } }] };
    })();

    mockClient.chatCompletionStream.mockResolvedValue(asyncIterator);

    const req = {
      json: jest.fn().mockResolvedValue({ messages: mockMessages }),
    };

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mockClient.chatCompletionStream).toHaveBeenCalledWith({
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      messages: mockMessages,
      max_tokens: 500,
    });
  });

  it('should handle chunks without content', async () => {
    const mockMessages = [{ role: 'user', content: 'Test' }];
    
    const asyncIterator = (async function* () {
      yield { choices: [{ delta: {} }] }; // No content
      yield { choices: [{ delta: { content: 'Response' } }] };
    })();

    mockClient.chatCompletionStream.mockResolvedValue(asyncIterator);

    const req = {
      json: jest.fn().mockResolvedValue({ messages: mockMessages }),
    };

    const response = await POST(req);

    expect(response.status).toBe(200);
  });

  it('should handle missing choices in chunk', async () => {
    const mockMessages = [{ role: 'user', content: 'Test' }];
    
    const asyncIterator = (async function* () {
      yield { choices: [{ delta: { content: 'Response' } }] };
      yield {}; // No choices
    })();

    mockClient.chatCompletionStream.mockResolvedValue(asyncIterator);

    const req = {
      json: jest.fn().mockResolvedValue({ messages: mockMessages }),
    };

    const response = await POST(req);

    expect(response.status).toBe(200);
  });
});
