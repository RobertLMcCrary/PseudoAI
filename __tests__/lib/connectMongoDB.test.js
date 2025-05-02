//testing the connection to mongodb for problems database
const mongoose = require('mongoose');
const connectMongoDB = require('../../lib/mongodb').default;

jest.mock('mongoose', () => ({
    connect: jest.fn(),
}));

describe('Connecting to MongoDB', () => {
    const originalExit = process.exit;
    let consoleLogSpy, consoleErrorSpy;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        process.exit = jest.fn(); // Mock process.exit
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.exit = originalExit; // Restore process.exit
    });

    it('should connect to MongoDB and log a success message', async () => {
        mongoose.connect.mockResolvedValueOnce(); // Simulate successful connection

        await connectMongoDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MongoDB');
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
    });

    it('should log an error and exit process on connection failure', async () => {
        const error = new Error('Connection failed');
        mongoose.connect.mockRejectedValueOnce(error); // Simulate failed connection

        await connectMongoDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error connecting to MongoDB:',
            error
        );
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });
});
