import * as React from 'react';
import { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { CompanyManager } from './CompanyManager';
import { FunctionManagerUI as FunctionManager } from './FunctionManager/FunctionManager';
import { ShortcutManager } from './ShortcutsManager';
import { Navbar } from './Navbar';
import { ErrorProvider } from '../errors';
import { ErrorBoundary } from '../ErrorBoundary';
import { errorLogger } from '../errors';
import { AppError } from '../errors';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
  }
});

export const App: React.FC = () => {
  const styles = useStyles();
  const [currentView, setCurrentView] = useState('company-snapshot');

  const handleError = (error: AppError) => {
    errorLogger.log(error);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'company-snapshot':
        return <CompanyManager />;
      case 'functions':
        return <FunctionManager />;
      case 'shortcuts-manager':
        return <ShortcutManager />;
      case 'markets-data':
        return <div>Markets Data - Coming Soon</div>;
      case 'models':
        return <div>Models - Coming Soon</div>;
      case 'settings':
        return <div>Settings - Coming Soon</div>;
      default:
        return <CompanyManager />;
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      <ErrorProvider>
        <div className={styles.root}>
          <Navbar 
            onNavigate={setCurrentView} 
            selectedKey={currentView} 
          />
          <main className={styles.content}>
            {renderContent()}
          </main>
        </div>
      </ErrorProvider>
    </ErrorBoundary>
  );
};