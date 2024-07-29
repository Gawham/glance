"use client"

import React, { useState } from 'react';
import { AreaChartUsageExample } from './display/chart';
import { TextInputHero } from './TextInputHero';
import { ListUsageExample } from './display/ListUsageExample';
import { List2 } from './display/List2';
import { CalloutUsageExample } from './display/CalloutUsageExample';

interface YearlySalesData {
  date: string;
  sales: number;
}

interface PdfRendererProps {
  fileId: string;
}

const PdfRenderer = ({ fileId }: PdfRendererProps) => {
  const [ticker, setTicker] = useState<string | null>(null);
  const [peRatio, setPeRatio] = useState<number | null>(null);
  const [quickRatio, setQuickRatio] = useState<number | null>(null);
  const [currentRatio, setCurrentRatio] = useState<number | null>(null);
  const [debtToEquity, setDebtToEquity] = useState<number | null>(null);
  const [threeYearCAGR, setThreeYearCAGR] = useState<number | null>(null);
  const [roe, setRoe] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [earningsGrowth, setEarningsGrowth] = useState<number | null>(null);
  const [companyYearlySales, setCompanyYearlySales] = useState<YearlySalesData[]>([]);
  const [competitorYearlySales, setCompetitorYearlySales] = useState<YearlySalesData[]>([]);
  const [companyName, setCompanyName] = useState<string>('Company Name');
  const [competitorName, setCompetitorName] = useState<string>('Competitor Name');
  const [companyQuery, setCompanyQuery] = useState<string | null>(null);

  const handleFirmSubmit = async (firmName: string) => {
    try {
      const response = await fetch('/api/ticker', {
        method: 'POST',
        body: JSON.stringify({ firmName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setTicker(data.ticker);
      setPeRatio(data.peRatio);
      setQuickRatio(data.quickRatio);
      setCurrentRatio(data.currentRatio);
      setDebtToEquity(data.debtToEquity);
      setThreeYearCAGR(data.threeYearCAGR);
      setRoe(data.roe);
      setCurrentPrice(data.financialData.currentPrice);
      setEarningsGrowth(data.financialData.earningsGrowth);
      setCompanyYearlySales(data.companyYearlySales);
      setCompetitorYearlySales(data.competitorYearlySales);
      setCompanyName(data.companyName);
      setCompetitorName(data.competitorName);
      setCompanyQuery(data.companyQuery);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center p-0" style={{ position: 'relative', zIndex: 1 }}>
      <div className="w-full border-b border-zinc-50 flex flex-col items-center justify-between" style={{ height: '43rem', backgroundColor: '#fff' }}>
        <div className="flex-1 flex flex-col items-center space-y-4 w-full" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
          <div className="w-full" style={{ marginTop: '20px' }}>
            <TextInputHero onSubmit={handleFirmSubmit} />
          </div>
          <div className="grid grid-cols-3 gap-2 w-full px-4">
            <div className="flex justify-center" style={{ transform: 'scale(0.95)', transformOrigin: 'center' }}>
              <ListUsageExample
                peRatio={peRatio ?? 0}
                quickRatio={quickRatio ?? 0}
                currentRatio={currentRatio ?? 0}
                debtToEquity={debtToEquity ?? 0}
              />
            </div>
            <div className="flex items-center justify-center" style={{ transform: 'scale(0.95)', transformOrigin: 'center' }}>
              <CalloutUsageExample 
                firmName={ticker ?? 'Unknown'}
                companyQuery={companyQuery ?? 'Loading...'}
              />
            </div>
            <div className="flex justify-center" style={{ transform: 'scale(0.95)', transformOrigin: 'center' }}>
              <List2
                currentPrice={currentPrice ?? 0}
                roe={roe ?? 0}
                threeYearCAGR={threeYearCAGR ?? 0}
                earningsGrowth={earningsGrowth ?? 0}
              />
            </div>
          </div>
          <div className="w-full flex items-center justify-center" style={{ height: '200px', marginTop: '10px' }}>
            <div style={{ height: '100%', width: '100%', backgroundColor: '#fff', zIndex: 2 }}>
              <AreaChartUsageExample 
                companyName={companyName} 
                competitorName={competitorName}
                companyYearlySales={companyYearlySales} 
                competitorYearlySales={competitorYearlySales} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
