// src/ErrorBoundary.tsx
import * as React from 'react';
import {
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Button,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { AppError } from './errors'; // Make sure this path matches your project structure

interface Props {
  children: React.ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  error: AppError | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    if (error instanceof AppError) {
      return { error };
    }
    return {
      error: new AppError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        'high',
        'unknown',
        error
      )
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(this.state.error!);
  }

  render() {
    if (this.state.error) {
      return (
        <MessageBar intent={this.state.error.severity === 'critical' ? 'error' : 'warning'}>
          <MessageBarTitle>{this.state.error.code}</MessageBarTitle>
          <MessageBarBody>
            {this.state.error.message}
            {this.state.error.severity === 'critical' && (
              <p>Please refresh the page or contact support if the issue persists.</p>
            )}
          </MessageBarBody>
          <Button
            icon={<Dismiss24Regular />}
            appearance="subtle"
            onClick={() => this.setState({ error: null })}
          />
        </MessageBar>
      );
    }

    return this.props.children;
  }
}