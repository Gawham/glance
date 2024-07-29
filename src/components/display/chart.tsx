import React from 'react';
import { AreaChart, Card, Title } from '@tremor/react';

interface YearlySalesData {
  date: string;
  sales: number;
}

interface AreaChartUsageExampleProps {
  companyName: string;
  competitorName: string;
  companyYearlySales: YearlySalesData[];
  competitorYearlySales: YearlySalesData[];
}

const valueFormatter = (number: number): string => {
  return (number / 1e5).toFixed(0); // Divide by 100000 to get the desired format
};

const formatFiscalYear = (date: string): string => {
  const year = new Date(date).getFullYear() % 100; // Get last two digits of the year
  return `FY ${year}`;
};

export function AreaChartUsageExample({ companyName, competitorName, companyYearlySales, competitorYearlySales }: AreaChartUsageExampleProps) {
  const sortDataByDate = (data: YearlySalesData[]) => {
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const sortedCompanyYearlySales = sortDataByDate(companyYearlySales);
  const sortedCompetitorYearlySales = sortDataByDate(competitorYearlySales);

  const companyChartData = sortedCompanyYearlySales.map(data => ({
    date: formatFiscalYear(data.date),
    sales: data.sales / 1e5, // Divide by 100000 to get the desired format
  }));

  const competitorChartData = sortedCompetitorYearlySales.map(data => ({
    date: formatFiscalYear(data.date),
    sales: data.sales / 1e5, // Divide by 100000 to get the desired format
  }));

  return (
    <div className="flex space-x-4">
      <Card className="mt-8 w-2/3">
        <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{companyName}</h3>
        <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">Sales</p>
        <AreaChart
          className="mt-4 h-80" // Reset the height
          data={companyChartData}
          index="date"
          yAxisWidth={25} // Adjust the yAxisWidth to make it narrower
          yAxisLabel="Thousand Cr"
          categories={['sales']}
          colors={['cyan']}
          valueFormatter={valueFormatter}
          showLegend={false}
          style={{ paddingLeft: '5px' }} // Adjust padding to try and control spacing
        />
      </Card>
      <Card className="mt-8 w-2/3">
        <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{competitorName}</h3>
        <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">Competitor Sales</p>
        <AreaChart
          className="mt-4 h-80" // Reset the height
          data={competitorChartData}
          index="date"
          yAxisWidth={25} // Adjust the yAxisWidth to make it narrower
          yAxisLabel="Thousand Cr"
          categories={['sales']}
          colors={['indigo']}
          valueFormatter={valueFormatter}
          showLegend={false}
          style={{ paddingLeft: '5px' }} // Adjust padding to try and control spacing
        />
      </Card>
    </div>
  );
}
