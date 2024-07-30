import { Card } from '@tremor/react';

interface HeadingsProps {
  firmName: string;
  currentPrice: number;
}

export function Headings({ firmName, currentPrice }: HeadingsProps) {
  return (
    <Card className="mx-auto flex max-w-lg items-center justify-between px-4 py-3.5">
      <div className="flex items-center space-x-2.5">
        <p className="text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">{firmName}</p>
      </div>
      <div className="flex items-center space-x-2.5">
        <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{currentPrice.toFixed(2)}</span>
      </div>
    </Card>
  );
}
