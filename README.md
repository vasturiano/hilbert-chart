# Timelines Chart

A hilbert space-filling curve D3 chart for representing one-dimensional lengths on a two-dimensional space.

Live example at: http://bl.ocks.org/vasturiano/8aceecba58f115c81853879a691fd94f

## Quick start

```
npm install
npm run build
```

## How to instantiate

```
import { default as HilbertChart } from 'hilbert-chart';
```
or
```
var HilbertChart = require('hilbert-chart');
```
or even
```
<script src="/path/to/dist/hilbert-chart.js"></script>
```
then
```
var myChart = HilbertChart();

myChart(<myDOMElement>, <myData>, <hilbertOrder>);
```

## API functionality

```
HilbertChart()
     .width(<px>)
     .margin(<px>)
     .valFormatter(<formatterFunction(val)>)
     .rangeFormatter(<formatterFunction([start, end])>)
```