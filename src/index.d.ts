export interface ConfigOptions {
  useCanvas?: boolean;
}

type Accessor<In, Out> = Out | string | ((obj: In) => Out);
type RangeAccessor<T> = Accessor<Range, T>;
type NumericValue = number | bigint;

export interface Range {
  start: NumericValue;
  length: NumericValue;
}

type NumFormatter = (num: NumericValue) => string;

declare class HilbertChart {
  constructor(element: HTMLElement, configOptions?: ConfigOptions);

  width(): number;
  width(width: number): HilbertChart;
  margin(): number;
  margin(px: number): HilbertChart;

  hilbertOrder(): number;
  hilbertOrder(height: number): HilbertChart;

  data(): Range[];
  data(data: Range[]): HilbertChart;
  heatmapPoints(): NumericValue[];
  heatmapPoints(pnts: NumericValue[]): HilbertChart;
  heatmapPointRadius(): number;
  heatmapPointRadius(radius: number): HilbertChart;
  heatmapOpacity(): number;
  heatmapOpacity(opacity: number): HilbertChart;
  rangeLabel(): RangeAccessor<string>;
  rangeLabel(textAccessor: RangeAccessor<string>): HilbertChart;
  rangeLabelColor(): RangeAccessor<string>;
  rangeLabelColor(colorAccessor: RangeAccessor<string>): HilbertChart;
  rangeColor(): RangeAccessor<string>;
  rangeColor(colorAccessor: RangeAccessor<string>): HilbertChart;
  rangePadding(): RangeAccessor<string>;
  rangePadding(paddingAccessor: RangeAccessor<string>): HilbertChart;
  rangePaddingAbsolute(): RangeAccessor<string>;
  rangePaddingAbsolute(paddingAccessor: RangeAccessor<string>): HilbertChart;
  valFormatter(): NumFormatter;
  valFormatter(formatter: NumFormatter): HilbertChart;
  simplifyCurves(): boolean;
  simplifyCurves(simplifyCurves: boolean): HilbertChart;
  minCurveWidth(): number;
  minCurveWidth(minCurveWidth: number): HilbertChart;

  focusOn(pos: NumericValue, length: NumericValue, ms?: number): HilbertChart;

  showValTooltip(): boolean;
  showValTooltip(show: boolean): HilbertChart;
  showRangeTooltip(): boolean;
  showRangeTooltip(show: boolean): HilbertChart;
  rangeTooltipContent(): RangeAccessor<string>;
  rangeTooltipContent(contentAccessor: RangeAccessor<string>): HilbertChart;
  enableZoom(): boolean;
  enableZoom(enable: boolean): HilbertChart;

  onRangeClick(cb: (range: Range) => void): HilbertChart;
  onRangeHover(cb: (range: Range | null) => void): HilbertChart;
  onPointerMove(cb: (value: NumericValue, event: MouseEvent) => void): HilbertChart;
  onZoom(callback: (transform: {k: number, x: number, y: number}) => void): HilbertChart;
  onZoomEnd(callback: (transform: {k: number, x: number, y: number}) => void): HilbertChart;
}

export default HilbertChart;
