# Hilbert Chart

A hilbert space-filling curve D3 chart for representing one-dimensional lengths on a two-dimensional space.

Live example at: http://bl.ocks.org/vasturiano/8aceecba58f115c81853879a691fd94f

[![NPM](https://nodei.co/npm/hilbert-chart.png?compact=true)](https://nodei.co/npm/hilbert-chart/)

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

## API reference

```
HilbertChart()
     .width(<px>)
     .margin(<px>)
     .rangeColor(<colorFunction(d)>)
     .valFormatter(<formatterFunction(val)>)
     .rangeFormatter(<formatterFunction([start, end])>)
     .showValTooltip(<boolean>)
     .showRangeTooltip(<boolean>)
     .focusOn(<pos>, <length>)
```
