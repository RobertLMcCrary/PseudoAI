import { POST } from '@/app/api/code/route';
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });
  
// Mock MongoDB
jest.mock('mongodb', () => {
  const mCollection = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };
  const mDb = {
    collection: jest.fn(() => mCollection),
  };
  const mClient = {
    db: jest.fn(() => mDb),
    close: jest.fn(),
  };
  return {
    MongoClient: {
      connect: jest.fn(() => mClient),
    },
  };
});

describe('Code API Route', () => {
  const mockProblem = {
    id: 'two-sum',
    functionCalls: {
      javascript: 'return twoSum(input.nums, input.target);',
      python: 'return two_sum(input.nums, input.target)',
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, output: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, output: [1, 2] },
    ],
    difficulty: 'Easy',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run JavaScript code and return results', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.connect.mockResolvedValue({
      db: () => ({
        collection: () => ({
          findOne: jest.fn().mockResolvedValue(mockProblem),
          updateOne: jest.fn(),
        }),
      }),
      close: jest.fn(),
    });

    const req = {
      json: jest.fn().mockResolvedValue({
        code: `
          function twoSum(nums, target) {
            for (let i = 0; i < nums.length; i++) {
              for (let j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] === target) return [i, j];
              }
            }
          }
        `,
        language: 'javascript',
        problemId: 'two-sum',
        userId: 'user123',
      }),
    };

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toBeDefined();
    expect(data.results.every(r => r.passed)).toBe(true);
  });

  it('should return pythonResults for Python code', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.connect.mockResolvedValue({
      db: () => ({
        collection: () => ({
          findOne: jest.fn().mockResolvedValue(mockProblem),
          updateOne: jest.fn(),
        }),
      }),
      close: jest.fn(),
    });

    const req = {
      json: jest.fn().mockResolvedValue({
        code: '',
        language: 'python',
        problemId: 'two-sum',
        userId: 'user123',
        pythonResults: [
          { testCase: 1, passed: true },
          { testCase: 2, passed: true },
        ],
      }),
    };

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([
      { testCase: 1, passed: true },
      { testCase: 2, passed: true },
    ]);
  });

  it('should handle problem not found', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.connect.mockResolvedValue({
      db: () => ({
        collection: () => ({
          findOne: jest.fn().mockResolvedValue(null),
        }),
      }),
      close: jest.fn(),
    });

    const req = {
      json: jest.fn().mockResolvedValue({
        code: '',
        language: 'javascript',
        problemId: 'not-exist',
        userId: 'user123',
      }),
    };

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results[0].passed).toBe(false);
    expect(data.results[0].error).toMatch(/Failed to execute code/);
  });

  it('should handle function call not found', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.connect.mockResolvedValue({
      db: () => ({
        collection: () => ({
          findOne: jest.fn().mockResolvedValue({
            ...mockProblem,
            functionCalls: {},
          }),
        }),
      }),
      close: jest.fn(),
    });

    const req = {
      json: jest.fn().mockResolvedValue({
        code: '',
        language: 'javascript',
        problemId: 'two-sum',
        userId: 'user123',
      }),
    };

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results[0].passed).toBe(false);
    expect(data.results[0].error).toMatch(/Failed to execute code/);
  });
});