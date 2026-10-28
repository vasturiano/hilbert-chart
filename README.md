Hilbert Chart
==============

[![NPM package][npm-img]][npm-url]
[![Build Size][build-size-img]][build-size-url]
[![NPM Downloads][npm-downloads-img]][npm-downloads-url]
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url)

A hilbert space-filling curve chart for representing one-dimensional lengths on a two-dimensional space. 

<p align="center">
   <a href="https://vasturiano.github.io/hilbert-chart/examples/ipv4-address-space/"><img width="75%" src="https://vasturiano.github.io/hilbert-chart/examples/ipv4-address-space/preview.png"></a>
</p>


Supports optional rendering on Canvas to handle very large datasets, and features a [heatmap layer](https://vasturiano.github.io/hilbert-chart/examples/heatmap/) for representing a set of single points.

Uses [d3-hilbert](https://github.com/vasturiano/d3-hilbert) for the layout computation.

## Examples

* [IPv4 Address Space](https://vasturiano.github.io/hilbert-chart/examples/ipv4-address-space/) ([source](https://github.com/vasturiano/hilbert-chart/blob/master/examples/ipv4-address-space/index.html))
* [IPv4 prefixes (~1M using canvas)](https://vasturiano.github.io/hilbert-chart/examples/ipv4-prefix-viz/) ([source](https://github.com/vasturiano/hilbert-chart/blob/master/examples/ipv4-prefix-viz/index.html))
* [Ordinal (square pie chart)](https://vasturiano.github.io/hilbert-chart/examples/ordinal/) ([source](https://github.com/vasturiano/hilbert-chart/blob/master/examples/ordinal/index.html))
* [Heatmap](https://vasturiano.github.io/hilbert-chart/examples/heatmap/) ([source](https://github.com/vasturiano/hilbert-chart/blob/master/examples/heatmap/index.html))

Also live example at: https://observablehq.com/@vasturiano/hilbert-map-of-ipv4-address-space

## Quick start

```js
import HilbertChart from 'hilbert-chart';
```
or using a *script* tag
```html
<script src="//cdn.jsdelivr.net/npm/hilbert-chart"></script>
```
then
```js
const myChart = new HilbertChart(<myDOMElement>)
  .hilbertOrder(<hilbertOrder>)
  .data(<myData>);
```

## API reference

### Initialisation
```js
new HilbertChart(<domElement>, { configOptions })
```

| Config options | Description | Default |
| --- | --- | :--: |
| <b>useCanvas</b>: <i>boolean</i> | Whether to use **HTML5 Canvas** (`true`) or **SVG** (`false`) as rendering method. Canvas yields much better rendering performance for very large number of items. | `false` |
| <b>zoomWithModKey</b>: <i>boolean</i> | Whether to require a modifier key (meta or ctrl) to be pressed in order to engage the scrolling zoom. | `false` |

### Methods

| Method | Description | Default |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------- |
| <b>width</b>([<i>number</i>]) | Getter/setter for the length of each side of the square chart, in px. | (fit to window) |
| <b>margin</b>([<i>number</i>]) | Getter/setter for the chart margin that contains the axis ticks and labels, in px. | 90 |
| <b>hilbertOrder</b>([<i>number</i>]) | Getter/setter for the extent of the hilbert curve range, determined by `4^order`. Values higher than `26` are disadvised, due to JavaScript's [MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER). | 4 |
| <b>data</b>([<i>array</i>]) | Getter/setter for the list of ranges to render. Each range object should follow the minimum syntax of `{start: <int>, length: <int>}`. | `[]` |
| <b>heatmapPoints</b>([<i>array</i>]) | Getter/setter for an array of numeric values to render as a heatmap overlay on the chart. | `[]` |
| <b>heatmapPointRadius</b>([<i>number</i>]) | Getter/setter for the blur radius (in px) of each heatmap point. Larger values produce smoother, more diffuse heatmaps. | `20` |
| <b>heatmapOpacity</b>([<i>number</i>]) | Getter/setter for the opacity of the heatmap overlay. | `0.8` |
| <b>rangeLabel</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object label accessor function (`fn(range)`) or attribute. | `name` |
| <b>rangeLabelColor</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object label color accessor function (`fn(range)`) or attribute. | `() => 'black'` |
| <b>rangeColor</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object color accessor function (`fn(range)`) or attribute. | (cycle through d3.schemeCategory20 for unique labels) |
| <b>rangePadding</b>([<i>number</i>, <i>string</i> or <i>fn</i>]) | Getter/setter for the range object padding ratio accessor function (`fn(range)`), attribute or a constant number for all ranges. The padding ratio should be a number between `0` and `1` representing the proportional size of the padding space compared to the width of the path. | 0 |
| <b>rangePaddingAbsolute</b>([<i>number</i>, <i>string</i> or <i>fn</i>]) | Getter/setter for the range object absolute padding accessor function (`fn(range)`), attribute or a constant number for all ranges. This absolute padding is added to the relative one set with `rangePadding`. | 0 |
| <b>valFormatter</b>([<i>fn</i>]) | Getter/setter for the value formatting function (`fn(value)`), as text displayed in axis ticks and tooltips. Should return a string. | `d => d` |
| <b>simplifyCurves</b>([<i>boolean</i>]) | Getter/setter for whether to simplify the resolution of the curve to the most canonical 2-bit boundary that fits the range integral. For example, in a 2nd order curve (16 values), a range from 4 to 11 can be simplified from 8 vertices to 2 (each filling a square with 4 values), on the lower quadrants. This simplification greatly reduces the number of vertices in the curve and improves the calculation and rendering performance, specially for high-order ranges which tend to fall on bit boundaries. | `true` |
| <b>focusOn</b>(<i>pos</i>, <i>length</i>, [<i>ms</i>]) | Zoom-in on a particular area of the chart, defined by [`pos`, `pos+length-1`]. May be an approximation if `length` doesn't match a logical bit boundary. An optional 3rd argument defines the duration of the transition (in ms) to animate the zooming motion. A value of 0 (default) jumps immediately to the final position. ||
| <b>showValTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a value tooltip on mouse-over. | `true` |
| <b>showRangeTooltip</b>([<i>boolean</i>]) | Getter/setter for whether to show a range tooltip on mouse-over. | `true` |
| <b>rangeTooltipContent</b>([<i>string</i> or <i>fn</i>]) | Getter/setter for the range object tooltip content accessor function or attribute. Supports plain text or HTML content. | `<label>: <start> - <end>` |
| <b>enableZoom</b>([<i>boolean</i>]) | Getter/setter for whether to enable zoom/pan interaction in the chart. | `true` |
| <b>onRangeClick</b>(<i>fn</i>) | Callback function for range clicks. The range object is included as single argument `onRangeClick(range)`. | - |
| <b>onRangeHover</b>(<i>fn</i>) | Callback function for range mouse over events. The range object (or `null` if hovering out) is included as single argument `onRangeHover(range)`. | - |
| <b>onPointerMove</b>(<i>fn</i>) | Callback function for pointer move events over the hilbert canvas. The hilbert curve value directly under the mouse pointer is included as argument, as well as the event object itself. `onPointerMove(value, event)`. | - |
| <b>onZoom</b>(<i>fn</i>) | Callback function for zoom/pan events. The current zoom transform is included as single argument `onZoom({ k, x, y })`. Note that `onZoom` is triggered by user interaction as well as programmatic zooming/panning with `focusOn()`. | - |
| <b>onZoomEnd</b>(<i>fn</i>) | Callback function for 'end' of zoom/pan events. The current zoom transform is included as single argument `onZoomEnd({ k, x, y })`. Note that `onZoomEnd` is triggered by user interaction as well as programmatic zooming/panning with `focusOn()`. | - |

## ❤️ Support This Project

If you find this module useful and would like to support its development, you can [buy me a ☕](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url). Your contributions help keep open-source sustainable!
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url)


[npm-img]: https://img.shields.io/npm/v/hilbert-chart
[npm-url]: https://npmjs.org/package/hilbert-chart
[build-size-img]: https://img.shields.io/bundlephobia/minzip/hilbert-chart
[build-size-url]: https://bundlephobia.com/result?p=hilbert-chart
[npm-downloads-img]: https://img.shields.io/npm/dt/hilbert-chart
[npm-downloads-url]: https://www.npmtrends.com/hilbert-chart

