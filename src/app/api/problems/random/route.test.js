/**
 * @jest-environment node
 */
import { GET } from '@/app/api/problems/random/route';

// Mock MongoDB
jest.mock('mongodb', () => {
  const mCollection = {
    aggregate: jest.fn(() => ({
      toArray: jest.fn(),
    })),
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
      connect: jest.fn(() => Promise.resolve(mClient)),
    },
  };
});

describe('Problems API Route /random', () => {
  const mockProblem = {
    id: 'random-problem',
    title: 'Random Problem',
    description: 'A random problem for testing.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a random problem', async () => {
    const { MongoClient } = require('mongodb');
    // Mock the aggregate().toArray() chain to return the mock problem
    MongoClient.connect.mockResolvedValue({
      db: () => ({
        collection: () => ({
          aggregate: () => ({
            toArray: () => Promise.resolve([mockProblem]),
          }),
        }),
      }),
      close: jest.fn(),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockProblem);
  });

  it('should handle errors gracefully', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.connect.mockRejectedValue(new Error('DB error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/failed to fetch random problem/i);
  });
});