import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../src/styles/index.scss';
import '../src/styles/App.scss';

// Find the root element in the public/index.html file
const rootElement = document.getElementById('root');

if (rootElement) {
    // Create a React root and render the main App component
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Failed to find the root element with id 'root'. Check your index.html file.");
}
