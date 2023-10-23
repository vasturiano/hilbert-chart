export interface ConfigOptions {
  useCanvas?: boolean;
}

type Accessor<In, Out> = Out | string | ((obj: In) => Out);
type RangeAccessor<T> = Accessor<Range, T>;

export interface Range {
  start: number;
  length: number;
}

type NumFormatter = (num: number) => string;

export interface HilbertChartGenericInstance<ChainableInstance> {
  (element: HTMLElement): ChainableInstance;

  width(): number;
  width(width: number): ChainableInstance;
  margin(): number;
  margin(px: number): ChainableInstance;

  hilbertOrder(): number;
  hilbertOrder(height: number): ChainableInstance;

  data(): Range[];
  data(data: Range[]): ChainableInstance;
  rangeLabel(): RangeAccessor<string>;
  rangeLabel(textAccessor: RangeAccessor<string>): ChainableInstance;
  rangeLabelColor(): RangeAccessor<string>;
  rangeLabelColor(colorAccessor: RangeAccessor<string>): ChainableInstance;
  rangeColor(): RangeAccessor<string>;
  rangeColor(colorAccessor: RangeAccessor<string>): ChainableInstance;
  rangePadding(): RangeAccessor<string>;
  rangePadding(paddingAccessor: RangeAccessor<string>): ChainableInstance;
  valFormatter(): NumFormatter;
  valFormatter(formatter: NumFormatter): ChainableInstance;

  focusOn(pos:number, length: number, ms?: number): ChainableInstance;

  showValTooltip(): boolean;
  showValTooltip(show: boolean): ChainableInstance;
  showRangeTooltip(): boolean;
  showRangeTooltip(show: boolean): ChainableInstance;
  rangeTooltipContent(): RangeAccessor<string>;
  rangeTooltipContent(contentAccessor: RangeAccessor<string>): ChainableInstance;
  enableZoom(): boolean;
  enableZoom(enable: boolean): ChainableInstance;

  onRangeClick(cb: (range: Range) => void): ChainableInstance;
  onRangeHover(cb: (range: Range | null) => void): ChainableInstance;

  onZoom(callback: (transform: {k: number, x: number, y: number}) => void): ChainableInstance;
  onZoomEnd(callback: (transform: {k: number, x: number, y: number}) => void): ChainableInstance;
}

export type HilbertChartInstance = HilbertChartGenericInstance<HilbertChartInstance>;

declare function HilbertChart(configOptions?: ConfigOptions): HilbertChartInstance;

export default HilbertChart;
