/**
 * @jest-environment node
 */
import { GET } from '@/app/api/problems/[id]/route';

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });
  
// Robust MongoClient mock
jest.mock('mongodb', () => {
  // Shared mock objects for all tests
  const mCollection = {
    findOne: jest.fn(),
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

describe('Problems API Route [id]', () => {
  const mockProblem = {
    id: 'two-sum',
    title: 'Two Sum',
    description: 'Find two numbers that add up to target.',
  };

  beforeEach(() => {
    // Reset all mock calls and implementations
    const { MongoClient } = require('mongodb');
    MongoClient.mockClear();
    MongoClient.__mClient.db.mockClear();
    MongoClient.__mDb.collection.mockClear();
    MongoClient.__mCollection.findOne.mockClear();
  });

  it('should return a problem if found', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.__mCollection.findOne.mockResolvedValue(mockProblem);

    const context = { params: { id: 'two-sum' } };
    const response = await GET({}, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockProblem);
  });

  it('should return 404 if problem not found', async () => {
    const { MongoClient } = require('mongodb');
    MongoClient.__mCollection.findOne.mockResolvedValue(null);

    const context = { params: { id: 'not-exist' } };
    const response = await GET({}, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });

  it('should handle errors gracefully', async () => {
    const { MongoClient } = require('mongodb');
    // Make the connect method throw an error
    MongoClient.mockImplementation(() => ({
      connect: jest.fn().mockRejectedValue(new Error('DB error')),
    }));

    const context = { params: { id: 'two-sum' } };
    const response = await GET({}, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/internal server error/i);
  });
});