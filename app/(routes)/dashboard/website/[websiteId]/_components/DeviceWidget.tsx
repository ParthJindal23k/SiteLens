import { AnalyticsType } from '@/configs/type';
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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


type Props = {
  websiteAnalytics: AnalyticsType | undefined | null;
  loading?: boolean;
};


function DeviceWidget({ websiteAnalytics, loading }: Props) {    
  return (
    <div>
      <Card>
        <CardContent className="p-5">
          <Tabs defaultValue="device" className="w-full">
            <TabsList>
              <TabsTrigger value="device">Device</TabsTrigger>
              <TabsTrigger value="os">OS</TabsTrigger>
              <TabsTrigger value="browser">Browser</TabsTrigger>
            </TabsList>
            <TabsContent value="device">
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.devices || []}
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
                    //   className="fill-(--color-label)"
                      fontSize={12}
                      fill="#000000"
                      
                    //   content={BarLabelWithImage}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="os">
                <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.os || []}
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
                    //   className="fill-(--color-label)"
                      fontSize={12}
                      fill="#000000"
                    //   content={BarLabelWithImage}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="browser">
                <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={websiteAnalytics?.browsers || []}
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
                    //   className="fill-(--color-label)"
                      fontSize={12}
                      fill="#000000"
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

export default DeviceWidget