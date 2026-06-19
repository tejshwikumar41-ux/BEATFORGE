import { App } from './App';

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start().catch((err) => {
    console.error('Error starting Studio Pro:', err);
  });
});
