import { useState, useCallback } from 'react';
import { Tab, TabList, Text, makeStyles, tokens, Card } from '@fluentui/react-components';
import { CompanySearch } from './CompanySearch';
import { FunctionService } from '@/services/function/FunctionService';
import type { FunctionDefinition } from '@/services/function/types';
import { LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import React from 'react';

const useStyles = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: tokens.spacingHorizontalL,
    height: '100vh',
    padding: tokens.spacingHorizontalL,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  mainContent: {
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    gap: tokens.spacingVerticalL,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: tokens.spacingHorizontalM,
  },
  metricCard: {
    padding: tokens.spacingVerticalM,
    textAlign: 'center',
  },
  chartContainer: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    marginBottom: tokens.spacingVerticalS,
  }
});

export const CompanyManager: React.FC = () => {
  const styles = useStyles();
  const [functions, setFunctions] = useState<FunctionDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  const loadFunctions = useCallback(async () => {
    try {
      const loadedFunctions = await FunctionService.getUserFunctions();
      if (Array.isArray(loadedFunctions)) {
        setFunctions(loadedFunctions);
      } else {
        console.error('Received non-array response from getUserFunctions');
        setFunctions([]);
      }
    } catch (error) {
      setError('Failed to load functions. Please try again.');
      console.error("Error loading functions:", error);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <CompanySearch />
        <TabList 
          vertical 
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as string)}
        >
          <Tab value="overview">Overview</Tab>
          <Tab value="financials">Financials</Tab>
          <Tab value="peers">Peer Analysis</Tab>
          <Tab value="news">Recent News</Tab>
        </TabList>
      </div>
      
      <div className={styles.mainContent}>
        <Text as="h1" size={800}>Company Research</Text>
        
        <div className={styles.metricsGrid}>
          <Card className={styles.metricCard}>
            <Text size={400}>Revenue</Text>
            <Text size={800}>$1.2B</Text>
            <Text size={200}>+12% YoY</Text>
          </Card>
          <Card className={styles.metricCard}>
            <Text size={400}>Market Cap</Text>
            <Text size={800}>$5.6B</Text>
            <Text size={200}>+8% MTD</Text>
          </Card>
          <Card className={styles.metricCard}>
            <Text size={400}>EBITDA Margin</Text>
            <Text size={800}>23.5%</Text>
            <Text size={200}>+2.1pp YoY</Text>
          </Card>
        </div>
        
        <div className={styles.chartContainer}>
          <LineChart width={800} height={300}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </div>

        {error && <Text className={styles.errorMessage}>{error}</Text>}
      </div>
    </div>
  );
};