import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../components/App';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { useEffect, useState } from 'react';

const TaskPane: React.FC = () => {
  const [theme, setTheme] = useState(webLightTheme);

  useEffect(() => {
    // Get initial theme
    const officeTheme = Office.context.officeTheme;
    setTheme(officeTheme?.bodyBackgroundColor === '#000000' ? webDarkTheme : webLightTheme);

    // Set up theme change listener using the documented API
    Office.context.document.settings.addHandlerAsync(
      Office.EventType.SettingsChanged,
      () => {
        const updatedTheme = Office.context.officeTheme;
        setTheme(updatedTheme?.bodyBackgroundColor === '#000000' ? webDarkTheme : webLightTheme);
      }
    );
  }, []);

  return (
    <FluentProvider theme={theme}>
      <App />
    </FluentProvider>
  );
};

/* Initialize the taskpane */
Office.onReady(({ host }) => {
  if (host === Office.HostType.Excel) {
    const container = document.getElementById('root');
    if (!container) throw new Error('Root element not found');
    
    const root = createRoot(container);
    root.render(<TaskPane />);
  } else {
    const container = document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(
        <FluentProvider theme={webLightTheme}>
          <div>
            <h2>This add-in requires Excel to run.</h2>
          </div>
        </FluentProvider>
      );
    }
  }
});

/* Enable hot module replacement */
if ((module as any).hot) {
  (module as any).hot.accept('../components/App', () => {
    const NextApp = require('../components/App').App;
    const container = document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(<TaskPane />);
    }
  });
}