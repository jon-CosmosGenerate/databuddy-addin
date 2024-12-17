import { useState, useCallback, useEffect } from 'react';
import { 
  Card,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
  tokens,
  Text,
  TabList,
  Tab,
  MessageBar,
  MessageBarBody,
  Button,
} from '@fluentui/react-components';
import { 
  LineChart, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { DatabaseService } from '../services/database/DatabaseService';
import { Alert24Regular, ArrowTrendingLines24Regular } from '@fluentui/react-icons';
import React from 'react';

interface RedFlag {
  category: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  metric: number;
  industryMedian: number;
  deviation: number;
  trend?: number[];
}

interface CompanyMetrics {
  otherAssetsRatio: number;
  otherLiabilitiesRatio: number;
  otherIncomeRatio: number;
  otherExpensesRatio: number;
  daysReceivables: number;
  daysInventory: number;
  grossMargin: number;
  revenueGrowth: number;
}

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
  },
  flagsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacingVerticalS,
  },
  severity: {
    high: { backgroundColor: tokens.colorPaletteRedBackground1 },
    medium: { backgroundColor: tokens.colorPaletteYellowBackground1 },
    low: { backgroundColor: tokens.colorPaletteGreenBackground1 },
  },
  chart: {
    marginTop: tokens.spacingVerticalM,
    height: '200px',
  },
  summaryMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  metricCard: {
    padding: tokens.spacingVerticalM,
    textAlign: 'center',
  },
});

export const RedFlagsAnalyzer: React.FC = () => {
  const styles = useStyles();
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('ttm');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  const analyzeMetrics = useCallback(async (companyId: string) => {
    const db = DatabaseService.getInstance();
    const query = `
      WITH company_metrics AS (
        SELECT * FROM financial_metrics 
        WHERE company_id = $1 
        ORDER BY period DESC
        LIMIT 8
      ),
      industry_metrics AS (
        SELECT 
          period,
          AVG(metric_value) as industry_avg,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as industry_median
        FROM financial_metrics
        GROUP BY period
      )
      SELECT 
        cm.*,
        im.industry_avg,
        im.industry_median
      FROM company_metrics cm
      JOIN industry_metrics im USING (period)
      ORDER BY period ASC
    `;

    try {
      const result = await db.executeQuery(query, [companyId]);
      const metrics = result.rows;
      
      setHistoricalData(metrics.map((m: any) => ({
        period: m.period,
        companyValue: m.metric_value,
        industryMedian: m.industry_median,
      })));

      const flags = analyzeResults(metrics);
      setRedFlags(flags);
    } catch (error) {
      console.error('Error analyzing metrics:', error);
    }
  }, []);

  const analyzeResults = (metrics: any[]): RedFlag[] => {
    const flags: RedFlag[] = [];
    const latestMetrics = metrics[metrics.length - 1];
    
    // Add trend analysis to the flags
    const addFlagWithTrend = (category: string, value: number, median: number, trend: number[]) => {
      const deviation = (value - median) / median;
      const severity = Math.abs(deviation) > 0.5 ? 'high' : 
                      Math.abs(deviation) > 0.3 ? 'medium' : 'low';
      
      flags.push({
        category,
        severity,
        description: `${category} deviates significantly from industry median`,
        metric: value,
        industryMedian: median,
        deviation: deviation * 100,
        trend,
      });
    };

    // Analyze each metric
    Object.keys(latestMetrics).forEach(metric => {
      if (metric.endsWith('_ratio')) {
        const trend = metrics.map(m => m[metric]);
        addFlagWithTrend(
          metric.replace('_ratio', '').replace(/_/g, ' '),
          latestMetrics[metric],
          latestMetrics.industry_median,
          trend
        );
      }
    });

    return flags;
  };

  return (
    <div className={styles.container}>
      <Text as="h1" size={800}>Red Flags Analysis</Text>

      <div className={styles.summaryMetrics}>
        <Card className={styles.metricCard}>
          <Text size={400}>Critical Flags</Text>
          <Text size={800} style={{ color: tokens.colorPaletteRedForeground1 }}>
            {redFlags.filter(f => f.severity === 'high').length}
          </Text>
        </Card>
        <Card className={styles.metricCard}>
          <Text size={400}>Warning Flags</Text>
          <Text size={800} style={{ color: tokens.colorPaletteYellowForeground1 }}>
            {redFlags.filter(f => f.severity === 'medium').length}
          </Text>
        </Card>
        <Card className={styles.metricCard}>
          <Text size={400}>Total Deviations</Text>
          <Text size={800}>
            {redFlags.length}
          </Text>
        </Card>
      </div>

      <TabList selectedValue={selectedPeriod} onTabSelect={(_, data) => setSelectedPeriod(data.value as string)}>
        <Tab value="ttm">TTM</Tab>
        <Tab value="quarterly">Quarterly</Tab>
        <Tab value="annual">Annual</Tab>
      </TabList>
      
      <div className={styles.flagsGrid}>
        {redFlags.map((flag, index) => (
          <Card key={index}>
            <div className={styles.metric}>
              <Text weight="bold">{flag.category}</Text>
              <MessageBar
                intent={flag.severity === 'high' ? 'error' : 
                       flag.severity === 'medium' ? 'warning' : 'success'}
                icon={<Alert24Regular />}
              >
                <MessageBarBody>{flag.severity.toUpperCase()}</MessageBarBody>
              </MessageBar>
            </div>
            <Text>{flag.description}</Text>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Company Value</TableCell>
                  <TableCell>{flag.metric.toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Industry Median</TableCell>
                  <TableCell>{flag.industryMedian.toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Deviation</TableCell>
                  <TableCell>{flag.deviation > 0 ? '+' : ''}{flag.deviation.toFixed(1)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {flag.trend && (
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={flag.trend.map((value, i) => ({ period: i + 1, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Button 
        icon={<ArrowTrendingLines24Regular />}
        onClick={() => analyzeMetrics('example-id')}
        appearance="primary"
      >
        Refresh Analysis
      </Button>
    </div>
  );
};