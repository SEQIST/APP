// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Fehler abgefangen:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Ein Fehler ist aufgetreten</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;