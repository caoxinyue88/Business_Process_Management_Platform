import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// 动态导入ApexCharts，避免SSR问题
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="min-h-[240px] flex items-center justify-center">加载图表中...</div>
});

interface ChartProps {
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'radar';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexCharts.ApexOptions;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Chart({
  type,
  series,
  options = {},
  width = '100%',
  height = 350,
  className
}: ChartProps) {
  // 默认选项
  const defaultOptions: ApexCharts.ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      background: 'transparent',
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    theme: {
      mode: 'light',
    },
    tooltip: {
      theme: 'light',
    },
    ...options,
  };

  // 客户端渲染检查
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('min-h-[240px] flex items-center justify-center', className)}>加载图表中...</div>;
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <ReactApexChart
        type={type}
        series={series}
        options={defaultOptions}
        width={width}
        height={height}
      />
    </div>
  );
}

// 特定类型图表组件
export function BarChart(props: Omit<ChartProps, 'type'>) {
  return <Chart type="bar" {...props} />;
}

export function LineChart(props: Omit<ChartProps, 'type'>) {
  return <Chart type="line" {...props} />;
}

export function AreaChart(props: Omit<ChartProps, 'type'>) {
  return <Chart type="area" {...props} />;
}

export function PieChart(props: Omit<ChartProps, 'type'>) {
  return <Chart type="pie" {...props} />;
}

export function DonutChart(props: Omit<ChartProps, 'type'>) {
  return <Chart type="donut" {...props} />;
}

export function RadialBarChart(props: Omit<ChartProps, 'type'>) {
  return <Chart type="radialBar" {...props} />;
} 