import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsType, IMAGE_URL_FOR_DOMAINS } from '@/configs/type';
import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type Props = {
  websiteAnalytics: AnalyticsType | undefined | null;
  loading?: boolean;
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;



function GeoWidget({ websiteAnalytics, loading }: Props) {
const countries = websiteAnalytics?.countries ?? [];
  const cities = websiteAnalytics?.cities ?? [];
  const regions = websiteAnalytics?.regions ?? [];

  const geoCodeMap = React.useMemo(() => {
    const map: Record<string, string> = {};

    [...countries, ...cities, ...regions].forEach(item => {
      if (item?.name && item?.code) {
        map[item.name] = item.code;
      }
    });

    return map;
  }, [countries, cities, regions]);



const BarLabelWithImage = (props: any) => {
  const { x, y, height, value, name } = props;
//   console.log(props)

  const code = geoCodeMap?.[value];

  const imageUrl =
    code && code !== "UNKNOWN"
      ? `https://flagsapi.com/${code}/flat/24.png`
      : typeof window !== "undefined"
        ? `${window.location.origin}/unknown.png`
        : "/unknown.png";

  return (
    <g transform={`translate(${x + 8}, ${y + height / 2 - 8})`}>
      <image href={imageUrl} width={16} height={16} />
      <text x={20} y={12} fontSize={12} fill="#000000">
        {name}
      </text>
    </g>
  );
};




  return (
    <div>
      <Card>
        <CardContent className="p-5">
          <Tabs defaultValue="country" className="w-full">
            <TabsList>
              <TabsTrigger value="country">Country</TabsTrigger>
              <TabsTrigger value="city">City</TabsTrigger>
              <TabsTrigger value="region">Region</TabsTrigger>
            </TabsList>
            <TabsContent value="country">
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.countries || []}
                  layout="vertical"
                  margin={{
                    right: 16,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="uv" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="uv"
                    layout="vertical"
                    fill="var(--color-primary)"
                    opacity={0.6}
                    radius={4}
                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      offset={8}
                      className="fill-(--color-label)"
                      fontSize={12}
                      content={BarLabelWithImage}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="city">
                <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.cities || []}
                  layout="vertical"
                  margin={{
                    right: 16,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="uv" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="uv"
                    layout="vertical"
                    fill="var(--color-primary)"
                    opacity={0.6}
                    radius={4}
                    label={BarLabelWithImage}
                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      offset={8}
                      className="fill-(--color-label)"
                      fontSize={12}
                      content={BarLabelWithImage}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="region">
                <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.regions || []}
                  layout="vertical"
                  margin={{
                    right: 16,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="uv" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="uv"
                    layout="vertical"
                    fill="var(--color-primary)"
                    opacity={0.6}
                    radius={4}
                    label={BarLabelWithImage}

                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      offset={8}
                      className="fill-(--color-label)"
                      fontSize={12}
                      content={BarLabelWithImage}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>

  )
}

export default GeoWidget