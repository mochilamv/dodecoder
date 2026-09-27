import './styles/main.css';
import { DoDecoderApp } from './ui/app';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('Application root element (#app) not found');
  }

  // Initialize client-side DoDecoder anti-forensics application
  new DoDecoderApp(root);
});
