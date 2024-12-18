import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableRow,
  makeStyles,
  tokens,
  Text,
  Spinner,
} from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalL,
    height: '100vh',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  searchBar: {
    width: '600px',
  },
  resultsDropdown: {
    position: 'absolute',
    top: '100%',
    width: '600px',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
    zIndex: 1000,
    borderRadius: tokens.borderRadiusMedium,
    overflowY: 'auto',
    maxHeight: '300px',
  },
  mainContent: {
    marginTop: tokens.spacingVerticalL,
  },
  relativeContainer: {
    position: 'relative',
  },
  relativePosition: {
    position: 'relative',
  },
  searchWrapper: {
    position: 'relative',
  },
});

interface Company {
  name: string;
  ticker: string;
  cik: string;
}

export const CompanyManager: React.FC = () => {
  const styles = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const fetchResults = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/search?query=${term}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchResults(searchTerm), 200);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchResults]);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setSearchTerm(company.name); // Auto-fill search bar with selection
    setResults([]); // Clear dropdown
  };

  return (
        <div className={styles.searchWrapper}>
      {/* Search Function - Top Center */}
      <div className={styles.searchContainer}>
        <div style={{ position: 'relative' }}>
          <Input
            className={styles.searchBar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for companies by name or ticker..."
            contentBefore={<Search24Regular />}
          />
          {isLoading && <Spinner size="tiny" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />}

          {/* Results Dropdown */}
          {results.length > 0 && (
            <div className={styles.resultsDropdown}>
              <Table>
                <TableBody>
                  {results.map((company, index) => (
                    <TableRow
                      key={index}
                      onClick={() => handleSelectCompany(company)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.ticker}</TableCell>
                      <TableCell>{company.cik}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {selectedCompany ? (
          <Text size={600}>Selected Company: {selectedCompany.name} ({selectedCompany.ticker})</Text>
        ) : null}
      </div>
    </div>
  );
};
