# Hilbert Chart

A hilbert space-filling curve D3 chart for representing one-dimensional lengths on a two-dimensional space.

Live example at: http://bl.ocks.org/vasturiano/8aceecba58f115c81853879a691fd94f

[![NPM](https://nodei.co/npm/hilbert-chart.png?compact=true)](https://nodei.co/npm/hilbert-chart/)

## Quick start

```
import HilbertChart from 'hilbert-chart';
```
or
```
const HilbertChart = require('hilbert-chart');
```
or even
```
<script src="//unpkg.com/hilbert-chart"></script>
```
then
```
const myChart = HilbertChart();

myChart
  .hilbertOrder(<hilbertOrder>)
  .data(<myData>)
  (<myDOMElement>);
```

## API reference 

| Method | Description | Default |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------- |
| <b>width</b>([<i>number</i>]) | Getter/setter for the length of each side of the square chart, in px. | (fit to window) |
| <b>margin</b>([<i>number</i>]) | Getter/setter for the chart margin that contains the axis ticks and labels, in px. | `90` |
| <b>hilbertOrder</b>([<i>number</i>]) | Getter/setter for the extent of the hilbert curve range, determined by `4^order`. | `4` |
| <b>data</b>([<i>array</i>]) | Getter/setter for the list of ranges to render. Each range object should follow the minimum syntax of `{start: <int>, end: <int>}`. | `[]` |
| <b>rangeLabel</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object label accessor function (`fn(range)`) or attribute. | `name` |
| <b>rangeColor</b>([<i>fn</i>]) | Getter/setter for the range object color accessor function (`fn(range)`) or attribute. | (cycle through d3.schemeCategory20 for unique labels) |
| <b>valFormatter</b>([<i>fn</i>]) | Getter/setter for the value formatting function (`fn(value)`), as text displayed in axis ticks and tooltips. Should return a string. | `d => d` |
| <b>showValTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a value tooltip on mouse-over. | `true` |
| <b>showRangeTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a range tooltip on mouse-over. | `true` |
| <b>rangeTooltipContent</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object tooltip content accessor function or attribute. Supports plain text or HTML content. | `<label>: <start> - <end>` |
| <b>focusOn</b>(<i>pos</i>, <i>length</i>) | Zoom-in on a particular area of the chart, defined by [`pos`, `pos+length-1`]. May be an approximation if `length` doesn't match a logical bit boundary. ||
