import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  TabList,
  Tab,
  SelectTabEvent,
  SelectTabData,
  makeStyles,
  tokens,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Button,
} from '@fluentui/react-components';
import {
  DocumentRegular,
  CalculatorRegular,
  TableRegular,
  SettingsRegular,
  BuildingRegular,
  ArrowTrendingRegular,
  ShieldError24Regular,
  ChartMultiple24Regular,
  DataUsage24Regular,
  TreeDeciduous24Regular,
  MoreHorizontal24Regular,
} from '@fluentui/react-icons';

interface NavbarProps {
  onNavigate: (key: string) => void;
  selectedKey?: string;
}

interface NavItem {
  key: string;
  icon: JSX.Element;
  label: string;
}

const useStyles = makeStyles({
  navContainer: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
  },
  tabList: {
    flex: 1,
    overflowX: 'hidden',
  },
  overflowButton: {
    margin: '0 4px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, selectedKey = 'company-snapshot' }) => {
  const styles = useStyles();
  const [visibleTabs, setVisibleTabs] = useState<NavItem[]>([]);
  const [overflowTabs, setOverflowTabs] = useState<NavItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Define all navigation items
  const allNavItems: NavItem[] = [
    { key: 'company-snapshot', icon: <BuildingRegular />, label: 'Search' },
    { key: 'markets-data', icon: <ArrowTrendingRegular />, label: 'Markets' },
    { key: 'models', icon: <TableRegular />, label: 'Models' },
    { key: 'comparables-analysis', icon: <ChartMultiple24Regular />, label: 'Comparables' },
    { key: 'red-flags-analysis', icon: <ShieldError24Regular />, label: 'Red Flags' },
    { key: 'dupont-analysis', icon: <TreeDeciduous24Regular />, label: 'Dupont Analysis' },
    { key: 'non-traditional-analysis', icon: <DataUsage24Regular />, label: 'Non-traditional Analysis' },
    { key: 'functions', icon: <CalculatorRegular />, label: 'Functions' },
    { key: 'shortcuts-manager', icon: <DocumentRegular />, label: 'Shortcuts' },
    { key: 'settings', icon: <SettingsRegular />, label: 'Settings' },
  ];

  useEffect(() => {
    const calculateVisibleTabs = () => {
      if (!containerRef.current || !tabsRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const overflowButtonWidth = 48; // Width of the overflow button
      const availableWidth = containerWidth - overflowButtonWidth;
      
      let totalWidth = 0;
      let breakIndex = allNavItems.length;

      const tabElements = tabsRef.current.getElementsByTagName('button');
      
      for (let i = 0; i < tabElements.length; i++) {
        totalWidth += tabElements[i].offsetWidth;
        if (totalWidth > availableWidth) {
          breakIndex = i;
          break;
        }
      }

      setVisibleTabs(allNavItems.slice(0, breakIndex));
      setOverflowTabs(allNavItems.slice(breakIndex));
    };

    calculateVisibleTabs();
    
    const resizeObserver = new ResizeObserver(calculateVisibleTabs);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    onNavigate(data.value as string);
  };

  return (
    <nav className={styles.navContainer} ref={containerRef}>
      <div className={styles.tabList} ref={tabsRef}>
        <TabList 
          selectedValue={selectedKey}
          onTabSelect={handleTabSelect}
          size="large"
          appearance="subtle"
        >
          {visibleTabs.map((item) => (
            <Tab key={item.key} value={item.key} icon={item.icon}>
              {item.label}
            </Tab>
          ))}
        </TabList>
      </div>

      {overflowTabs.length > 0 && (
        <Menu>
          <MenuTrigger>
            <Button
              className={styles.overflowButton}
              icon={<MoreHorizontal24Regular />}
              appearance="subtle"
              aria-label="More options"
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {overflowTabs.map((item) => (
                <MenuItem
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                >
                  <span className={styles.menuItem}>
                    {item.icon}
                    {item.label}
                  </span>
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      )}
    </nav>
  );
};