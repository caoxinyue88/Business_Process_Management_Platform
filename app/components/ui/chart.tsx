'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// 动态导入 ApexCharts，避免 SSR 错误
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface ChartProps {
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'radar';
  height?: number;
  width?: number | string;
  options?: any;
  series: any[];
  className?: string;
}

export function AreaChart(props: ChartProps) {
  return <Chart {...props} type="area" />;
}

export function BarChart(props: ChartProps) {
  return <Chart {...props} type="bar" />;
}

export function Chart({
  type,
  height = 350,
  width = '100%',
  options = {},
  series,
  className,
}: ChartProps) {
  const defaultOptions = {
    chart: {
      type,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: false,
    },
    tooltip: {
      enabled: true,
    },
    xaxis: {
      categories: [],
      labels: {
        style: {
          colors: '#64748b',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
        },
      },
    },
    colors: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#6366f1'],
    ...options,
  };

  return (
    <div className={className}>
      {typeof window !== 'undefined' && (
        <ApexCharts
          options={defaultOptions}
          series={series}
          type={type}
          height={height}
          width={width}
        />
      )}
    </div>
  );
} 