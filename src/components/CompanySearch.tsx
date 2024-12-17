import { useState, useCallback, useEffect } from 'react';
import { 
  Input, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Spinner,
  Link,
  makeStyles,
  tokens,
  Text 
} from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';
import { AppError, useError } from '@/errors';
import { DatabaseService } from '@/services/database/DatabaseService';
import Fuse from 'fuse.js';
import React from 'react';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  searchContainer: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    width: '100%',
  },
  results: {
    marginTop: tokens.spacingVerticalM,
  },
  score: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  noResults: {
    textAlign: 'center',
    padding: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground3,
  },
  loader: {
    position: 'absolute',
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
  }
});

interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  description?: string;
}

export const CompanySearch: React.FC = () => {
  const styles = useStyles();
  const { setError } = useError();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Initialize Fuse.js for smart search
  const fuseOptions = {
    keys: ['name', 'ticker', 'sector'],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 1
  };
  const fuse = new Fuse(companies, fuseOptions);

  // Load initial company data
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const db = DatabaseService.getInstance();
        const result = await db.executeQuery<Company>(`
          SELECT id, name, ticker, sector, description 
          FROM companies 
          LIMIT 1000
        `);
        setCompanies(result.rows);
      } catch (error) {
        setError(error as AppError);
      }
    };

    loadCompanies();
  }, [setError]);

  // Debounced search function
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Local fuzzy search for quick results
      const fuzzyResults = fuse.search(term).map(result => result.item);

      // If we have a database connection, also search there
      const db = DatabaseService.getInstance();
      const query = `
        SELECT id, name, ticker, sector, description
        FROM companies
        WHERE 
          name ILIKE $1 OR 
          ticker ILIKE $1 OR 
          sector ILIKE $1
        LIMIT 10
      `;
      const dbResults = await db.executeQuery<Company>(query, [`%${term}%`]);

      // Combine and deduplicate results
      const combinedResults = [...fuzzyResults, ...dbResults.rows];
      const uniqueResults = Array.from(new Map(combinedResults.map(item => 
        [item.id, item]
      )).values());

      setResults(uniqueResults.slice(0, 10));
    } catch (error) {
      setError(error as AppError);
    } finally {
      setIsLoading(false);
    }
  }, [fuse, setError]);

  // Debounce the search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCompanySelect = async (company: Company) => {
    // Handle company selection - we'll implement this later
    console.log('Selected company:', company);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <Search24Regular />
        <Input
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by company name, ticker, or sector..."
          disabled={isLoading}
        />
        {isLoading && <Spinner size="tiny" className={styles.loader} />}
      </div>

      {results.length > 0 ? (
        <Table className={styles.results}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Ticker</TableHeaderCell>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Sector</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((company) => (
              <TableRow 
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Text weight="semibold">{company.ticker}</Text>
                </TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.sector}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : searchTerm && !isLoading ? (
        <div className={styles.noResults}>
          <Text>No companies found matching "{searchTerm}"</Text>
        </div>
      ) : null}
    </div>
  );
};