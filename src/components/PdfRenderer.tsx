"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AreaChartUsageExample } from './display/chart';
import { TextInputHero } from './TextInputHero';
import { ListUsageExample } from './display/ListUsageExample';
import { List2 } from './display/List2';
import { CalloutUsageExample } from './display/CalloutUsageExample';
import { Headings } from './display/headings';
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';
import { useMediaQuery } from 'react-responsive';


interface YearlySalesData {
  date: string;
  sales: number;
}

interface PdfRendererProps {
  fileId: string;
}

const defaultData = {
  companyName: 'Infosys Limited',
  ticker: 'INFY.NS',
  competitorName: 'Tata Consultancy Services Limited',
  competitorTicker: 'TCS.NS',
  companyQuery: 'Infosys Limited (INFY.NS) demonstrates solid financial health with strong liquidity ratios (quick ratio: 1.419, current ratio: 1.893), moderate debt (debt-to-equity ratio: 10.017), and a high ROE of 33.56%. Recent acquisitions, including the semiconductor design firm InSemi, and a positive Q1 2024 outlook with anticipated 6% net profit growth signal continued expansion. Despite a low dividend yield of 0.0246%, Infosys shows a promising growth trajectory with a three-year CAGR of 5.27% and increasing annual sales, from $13.561 billion in 2021 to $18.562 billion in 2024.',
  peRatio: 29.080557,
  quickRatio: 1.419,
  currentRatio: 1.893,
  debtToEquity: 10.017,
  roe: 0.33560002,
  threeYearCAGR: 5.273360900319424,
  marketCap: 7774911594496,
  forwardPE: 25.931068,
  dividendYield: 0.0002458447,
  financialData: {
    currentPrice: 1877.15,
    earningsGrowth: 0.059,
  },
  companyYearlySales: [
    { date: '2024-03-31T00:00:00.000Z', sales: 18562000000 },
    { date: '2023-03-31T00:00:00.000Z', sales: 18212000000 },
    { date: '2022-03-31T00:00:00.000Z', sales: 16311000000 },
    { date: '2021-03-31T00:00:00.000Z', sales: 13561000000 }
  ],
  competitorYearlySales: [
    { date: '2024-03-31T00:00:00.000Z', sales: 2408930000000 },
    { date: '2023-03-31T00:00:00.000Z', sales: 2254580000000 },
    { date: '2022-03-31T00:00:00.000Z', sales: 1917540000000 },
    { date: '2021-03-31T00:00:00.000Z', sales: 1641770000000 }
  ]
};

