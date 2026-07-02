"use client";

import { Line } from "react-chartjs-2";
import type { Hourly } from "@/lib/types";
import { axisExtras, baseOpts, compass, fromToday, metaPlugin, windArrows } from "@/lib/chart/plugins";

export default function SpotCharts({ hourly }: { hourly: Hourly }) {
  const wf = fromToday(hourly.wtime, hourly.wind);
  const wd2 = fromToday(hourly.wtime, hourly.wdir);
  const tf = fromToday(hourly.mtime, hourly.tide);
  const sf = fromToday(hourly.mtime, hourly.swellH);
  const pf = fromToday(hourly.mtime, hourly.swellP);

  // Wind chart with direction barbs.
  const windOpts = baseOpts();
  windOpts.plugins.meta = { times: wf.L, dirs: wd2.V };
  windOpts.plugins.tooltip.callbacks.afterLabel = (ctx: { dataIndex: number }) => {
    const dg = wd2.V[ctx.dataIndex];
    return dg == null ? "" : `from ${compass(dg)} (${Math.round(dg)}°)`;
  };

  // Swell (m) + period (s) dual axis.
  const swellOpts = baseOpts();
  swellOpts.plugins.meta = { times: sf.L };
  swellOpts.scales.y = {
    position: "left",
    ticks: { font: { size: 10 } },
    grid: { color: "#eef2f6" },
    title: { display: true, text: "m", font: { size: 10 } },
  };
  swellOpts.scales.y1 = {
    position: "right",
    ticks: { font: { size: 10 } },
    grid: { display: false },
    title: { display: true, text: "s", font: { size: 10 } },
  };
  swellOpts.plugins.legend = { display: true, labels: { boxWidth: 10, font: { size: 10 } } };

  const tideOpts = baseOpts();
  tideOpts.plugins.meta = { times: tf.L };

  return (
    <>
      <div className="chartwrap">
        <div className="ctitle">Wind (km/h)</div>
        <Line
          options={windOpts}
          plugins={[metaPlugin, windArrows, axisExtras]}
          data={{
            labels: wf.L,
            datasets: [
              {
                data: wf.V,
                borderColor: "#1b6ca8",
                backgroundColor: "#1b6ca822",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                fill: true,
              },
            ],
          }}
        />
      </div>
      <div className="chartwrap">
        <div className="ctitle">Swell height (m) &amp; period (s)</div>
        <Line
          options={swellOpts}
          plugins={[metaPlugin, axisExtras]}
          data={{
            labels: sf.L,
            datasets: [
              {
                label: "Swell (m)",
                data: sf.V,
                yAxisID: "y",
                borderColor: "#2e7d6b",
                backgroundColor: "#2e7d6b22",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                fill: true,
              },
              {
                label: "Period (s)",
                data: pf.V,
                yAxisID: "y1",
                borderColor: "#d97757",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
              },
            ],
          }}
        />
      </div>
      <div className="chartwrap">
        <div className="ctitle">Tide — sea level (m)</div>
        <Line
          options={tideOpts}
          plugins={[metaPlugin, axisExtras]}
          data={{
            labels: tf.L,
            datasets: [
              {
                data: tf.V,
                borderColor: "#6a9bcc",
                backgroundColor: "#6a9bcc22",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                fill: true,
              },
            ],
          }}
        />
      </div>
    </>
  );
}
