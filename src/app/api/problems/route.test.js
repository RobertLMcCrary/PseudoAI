/**
 * @jest-environment node
 */
import { GET } from '@/app/api/problems/route';

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });
  
// Mock MongoDB
jest.mock('mongodb', () => {
  const mCollection = {
    find: jest.fn(() => ({
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
  // The constructor returns an object with a connect method
  const MongoClient = jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(mClient),
  }));
  // Attach the shared mocks for test access
  MongoClient.__mClient = mClient;
  MongoClient.__mDb = mDb;
  MongoClient.__mCollection = mCollection;
  return { MongoClient };
});

describe('Problems API Route', () => {
  const mockProblems = [
    { id: '1', title: 'Problem 1' },
    { id: '2', title: 'Problem 2' },
  ];

  beforeEach(() => {
    // Reset all mock calls and implementations
    const { MongoClient } = require('mongodb');
    MongoClient.mockClear();
    MongoClient.__mClient.db.mockClear();
    MongoClient.__mDb.collection.mockClear();
    MongoClient.__mCollection.find.mockClear();
  });

  it('should return all problems', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.__mCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockProblems),
    });

    const response = await GET({});
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockProblems);
  });

  it('should handle errors gracefully', async () => {
    const { MongoClient } = require('mongodb');
    // Make the connect method throw an error
    MongoClient.mockImplementation(() => ({
      connect: jest.fn().mockRejectedValue(new Error('DB error')),
    }));

    const response = await GET({});
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/failed to fetch problems/i);
  });
});