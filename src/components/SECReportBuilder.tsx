import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Button,
  makeStyles,
  tokens,
  Text,
  TabList,
  Tab,
  MessageBar,
  MessageBarBody,
  Label,
} from '@fluentui/react-components';
import { Alert24Regular, DocumentPdf24Regular, Receipt24Regular } from '@fluentui/react-icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import React from 'react';

interface ValidationAlert {
  severity: 'warning' | 'error';
  message: string;
  category: 'ratio' | 'variance' | 'peer' | 'input';
  details: string;
}

interface FinancialMetric {
  period: string;
  value: number;
  previousValue?: number;
  variance?: number;
}

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  alert: {
    marginBottom: tokens.spacingVerticalM,
  },
  chartContainer: {
    marginTop: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  metricCard: {
    padding: tokens.spacingVerticalM,
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  }
});

export const SECReportBuilder = () => {
  const styles = useStyles();
  const [selectedView, setSelectedView] = useState('input');
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [alerts, setAlerts] = useState<ValidationAlert[]>([]);

  const mockData = [
    { period: 'Q1', value: 1200000, previousValue: 1000000 },
    { period: 'Q2', value: 1350000, previousValue: 1100000 },
    { period: 'Q3', value: 1500000, previousValue: 1250000 },
    { period: 'Q4', value: 1800000, previousValue: 1400000 },
  ];

  useEffect(() => {
    setMetrics(mockData);
  }, []);

  const validateMetrics = useCallback(() => {
    const newAlerts: ValidationAlert[] = [];
    
    metrics.forEach(metric => {
      if (metric.value < 0) {
        newAlerts.push({
          severity: 'error',
          message: 'Negative Value Detected',
          category: 'input',
          details: `Period ${metric.period} has negative value`
        });
      }

      const variance = metric.previousValue ? 
        (metric.value - metric.previousValue) / metric.previousValue : 0;
      
      if (Math.abs(variance) > 0.5) {
        newAlerts.push({
          severity: 'warning',
          message: 'Large Variance',
          category: 'variance',
          details: `${metric.period} shows ${(variance * 100).toFixed(1)}% change`
        });
      }
    });

    setAlerts(newAlerts);
  }, [metrics]);

  return (
    <div className={styles.container}>
      <Text as="h1" size={800}>SEC Filing Builder</Text>

      <TabList selectedValue={selectedView} onTabSelect={(_, data) => setSelectedView(data.value as string)}>
        <Tab value="input">Data Input</Tab>
        <Tab value="validation">Validation</Tab>
        <Tab value="preview">Filing Preview</Tab>
      </TabList>

      {alerts.map((alert, index) => (
        <MessageBar
          key={index}
          intent={alert.severity === 'error' ? 'error' : 'warning'}
          icon={<Alert24Regular />}
          className={styles.alert}
        >
          <MessageBarBody>
            <Text weight="semibold">{alert.message}</Text>
            <Text>{alert.details}</Text>
          </MessageBarBody>
        </MessageBar>
      ))}

      <div className={styles.metricsGrid}>
        <Card className={styles.metricCard}>
          <Text size={400}>Total Revenue</Text>
          <Text size={800}>${(metrics[metrics.length - 1]?.value / 1e6).toFixed(1)}M</Text>
          <Text size={200}>Previous: ${(metrics[metrics.length - 1]?.previousValue ?? 0 / 1e6).toFixed(1)}M</Text>
        </Card>
        <Card className={styles.metricCard}>
          <Text size={400}>YoY Growth</Text>
          <Text size={800}>
          <Text size={800}>
  {metrics.length && metrics[metrics.length - 1]?.previousValue 
    ? (((metrics[metrics.length - 1]?.value ?? 0) / (metrics[metrics.length - 1]?.previousValue ?? 1) - 1) * 100).toFixed(1)
    : 'N/A'}%
</Text>          </Text>
        </Card>
        <Card className={styles.metricCard}>
          <Text size={400}>Validation Status</Text>
          <Text size={800} style={{ color: alerts.length ? 'red' : 'green' }}>
            {alerts.length ? `${alerts.length} Issues` : 'Valid'}
          </Text>
        </Card>
      </div>

      <Card className={styles.chartContainer}>
        <LineChart width={800} height={300} data={metrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip formatter={(value) => `$${(value as number / 1e6).toFixed(1)}M`} />
          <Legend />
          <Line type="monotone" dataKey="value" name="Current" stroke="#8884d8" />
          <Line type="monotone" dataKey="previousValue" name="Previous" stroke="#82ca9d" />
        </LineChart>
      </Card>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          icon={<Receipt24Regular />}
          onClick={validateMetrics}
        >
          Validate Filing
        </Button>
        <Button
          appearance="secondary"
          icon={<DocumentPdf24Regular />}
          disabled={alerts.some(a => a.severity === 'error')}
        >
          Export to PDF
        </Button>
      </div>
    </div>
  );
};

export default SECReportBuilder;