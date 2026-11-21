import './controllers/envController';
import connectMongoDB from './controllers/mongodb';
import App from './app';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

(async () => {
  try {
    console.log(`=> ${await connectMongoDB()}!`);
    const app = new App();
    await app.start();
  } catch (err) {
    console.error('Failed to start the server:', err.message);
    process.exit(1);
  }
})();
