import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TabList,
  Tab,
  makeStyles,
  tokens,
  Text,
  Button,
  Select,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DatabaseService } from '@/services/database/DatabaseService';

type TimeView = 'quarterly' | 'annual' | 'ttm';

interface MetricData {
  companyId: string;
  companyName: string;
  revenue: number;
  ebitda: number;
  netIncome: number;
  marketCap: number;
  enterpriseValue: number;
  evToRevenue: number;
  evToEbitda: number;
  peRatio: number;
  grossMargin: number;
  ebitdaMargin: number;
  netMargin: number;
  period: string;
}

interface ChartData {
  name: string;
  value: number;
  average: number;
}

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
  },
  controls: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalL,
  },
  chartWrapper: {
    height: '400px',
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
  table: {
    marginTop: tokens.spacingVerticalL,
  }
});

export const ComparablesManager: React.FC = () => {
  const styles = useStyles();
  const [timeView, setTimeView] = useState<TimeView>('ttm');
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('evToRevenue');
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = DatabaseService.getInstance();
      const query = getMetricsQuery(timeView);
      const result = await db.executeQuery(query);
      setMetrics(result.rows);
      updateChartData(result.rows, selectedMetric);
    } catch (err) {
      setError('Failed to load metrics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [timeView, selectedMetric]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const updateChartData = (data: MetricData[], metricKey: string) => {
    const chartData = data.map(item => ({
      name: item.companyName,
      value: item[metricKey as keyof MetricData] as number,
      average: data.reduce((acc, curr) => acc + (curr[metricKey as keyof MetricData] as number), 0) / data.length
    }));
    setChartData(chartData);
  };

  const getMetricsQuery = (view: TimeView) => {
    const baseQuery = `
      SELECT 
        company_id, company_name, revenue, ebitda, net_income,
        market_cap, enterprise_value,
        ROUND(CAST(enterprise_value as DECIMAL) / NULLIF(revenue, 0), 2) as ev_to_revenue,
        ROUND(CAST(enterprise_value as DECIMAL) / NULLIF(ebitda, 0), 2) as ev_to_ebitda,
        ROUND(CAST(market_cap as DECIMAL) / NULLIF(net_income, 0), 2) as pe_ratio,
        ROUND(gross_profit * 100.0 / NULLIF(revenue, 0), 1) as gross_margin,
        ROUND(ebitda * 100.0 / NULLIF(revenue, 0), 1) as ebitda_margin,
        ROUND(net_income * 100.0 / NULLIF(revenue, 0), 1) as net_margin,
        period
    `;

    switch (view) {
      case 'quarterly':
        return `${baseQuery} FROM quarterly_metrics ORDER BY period DESC`;
      case 'annual':
        return `${baseQuery} FROM annual_metrics ORDER BY period DESC`;
      case 'ttm':
        return `${baseQuery} FROM ttm_metrics`;
    }
  };

  const formatValue = (value: number, type: string): string => {
    if (value === null || isNaN(value)) return 'N/A';
    
    if (type.includes('margin')) {
      return `${value.toFixed(1)}%`;
    }
    
    if (type.includes('ratio') || type.startsWith('ev')) {
      return value.toFixed(2);
    }
    
    return `$${(value / 1e6).toFixed(1)}M`;
  };

  if (loading) return <Spinner />;

  return (
    <div className={styles.container}>
      <Text as="h1" size={800}>Comparables Analysis</Text>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.controls}>
        <TabList selectedValue={timeView} onTabSelect={(_, data) => setTimeView(data.value as TimeView)}>
          <Tab value="quarterly">Quarterly</Tab>
          <Tab value="annual">Annual</Tab>
          <Tab value="ttm">TTM</Tab>
        </TabList>
        <Select
          value={selectedMetric}
          onChange={(_, data) => setSelectedMetric(data.value)}
        >
          <option value="evToRevenue">EV/Revenue</option>
          <option value="evToEbitda">EV/EBITDA</option>
          <option value="peRatio">P/E Ratio</option>
        </Select>
        <Button appearance="primary" onClick={loadMetrics}>Update</Button>
      </div>

      <div className={styles.summaryMetrics}>
        <Card className={styles.metricCard}>
          <Text size={400}>Average EV/Revenue</Text>
          <Text size={800}>{formatValue(chartData[0]?.average || 0, 'ratio')}</Text>
        </Card>
        <Card className={styles.metricCard}>
          <Text size={400}>Median EBITDA Margin</Text>
          <Text size={800}>
            {formatValue(
              metrics.map(m => m.ebitdaMargin)
                .sort((a, b) => a - b)[Math.floor(metrics.length / 2)] || 0,
              'margin'
            )}
          </Text>
        </Card>
        <Card className={styles.metricCard}>
          <Text size={400}>Companies</Text>
          <Text size={800}>{metrics.length}</Text>
        </Card>
      </div>

      <div className={styles.chartsContainer}>
        <Card className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Value" />
              <Bar dataKey="average" fill="#82ca9d" name="Average" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="companyName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="grossMargin" fill="#8884d8" name="Gross Margin %" />
              <Bar dataKey="ebitdaMargin" fill="#82ca9d" name="EBITDA Margin %" />
              <Bar dataKey="netMargin" fill="#ffc658" name="Net Margin %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Company</TableHeaderCell>
            <TableHeaderCell>Revenue</TableHeaderCell>
            <TableHeaderCell>EBITDA Margin</TableHeaderCell>
            <TableHeaderCell>EV/Revenue</TableHeaderCell>
            <TableHeaderCell>EV/EBITDA</TableHeaderCell>
            <TableHeaderCell>P/E</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((company) => (
            <TableRow key={company.companyId}>
              <TableCell>{company.companyName}</TableCell>
              <TableCell>{formatValue(company.revenue, 'currency')}</TableCell>
              <TableCell>{formatValue(company.ebitdaMargin, 'margin')}</TableCell>
              <TableCell>{formatValue(company.evToRevenue, 'ratio')}</TableCell>
              <TableCell>{formatValue(company.evToEbitda, 'ratio')}</TableCell>
              <TableCell>{formatValue(company.peRatio, 'ratio')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};