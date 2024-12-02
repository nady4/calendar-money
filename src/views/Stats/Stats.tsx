import Chart from "chart.js/auto";
import { useRef } from "react";
import { getRelativePosition } from "chart.js/helpers";
import { TotalType } from "../../types";

interface StatsProps {
  data: TotalType;
}

const Stats = ({ data }: StatsProps) => {
  const ctx = useRef<HTMLCanvasElement>(null);

  const chart = new Chart(ctx.current as HTMLCanvasElement, {
    type: "line",
    data: data,
    options: {
      onClick: (e) => {
        const canvasPosition = getRelativePosition(e, chart);
        const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
        const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
      },
    },
  });

  return (
    <div>
      <canvas id="myChart" ref={ctx}></canvas>
    </div>
  );
};

export default Stats;
