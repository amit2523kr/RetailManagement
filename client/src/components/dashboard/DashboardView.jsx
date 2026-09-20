import React from "react";
import { KpiCards } from "./KpiCards.jsx";
import { ChartSection } from "./ChartSection.jsx";
import { QuickInsights } from "./QuickInsights.jsx";

export function DashboardView({ data }) {
  return (
    <>
      <KpiCards kpis={data?.kpis} />
      <ChartSection />
      <QuickInsights data={data} />
    </>
  );
}

export function Dashboard({ data }) {
  return <DashboardView data={data} />;
}
