import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Spinner,
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  searchContainer: { position: 'relative', display: 'flex', gap: tokens.spacingHorizontalM },
  searchInput: { width: '100%' },
  results: { marginTop: tokens.spacingVerticalM },
  loader: {
    position: 'absolute',
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
});

interface Company {
  name: string;
  ticker: string;
  cik: string;
}

export const CompanySearch: React.FC = () => {
  const styles = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    const timeoutId = setTimeout(() => fetchResults(searchTerm), 300);
    return () => clearTimeout(timeoutId); // Debounce
  }, [searchTerm, fetchResults]);

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <Search24Regular />
        <Input
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search companies by name or ticker..."
          disabled={isLoading}
        />
        {isLoading && <Spinner size="tiny" className={styles.loader} />}
      </div>

      {results.length > 0 ? (
        <Table className={styles.results}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Ticker</TableHeaderCell>
              <TableHeaderCell>CIK</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((company, index) => (
              <TableRow key={index}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.ticker}</TableCell>
                <TableCell>{company.cik}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : searchTerm && !isLoading ? (
        <Text>No companies found for "{searchTerm}".</Text>
      ) : null}
    </div>
  );
};
