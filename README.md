Hilbert Chart
==============

[![NPM package][npm-img]][npm-url]
[![Build Size][build-size-img]][build-size-url]
[![Dependencies][dependencies-img]][dependencies-url]

A hilbert space-filling curve chart for representing one-dimensional lengths on a two-dimensional space.

Live example at: https://observablehq.com/@vasturiano/hilbert-map-of-ipv4-address-space

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

### Initialisation
```
HilbertChart({ configOptions })(<domElement>)
```

| Config options | Description | Default |
| --- | --- | :--: |
| <b>useCanvas</b>: <i>boolean</i> | Whether to use **HTML5 Canvas** (`true`) or **SVG** (`false`) as rendering method. Range tooltips and click/hover events are not supported in Canvas mode, but it yields much better rendering performance for very large number of items. | `false` |

### Methods

| Method | Description | Default |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------- |
| <b>width</b>([<i>number</i>]) | Getter/setter for the length of each side of the square chart, in px. | (fit to window) |
| <b>margin</b>([<i>number</i>]) | Getter/setter for the chart margin that contains the axis ticks and labels, in px. | 90 |
| <b>hilbertOrder</b>([<i>number</i>]) | Getter/setter for the extent of the hilbert curve range, determined by `4^order`. Values higher than `26` are disadvised, due to the JavaScript's [MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER). | 4 |
| <b>data</b>([<i>array</i>]) | Getter/setter for the list of ranges to render. Each range object should follow the minimum syntax of `{start: <int>, length: <int>}`. | `[]` |
| <b>rangeLabel</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object label accessor function (`fn(range)`) or attribute. | `name` |
| <b>rangeColor</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object color accessor function (`fn(range)`) or attribute. | (cycle through d3.schemeCategory20 for unique labels) |
| <b>rangePadding</b>([<i>number</i>, <i>string</i> or <i>fn</i>]) | Getter/setter for the range object padding ratio accessor function (`fn(range)`), attribute or a constant number for all ranges. The padding ratio should be a number between `0` and `1` representing the proportional size of the padding space compared to the width of the path. | 0 |
| <b>valFormatter</b>([<i>fn</i>]) | Getter/setter for the value formatting function (`fn(value)`), as text displayed in axis ticks and tooltips. Should return a string. | `d => d` |
| <b>focusOn</b>(<i>pos</i>, <i>length</i>, [<i>ms</i>]) | Zoom-in on a particular area of the chart, defined by [`pos`, `pos+length-1`]. May be an approximation if `length` doesn't match a logical bit boundary. An optional 3rd argument defines the duration of the transition (in ms) to animate the zooming motion. A value of 0 (default) jumps immediately to the final position. ||
| <b>showValTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a value tooltip on mouse-over. | `true` |
| <b>showRangeTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a range tooltip on mouse-over. | `true` |
| <b>rangeTooltipContent</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object tooltip content accessor function or attribute. Supports plain text or HTML content. | `<label>: <start> - <end>` |
| <b>onRangeClick</b>(<i>fn</i>) | Callback function for range clicks. The range object is included as single argument `onRangeClick(range)`. | - |
| <b>onRangeHover</b>(<i>fn</i>) | Callback function for range mouse over events. The range object (or `null` if hovering out) is included as single argument `onRangeHover(range)`. | - |


[npm-img]: https://img.shields.io/npm/v/hilbert-chart.svg
[npm-url]: https://npmjs.org/package/hilbert-chart
[build-size-img]: https://img.shields.io/bundlephobia/minzip/hilbert-chart.svg
[build-size-url]: https://bundlephobia.com/result?p=hilbert-chart
[dependencies-img]: https://img.shields.io/david/vasturiano/hilbert-chart.svg
[dependencies-url]: https://david-dm.org/vasturiano/hilbert-chart

