import * as React from 'react';
import { useState, useCallback } from 'react';
import { 
  Button,
  Text,
  makeStyles,
  tokens,
  ProgressBar,
  Card,
  CardHeader,
  CardPreview
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
  },
  buttonGroup: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    backgroundColor: tokens.colorPaletteRedBackground1,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
  },
  zoneItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  }
});

interface TemplateZone {
  id: string;
  name: string;
  range: string;
  dataType: "metrics" | "chart" | "info" | "table";
  format?: {
    headers: boolean;
    style: "default" | "highlight" | "minimal";
  };
}

export const TemplateDesigner: React.FC = () => {
  const styles = useStyles();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedZones, setSelectedZones] = useState<TemplateZone[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRangeSelection = useCallback(async () => {
    if (!isSelecting) return;

    try {
      await Excel.run(async (context) => {
        const range = context.workbook.getSelectedRange();
        range.load("address");
        await context.sync();

        const newZone: TemplateZone = {
          id: "overview",
          name: "Company Overview",
          range: range.address,
          dataType: "info",
        };

        setSelectedZones(prev => [...prev, newZone]);
        setIsSelecting(false);

        // Preview the zone
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const rangeObject = sheet.getRange(range.address);

        rangeObject.format.fill.color = "#f0f8ff";
        
        const borders = ["EdgeTop", "EdgeBottom", "EdgeLeft", "EdgeRight"] as const;
        borders.forEach(edge => {
          rangeObject.format.borders.getItem(edge).style = "Continuous";
        });

        rangeObject.values = [
          ["Company Overview"],
          ["Name: [Company Name]"],
          ["Ticker: [TICK]"],
          ["Sector: [Sector]"],
        ];

        await context.sync();
      });
    } catch (error) {
      console.error("Failed to handle selection:", error);
      setError('Failed to handle selection. Please try again.');
    }
  }, [isSelecting]);

  const useDefaultTemplate = async () => {
    try {
      await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();

        const overviewRange = sheet.getRange("A1:D5");
        const metricsRange = sheet.getRange("A7:D12");

        overviewRange.values = [
          ["Company Overview", "", "", ""],
          ["Name:", "[Company Name]", "", ""],
          ["Ticker:", "[TICK]", "", ""],
          ["Sector:", "[Sector]", "", ""],
          ["CIK:", "[CIK]", "", ""],
        ];

        metricsRange.values = [
          ["Financial Metrics", "", "", ""],
          ["Revenue:", "", "YoY Growth:", ""],
          ["Net Income:", "", "Margin:", ""],
          ["Market Cap:", "", "P/E Ratio:", ""],
          ["Assets:", "", "Liabilities:", ""],
          ["Cash Flow:", "", "Debt/Equity:", ""],
        ];

        overviewRange.format.autofitColumns();
        metricsRange.format.autofitColumns();

        await context.sync();
        localStorage.setItem("templateConfigured", "true");
      });
    } catch (error) {
      console.error("Failed to apply default template:", error);
      setError('Failed to apply default template. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      {error && (
        <Card>
          <CardPreview>
            <div className={styles.errorMessage}>
              {error}
              <Button onClick={() => setError(null)}>Dismiss</Button>
            </div>
          </CardPreview>
        </Card>
      )}

      {currentStep === 1 && (
        <div className={styles.section}>
          <Text as="h1" size={800}>Welcome to Company Snapshot</Text>
          <Text>Let's set up your custom company data layout.</Text>
          <div className={styles.buttonGroup}>
            <Button 
              appearance="primary"
              onClick={() => setCurrentStep(2)}
            >
              Design Custom Layout
            </Button>
            <Button
              onClick={useDefaultTemplate}
            >
              Use Default Template
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className={styles.section}>
          <Text as="h2" size={600}>Step 1: Company Overview Section</Text>
          <Text>Select where you want the company overview information to appear.</Text>
          <Button
            appearance="primary"
            onClick={() => setIsSelecting(true)}
            disabled={isSelecting}
          >
            {isSelecting ? "Selecting..." : "Select Range"}
          </Button>
          {isSelecting && (
            <Text>Click and drag in Excel to select the range...</Text>
          )}
        </div>
      )}

      {selectedZones.length > 0 && (
        <div className={styles.section}>
          <Text as="h3" size={500}>Selected Zones</Text>
          {selectedZones.map((zone) => (
            <div key={zone.id} className={styles.zoneItem}>
              <Text>{zone.name}</Text>
              <Text>{zone.range}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};