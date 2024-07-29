import { Card, List, ListItem } from '@tremor/react';

interface List2Props {
  currentPrice: number | null;
  roe: number | null;
  threeYearCAGR: number | null;
  earningsGrowth: number | null;
}

export function List2({ currentPrice, roe, threeYearCAGR, earningsGrowth }: List2Props) {
  const ratios = [
    {
      ratio: 'Current Price',
      value: currentPrice !== null ? currentPrice.toFixed(2) : 'N/A',
    },
    {
      ratio: 'Return on Equity (ROE)',
      value: roe !== null ? roe.toFixed(2) : 'N/A',
    },
    {
      ratio: '3-Year CAGR',
      value: threeYearCAGR !== null ? threeYearCAGR.toFixed(2) : 'N/A',
    },
    {
      ratio: 'Earnings Growth',
      value: earningsGrowth !== null ? earningsGrowth.toFixed(2) : 'N/A',
    },
  ];

  return (
    <Card className="mx-auto max-w-md text-center">
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
