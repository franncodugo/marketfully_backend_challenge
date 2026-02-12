import app from './app';

const PORT = 3000;

const start = async () => {
    try {
        // host: '0.0.0.0' for docker o external access.
        await app.listen({ port: PORT, host: '0.0.0.0' });
        
        console.log(`Server listening on http://localhost:${PORT}`);
        console.log(`Documentation available at http://localhost:${PORT}/docs`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();