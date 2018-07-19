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

myChart(<myDOMElement>, <myData>, <hilbertOrder>);
```

## API reference

### Instantiation

`chartObject(domElement, data, hilbertOrder)`

| Parameter | Type | Description |
| --- | --- | --- |
| <i>domElement</i> | DOM node | The document node to attach the graph to. |
| <i>data</i> | Array | List of ranges to render. Each range object should follow the minimum syntax of `{start: <int>, end: <int>}`. |
| <i>hilbertOrder | int | The extent of the hilbert curve range, determined by `4^order`. |

### Object methods 

| Method | Description | Default |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------- |
| <b>width</b>([<i>number</i>]) | Getter/setter for the length of each side of the square chart, in px. | (fit to window) |
| <b>margin</b>([<i>number</i>]) | Getter/setter for the chart margin that contains the axis ticks and labels, in px. | `90` |
| <b>rangeColor</b>([<i>function</i>]) | Getter/setter for the range object color accessor function (`fn(range)`). | (cycle through d3.schemeCategory20 for unique range.name) |
| <b>valFormatter</b>([<i>function</i>]) | Getter/setter for the value formatting function (`fn(value)`), as text displayed in axis ticks and tooltips. Should return a string. | `value` |
| <b>rangeFormatter</b>([<i>function</i>]) | Getter/setter for the range formatting function (`fn(range)`), as text displayed in tooltips. Should return a string. | `start - end` |
| <b>showValTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a value tooltip on mouse-over. | true |
| <b>showRangeTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a range tooltip on mouse-over. | true |
| <b>focusOn</b>(<i>pos</i>, <i>length</i>) | Zoom-in on a particular area of the chart, defined by [`pos`, `pos+length-1`]. May be an approximation if `length` doesn't match a logical bit boundary. ||