const PdfRenderer = ({ fileId }: PdfRendererProps) => {
  const [ticker, setTicker] = useState<string | null>(defaultData.ticker);
  const [peRatio, setPeRatio] = useState<number | null>(defaultData.peRatio);
  const [quickRatio, setQuickRatio] = useState<number | null>(defaultData.quickRatio);
  const [currentRatio, setCurrentRatio] = useState<number | null>(defaultData.currentRatio);
  const [debtToEquity, setDebtToEquity] = useState<number | null>(defaultData.debtToEquity);
  const [threeYearCAGR, setThreeYearCAGR] = useState<number | null>(defaultData.threeYearCAGR);
  const [roe, setRoe] = useState<number | null>(defaultData.roe);
  const [currentPrice, setCurrentPrice] = useState<number | null>(defaultData.financialData.currentPrice);
  const [earningsGrowth, setEarningsGrowth] = useState<number | null>(defaultData.financialData.earningsGrowth);
  const [companyYearlySales, setCompanyYearlySales] = useState<YearlySalesData[]>(defaultData.companyYearlySales);
  const [competitorYearlySales, setCompetitorYearlySales] = useState<YearlySalesData[]>(defaultData.competitorYearlySales);
  const [companyName, setCompanyName] = useState<string>(defaultData.companyName);
  const [competitorName, setCompetitorName] = useState<string>(defaultData.competitorName);
  const [companyQuery, setCompanyQuery] = useState<string | null>(defaultData.companyQuery);
  const { loading, setLoading } = useLoading();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [showPdf, setShowPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, [showPdf, isMobile]);

  const handleFirmSubmit = async (firmName: string) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-md shadow flex flex-col items-center p-0"
      style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}
    >
      {isMobile && (
        <button
          onClick={() => setShowPdf(!showPdf)}
          className="fixed top-4 right-4 z-20 p-2 bg-blue-500 text-bl rounded"
          style={{ marginTop: '100px', height: '10rem', backgroundColor: '#000000' }}
          data-testid="toggle-pdf-view-button"
        >
          {showPdf ? '📈' : '📈'}
        </button>
      )}
      {(showPdf || !isMobile) && (
        <div
          className="w-full border-b border-zinc-50 flex flex-col items-center justify-between"
          style={{ height: isMobile ? '93rem' : '85vh', backgroundColor: '#fff', overflow: 'hidden' }}
        >
          <div
            className="flex-1 flex flex-col items-center space-y-4 w-full"
            style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
          >
            <div
              className="w-full flex items-center justify-between"
              style={{ marginTop: '10px' }}
              data-testid="header"
            >
              <div
                className="flex-1 flex flex-col items-center"
                style={{ width: '100%' }}
              >
                <Headings firmName={companyName} currentPrice={currentPrice ?? 0} data-testid="headings" />
              </div>
              <div
                className="flex-1 flex flex-col items-center"
                style={{ width: '100%' }}
              >
                <TextInputHero onSubmit={handleFirmSubmit} width="80%" height="70px" data-testid="text-input-hero" />
              </div>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full px-4"
              style={{ marginTop: '5px' }}
              data-testid="grid-container"
            >
              <div
                className="flex justify-center"
                style={{ transform: 'scale(0.95)', transformOrigin: 'center', width: '100%' }}
                data-testid="list-usage-example-container"
              >
                <ListUsageExample
                  peRatio={peRatio ?? 0}
                  quickRatio={quickRatio ?? 0}
                  currentRatio={currentRatio ?? 0}
                  debtToEquity={debtToEquity ?? 0}
                  data-testid="list-usage-example"
                />
              </div>
              <div
                className="flex items-center justify-center"
                style={{ transform: 'scale(0.95)', transformOrigin: 'center', width: '100%' }}
                data-testid="callout-usage-example-container"
              >
                <CalloutUsageExample
                  firmName={ticker ?? 'Unknown'}
                  companyQuery={companyQuery ?? 'Loading...'}
                  data-testid="callout-usage-example"
                />
              </div>
              <div
                className="flex justify-center"
                style={{ transform: 'scale(0.95)', transformOrigin: 'center', width: '100%' }}
                data-testid="list2-container"
              >
                <List2
                  currentPrice={currentPrice ?? 0}
                  roe={roe ?? 0}
                  threeYearCAGR={threeYearCAGR ?? 0}
                  earningsGrowth={earningsGrowth ?? 0}
                  data-testid="list2"
                />
              </div>
            </div>
            <div
              className="w-full flex items-center justify-center"
              style={{ height: isMobile ? '300px' : containerHeight ? `${containerHeight * 0.7}px` : '400px', marginTop: '0px' }}
              data-testid="area-chart-container"
            >
              <div
                style={{ height: '100%', width: '100%', backgroundColor: '#fff', zIndex: 2 }}
                data-testid="area-chart-inner"
              >
                <AreaChartUsageExample
                  companyName={companyName}
                  competitorName={competitorName}
                  companyYearlySales={companyYearlySales}
                  competitorYearlySales={competitorYearlySales}
                  containerHeight={containerHeight}
                  data-testid="area-chart-usage-example"
                />
              </div>
            </div>
          </div>
          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50"
              data-testid="loading-indicator"
            >
              <Loader2 className="animate-spin" size={48} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PdfRenderer;
