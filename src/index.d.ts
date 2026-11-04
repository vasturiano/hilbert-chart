export interface ConfigOptions {
  useCanvas?: boolean;
  zoomWithModKey?: boolean;
}

type Accessor<In, Out> = Out | string | ((obj: In) => Out);
type NumericValue = number | bigint;

export interface Range {
  start: NumericValue;
  length: NumericValue;
  [key: string]: any;
}

type RangeBounds = Pick<Range, 'start' | 'length'>;
type RangeAccessor<R extends RangeBounds, T> = Accessor<R, T>;
type NumFormatter = (num: NumericValue) => string;

declare class HilbertChart<R extends RangeBounds = Range> {
  constructor(element: HTMLElement, configOptions?: ConfigOptions);

  width(): number;
  width(width: number): HilbertChart<R>;
  margin(): number;
  margin(px: number): HilbertChart<R>;

  hilbertOrder(): number;
  hilbertOrder(height: number): HilbertChart<R>;

  data(): R[];
  data<T extends RangeBounds>(data: T[]): HilbertChart<T>;
  heatmapPoints(): NumericValue[];
  heatmapPoints(pnts: NumericValue[]): HilbertChart<R>;
  heatmapPointRadius(): number;
  heatmapPointRadius(radius: number): HilbertChart<R>;
  heatmapOpacity(): number;
  heatmapOpacity(opacity: number): HilbertChart<R>;
  rangeLabel(): RangeAccessor<R, string>;
  rangeLabel(textAccessor: RangeAccessor<R, string>): HilbertChart<R>;
  rangeLabelColor(): RangeAccessor<R, string>;
  rangeLabelColor(colorAccessor: RangeAccessor<R, string>): HilbertChart<R>;
  rangeColor(): RangeAccessor<R, string>;
  rangeColor(colorAccessor: RangeAccessor<R, string>): HilbertChart<R>;
  rangePadding(): RangeAccessor<R, number>;
  rangePadding(paddingAccessor: RangeAccessor<R, number>): HilbertChart<R>;
  rangePaddingAbsolute(): RangeAccessor<R, number>;
  rangePaddingAbsolute(paddingAccessor: RangeAccessor<R, number>): HilbertChart<R>;
  valFormatter(): NumFormatter;
  valFormatter(formatter: NumFormatter): HilbertChart<R>;
  simplifyCurves(): boolean;
  simplifyCurves(simplifyCurves: boolean): HilbertChart<R>;
  minCurveWidth(): number;
  minCurveWidth(minCurveWidth: number): HilbertChart<R>;

  focusOn(pos: NumericValue, length: NumericValue, ms?: number): HilbertChart<R>;

  showValTooltip(): boolean;
  showValTooltip(show: boolean): HilbertChart<R>;
  showRangeTooltip(): boolean;
  showRangeTooltip(show: boolean): HilbertChart<R>;
  rangeTooltipContent(): RangeAccessor<R, string>;
  rangeTooltipContent(contentAccessor: RangeAccessor<R, string>): HilbertChart<R>;
  enableZoom(): boolean;
  enableZoom(enable: boolean): HilbertChart<R>;

  onRangeClick(cb: (range: R) => void): HilbertChart<R>;
  onRangeHover(cb: (range: R | null) => void): HilbertChart<R>;
  onPointerMove(cb: (value: NumericValue, event: MouseEvent) => void): HilbertChart<R>;
  onZoom(callback: (transform: {k: number, x: number, y: number}) => void): HilbertChart<R>;
  onZoomEnd(callback: (transform: {k: number, x: number, y: number}) => void): HilbertChart<R>;
}

export default HilbertChart;
