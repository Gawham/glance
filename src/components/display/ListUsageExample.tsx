import { Card, List, ListItem } from '@tremor/react';

interface ListUsageExampleProps {
  peRatio: number;
  quickRatio: number;
  currentRatio: number;
  debtToEquity: number;
}

export function ListUsageExample({ peRatio, quickRatio, currentRatio, debtToEquity }: ListUsageExampleProps) {
  const ratios = [
    {
      ratio: 'PE',
      value: peRatio.toFixed(2),
    },
    {
      ratio: 'Quick',
      value: quickRatio.toFixed(2),
    },
    {
      ratio: 'Current',
      value: currentRatio.toFixed(2),
    },
    {
      ratio: 'Debt to Equity',
      value: debtToEquity.toFixed(2),
    },
  ];

  return (
    <Card className="mx-auto max-w-lg text-center h-full flex flex-col justify-center">
      <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">Financial Ratios</h3>
      <List className="mt-2">
        {ratios.map((item) => (
          <ListItem key={item.ratio} className="flex justify-between">
            <span>{item.ratio}</span>
            <span>{item.value}</span>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
