import React, { useState, useEffect } from 'react';
import { AreaChart, Card } from '@tremor/react';
import { useMediaQuery } from 'react-responsive';

interface YearlySalesData {
  date: string;
  sales: number;
}

interface AreaChartUsageExampleProps {
  companyName: string;
  competitorName: string;
  companyYearlySales: YearlySalesData[];
  competitorYearlySales: YearlySalesData[];
  containerHeight: number | null;
}

const valueFormatter = (number: number): string => {
  return (number / 1e5).toFixed(0); // Divide by 100000 to get the desired format
};

const formatFiscalYear = (date: string): string => {
  const year = new Date(date).getFullYear() % 100; // Get last two digits of the year
  return `FY ${year}`;
};

export function AreaChartUsageExample({ companyName, competitorName, companyYearlySales, competitorYearlySales, containerHeight }: AreaChartUsageExampleProps) {
  const [companySales, setCompanySales] = useState<YearlySalesData[]>([]);
  const [competitorSales, setCompetitorSales] = useState<YearlySalesData[]>([]);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    setCompanySales(companyYearlySales);
    setCompetitorSales(competitorYearlySales);
  }, [companyYearlySales, competitorYearlySales]);

  const sortDataByDate = (data: YearlySalesData[]) => {
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const sortedCompanyYearlySales = sortDataByDate(companySales);
  const sortedCompetitorYearlySales = sortDataByDate(competitorSales);

  const companyChartData = sortedCompanyYearlySales.map(data => ({
    date: formatFiscalYear(data.date),
    sales: data.sales / 1e5, // Divide by 100000 to get the desired format
  }));

  const competitorChartData = sortedCompetitorYearlySales.map(data => ({
    date: formatFiscalYear(data.date),
    sales: data.sales / 1e5, // Divide by 100000 to get the desired format
  }));

  const chartHeight = isMobile ? '300px' : containerHeight ? `${containerHeight * 0.4}px` : '100%'; // Adjust heights for mobile and desktop

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4">
      <Card className="mt-8 sm:w-2/3 w-full">
        <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{companyName}</h3>
        <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">Sales</p>
        <AreaChart
          className="mt-4"
          data={companyChartData}
          index="date"
          yAxisWidth={25}
          yAxisLabel="Thousand Cr"
          categories={['sales']}
          colors={['cyan']}
          valueFormatter={valueFormatter}
          showLegend={false}
          style={{ height: chartHeight, width: '100%' }} // Adjust height and width here
        />
      </Card>
      <Card className="mt-8 sm:w-2/3 w-full">
        <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{competitorName}</h3>
        <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">Competitor Sales</p>
        <AreaChart
          className="mt-4"
          data={competitorChartData}
          index="date"
          yAxisWidth={25}
          yAxisLabel="Thousand Cr"
          categories={['sales']}
          colors={['indigo']}
          valueFormatter={valueFormatter}
          showLegend={false}
          style={{ height: chartHeight, width: '100%' }} // Adjust height and width here
        />
      </Card>
    </div>
  );
}
