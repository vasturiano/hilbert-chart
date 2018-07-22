import './hilbert.css';

import { select as d3Select, event as d3Event, mouse as d3Mouse } from 'd3-selection';
import { scaleLinear as d3ScaleLinear, scaleOrdinal as d3ScaleOrdinal, schemeCategory20 as d3SchemeCategory20 } from 'd3-scale';
import { axisLeft as d3AxisLeft, axisRight as d3AxisRight, axisTop as d3AxisTop, axisBottom as d3AxisBottom } from 'd3-axis';
import { zoom as d3Zoom, zoomTransform as d3ZoomTransform } from 'd3-zoom';
import d3Hilbert from 'd3-hilbert';
import d3Tip from 'd3-tip';
import heatmap from 'heatmap.js';
import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';

const N_TICKS = Math.pow(2, 3); // Force place ticks on bit boundaries

export default Kapsule({
  props: {
    width: {},
    margin: { default: 90 },
    hilbertOrder: { default: 4 }, // 0-255 default
    data: { default: [] },
    rangeLabel: { default: 'name' },
    rangeColor: {},
    valFormatter: { default: d => d },
    showValTooltip: { default: true, triggerUpdate: false },
    showRangeTooltip: { default: true, triggerUpdate: false },
    rangeTooltipContent: { triggerUpdate: false }
  },

  methods: {
    focusOn: function(state, pos, length) {
      const N_SAMPLES = Math.pow(4, 2) + 1; // +1 to sample outside of bit boundaries
      const pnts = [{ start: pos, length: 1 }, ...[...Array(N_SAMPLES).keys()].map(n => ({ start: pos + Math.round(length * (n + 1)/ N_SAMPLES), length: 1 }))];
      pnts.forEach(state.hilbert.layout);

      // Figure out bounding box (in side bit units)
      const tl = [Math.min(...pnts.map(p => p.startCell[0])), Math.min(...pnts.map(p => p.startCell[1]))];
      const br = [Math.max(...pnts.map(p => p.startCell[0])), Math.max(...pnts.map(p => p.startCell[1]))];
      const side = Math.max(br[0] - tl[0], br[1] - tl[1]);

      const zoomTransform = d3ZoomTransform(this);
      zoomTransform.x = -tl[0] * state.canvasWidth / side;
      zoomTransform.y = -tl[1] * state.canvasWidth / side;
      zoomTransform.k = Math.pow(2, state.hilbertOrder) / side;

      this._applyZoom(zoomTransform);

      return this;
    },
    addMarker(state, pos, markerUrl, width, height, tooltipFormatter) {
      tooltipFormatter = tooltipFormatter || (d => state.valFormatter(d.start));

      const range = {
        start: pos,
        length: 1
      };
      state.hilbert.layout(range);

      const marker = state.svg.select('.markers-canvas').append('svg:image')
        .attr('xlink:href', markerUrl)
        .attr('width', width)
        .attr('height', height)
        .attr('x', range.startCell[0] * range.cellWidth - width/2)
        .attr('y', range.startCell[1] * range.cellWidth - height/2);

      // Tooltip
      const markerTooltip = d3Tip()
        .attr('class', 'hilbert-tooltip')
        .offset([-15, 0])
        .html(tooltipFormatter);
      state.svg.call(markerTooltip);

      marker.on('mouseover', markerTooltip.show);
      marker.on('mouseout', markerTooltip.hide);

      return this;
    },
    addHeatmap(pnts) {
      const hmData = pnts.map(pnt => {
        const hPnt = { start: pnt, length: 1 };
        state.hilbert.layout(hPnt);
        return {
          x: Math.round(hPnt.startCell[0] * hPnt.cellWidth),
          y: Math.round(hPnt.startCell[1] * hPnt.cellWidth),
          value: 1
        };
      });

      const svgBox = state.svg.node().getBoundingClientRect();
      const hmElem = d3Select(state.nodeElem).append('div')
        .attr('class', 'hilbert-heatmap')
        .style('top', (svgBox.top + state.margin) + 'px')
        .style('left', (svgBox.left + state.margin) + 'px')
        .append('div')
          .style('width', state.canvasWidth + 'px')
          .style('height', state.canvasWidth + 'px');

      heatmap.create({
        container: hmElem.node()
      }).setData({
        max: 100,
        data: hmData
      });

      return this;
    },
    _refreshAxises(state) {
      // Adjust axises
      const axises = state.axises;

      state.axisScaleX.range([0, state.canvasWidth]);
      state.axisScaleY.range([0, state.canvasWidth]);

      axises.select('.axis-left').call(state.axisLeft.scale(state.axisScaleY));
      axises.select('.axis-right').call(state.axisRight.scale(state.axisScaleY));
      axises.select('.axis-top').call(state.axisTop.scale(state.axisScaleX))
        .selectAll('text')
          .attr('x', 9)
          .attr('dy', '.35em')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'start');
      axises.select('.axis-bottom').call(state.axisBottom.scale(state.axisScaleX))
        .selectAll('text')
          .attr('x', -9)
          .attr('dy', '.35em')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end');

      return this;
    },
    _applyZoom(state, zoomTransform) {
      // Translate canvas
      state.hilbertCanvas.attr('transform', zoomTransform);

      state.axisScaleX = zoomTransform.rescaleX(state.axisScaleX.domain([0, N_TICKS]));
      state.axisScaleY = zoomTransform.rescaleY(state.axisScaleY.domain([0, N_TICKS]));
      state.zoomBox[0] = [state.axisScaleX.domain()[0], state.axisScaleY.domain()[0]];
      state.zoomBox[1] = [state.axisScaleX.domain()[1], state.axisScaleY.domain()[1]];

      this._refreshAxises();

      return this;
    }
  },

  stateInit() {
    return {
      hilbert: d3Hilbert().simplifyCurves(true),
      defaultColorScale: d3ScaleOrdinal(d3SchemeCategory20),
      zoomBox: [[0, 0], [N_TICKS, N_TICKS]],
      axisScaleX: d3ScaleLinear().domain([0, N_TICKS]),
      axisScaleY: d3ScaleLinear().domain([0, N_TICKS])
    };
  },

  init: function(nodeElem, state) {
    // Dom
    state.nodeElem = nodeElem;

    const svg = state.svg = d3Select(nodeElem)
      .attr('class', 'hilbert-chart')
      .append('svg');

    const defs = state.defs = svg.append('defs');

    const zoomCanvas = state.zoomCanvas = svg.append('g');
    const hilbertCanvas = state.hilbertCanvas = zoomCanvas.append('g')
      .attr('class', 'hilbert-canvas');

    hilbertCanvas.append('rect')
      .attr('class', 'zoom-trap')
      .attr('x', 0)
      .attr('y', 0)
      .attr('opacity', 0);

    hilbertCanvas.append('g').attr('class', 'ranges-canvas');
    hilbertCanvas.append('g').attr('class', 'markers-canvas');

    // Zoom interaction
    zoomCanvas.call(state.zoom = d3Zoom()
      .on('zoom', () => this._applyZoom(d3Event.transform))
    );

    defs.append('clipPath')
      .attr('id', 'canvas-cp')
      .append('rect')
        .attr('x', 0)
        .attr('y', 0);

    zoomCanvas.attr('clip-path', 'url(#canvas-cp)');

    // Range Tooltip
    svg.call(state.rangeTooltip = d3Tip()
      .attr('class', 'hilbert-tooltip')
      .offset([-30, 0])
      .html(d => {
        if (state.rangeTooltipContent) { return accessorFn(state.rangeTooltipContent)(d); }

        // default tooltip
        const rangeLabel = accessorFn(state.rangeLabel);
        const rangeFormatter = d => state.valFormatter(d.start) + (d.length > 1 ? ' - ' + state.valFormatter(d.start + d.length - 1) : '');
        return `<b>${rangeLabel(d)}</b>: ${rangeFormatter(d)}`;
      })
    );

    // Value Tooltip
    let valTooltip = d3Select('#val-tooltip');

    if (valTooltip.empty()) {
      valTooltip = d3Select('body').append('div')
        .attr('id', 'val-tooltip')
    }

    valTooltip.classed('hilbert-tooltip', true);

    hilbertCanvas.on('mouseover', () => state.showValTooltip && valTooltip.style('display', 'inline'));
    hilbertCanvas.on('mouseout', () => valTooltip.style('display', 'none'));
    hilbertCanvas.on('mousemove', function() {
      if (!state.showValTooltip) return;

      const coords = d3Mouse(this);
      valTooltip.text(state.valFormatter(state.hilbert.getValAtXY(coords[0], coords[1])))
        .style('left', `${d3Event.pageX}px`)
        .style('top', `${d3Event.pageY}px`);
    });

    // Setup axises
    state.axisLeft = d3AxisLeft().tickFormat(getTickFormatter(0));
    state.axisRight = d3AxisRight().tickFormat(getTickFormatter(1));
    state.axisTop = d3AxisTop().tickFormat(getTickFormatter(null, 0));
    state.axisBottom = d3AxisBottom().tickFormat(getTickFormatter(null, 1));

    state.axises = state.svg.append('g').attr('class', 'hilbert-axises');
    state.axises.append('g').attr('class', 'axis-left');
    state.axises.append('g').attr('class', 'axis-right');
    state.axises.append('g').attr('class', 'axis-top');
    state.axises.append('g').attr('class', 'axis-bottom');

    //

    function getTickFormatter(xZoomBoxIdx, yZoomBoxIdx) {
      return d => {
        // Convert to canvas coordinates
        const relD = d * state.canvasWidth / N_TICKS;
        const zoomBox = state.zoomBox;
        const nCells = Math.pow(2, state.hilbertOrder);

        const xy = [
          xZoomBoxIdx != null ? state.axisScaleX(zoomBox[xZoomBoxIdx][0]): relD,
          yZoomBoxIdx != null ? state.axisScaleY(zoomBox[yZoomBoxIdx][1]) : relD
        ].map(coord =>
            // Prevent going off canvas
          Math.min(coord, state.canvasWidth * (1 - 1/nCells))
        );

        return state.valFormatter(state.hilbert.getValAtXY(xy[0], xy[1]));
      }
    }
  },

  update: function(state) {
    const canvasWidth = state.canvasWidth = state.width || Math.min(window.innerWidth, window.innerHeight) - state.margin * 2;
    const labelAcessor = accessorFn(state.rangeLabel);
    const colorAccessor = state.rangeColor ? accessorFn(state.rangeColor) : (d => state.defaultColorScale(labelAcessor(d)));

    state.hilbert
      .order(state.hilbertOrder)
      .canvasWidth(canvasWidth);

    // resizing
    state.svg
      .attr('width', canvasWidth + state.margin * 2)
      .attr('height', canvasWidth + state.margin * 2);

    state.zoomCanvas.attr('transform', `translate(${state.margin}, ${state.margin})`);

    state.hilbertCanvas.select('.zoom-trap')
      .attr('width', canvasWidth)
      .attr('height', canvasWidth);

    state.defs.select('#canvas-cp rect')
      .attr('width', state.canvasWidth)
      .attr('height', state.canvasWidth);

    state.zoom
      .scaleExtent([1, Math.pow(2, state.hilbertOrder)])
      .translateExtent([[0, 0], [canvasWidth + state.margin * 2, canvasWidth + state.margin * 2]]);

    state.axises.attr('transform', `translate(${state.margin}, ${state.margin})`);
    state.axises.select('.axis-right').attr('transform', `translate(${canvasWidth},0)`);
    state.axises.select('.axis-bottom').attr('transform', `translate(0,${canvasWidth})`);

    this._refreshAxises();

    // D3 digest
    state.data.forEach(state.hilbert.layout);

    let rangePaths = state.svg.select('.ranges-canvas')
      .selectAll('.hilbert-segment')
      .data(state.data.slice());

    rangePaths.exit().remove();

    const newPaths = rangePaths.enter().append('g')
      .attr('class', 'hilbert-segment')
      .on('mouseover', d => state.showRangeTooltip && state.rangeTooltip.show(d))
      .on('mouseout', state.rangeTooltip.hide);

    newPaths.append('path')
      .on('mouseenter', function() { d3Select(this).transition().duration(200).style('opacity', 1); })
      .on('mouseleave', function() { d3Select(this).transition().duration(400).style('opacity', 0.8); });

    newPaths.append('text')
      .attr('dy', 0.035)
      .append('textPath')
      // Label that follows the path contour
      .attr('xlink:href', d => {
        const id = 'textPath-' + Math.round(Math.random() * 1e10);
        state.defs.append('path')
          .attr('id', id)
          .attr('d', getHilbertPath(d.pathVertices));

        return '#' + id;
      })
      .text(d => {
        const MAX_TEXT_COMPRESSION = 8;
        const name = labelAcessor(d);

        return (!d.pathVertices.length || name.length / (d.pathVertices.length + 1) > MAX_TEXT_COMPRESSION) ? '' : name;
      })
      .attr('textLength', d => {
        const MAX_TEXT_EXPANSION = 0.4;
        return Math.min(d.pathVertices.length, labelAcessor(d).length * MAX_TEXT_EXPANSION);
      })
      .attr('startOffset', function(d) {
        if (!d.pathVertices.length) return '0';
        return ((1 - d3Select(this).attr('textLength') / d.pathVertices.length) / 2 * 100) + '%'
      });

    // Ensure propagation of data binding into sub-elements
    rangePaths.select('path');

    rangePaths = rangePaths.merge(newPaths);

    rangePaths.selectAll('path') //.transition()
      .attr('d', d => getHilbertPath(d.pathVertices))
      .style('stroke', colorAccessor);

    rangePaths
      .attr('transform', d =>
        `scale(${d.cellWidth}) translate(${d.startCell[0] +.5},${d.startCell[1] +.5})`
      );

    rangePaths.selectAll('text')
      .attr('font-size', d => Math.min(...[
        0.25,                 // Max 25% of path height
        (d.pathVertices.length + 1) * 0.25, // Max 25% path length
        canvasWidth / d.cellWidth * 0.03  // Max 3% of canvas size
      ]))
      .attr('textLength', d => {
        let MAX_TEXT_EXPANSION;

        const name = labelAcessor(d);
        if (d.pathVertices.length) {
          // Include it on text element for Firefox support
          MAX_TEXT_EXPANSION = 0.4;
          return Math.min(d.pathVertices.length, name.length * MAX_TEXT_EXPANSION);
        } else {
          MAX_TEXT_EXPANSION = 0.15;
          return Math.min(0.95, name.length * MAX_TEXT_EXPANSION);
        }
      })
      .filter(d => !d.pathVertices.length)
      // Those with no path (plain square)
      .text(d => {
        const MAX_TEXT_COMPRESSION = 10;

        const name = labelAcessor(d);
        return (name.length > MAX_TEXT_COMPRESSION) ? '' : name;
      })
      .attr('text-anchor', 'middle');

    //

    function getHilbertPath(vertices) {
      let path = 'M0 0L0 0';

      vertices.forEach(function(vert) {
        switch(vert) {
          case 'U': path += 'v-1'; break;
          case 'D': path += 'v1'; break;
          case 'L': path += 'h-1'; break;
          case 'R': path += 'h1'; break;
        }
      });
      return path;
    }
  }
});
