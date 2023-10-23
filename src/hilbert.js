import { select as d3Select, pointer as d3Pointer } from 'd3-selection';
import { scaleLinear as d3ScaleLinear, scaleOrdinal as d3ScaleOrdinal } from 'd3-scale';
import { schemePaired as d3SchemePaired } from 'd3-scale-chromatic';
import { axisLeft as d3AxisLeft, axisRight as d3AxisRight, axisTop as d3AxisTop, axisBottom as d3AxisBottom } from 'd3-axis';
import { zoom as d3Zoom, zoomTransform as d3ZoomTransform, ZoomTransform } from 'd3-zoom';
import d3Hilbert from 'd3-hilbert';
import d3Tip from 'd3-tip';
import gsap from 'gsap';
import './canvas-textpath/ctxtextpath.js';
import heatmap from 'heatmap.js';
import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';
import ColorTracker from 'canvas-color-tracker';

const N_TICKS = Math.pow(2, 3); // Force place ticks on bit boundaries
const MAX_OBJECTS_TO_ANIMATE_ZOOM = 90e3; // To prevent blocking interaction in canvas mode
const MAX_OBJECTS_TO_ALWAYS_UPDATE_SHADOW_CANVAS = 9e3; // Threshold to update canvas color interaction during zooming

export default Kapsule({
  props: {
    width: {},
    margin: { default: 90 },
    hilbertOrder: { default: 4 }, // 0-255 default
    data: { default: [] },
    rangeLabel: { default: 'name' },
    rangeLabelColor: { default: () => 'black' },
    rangeColor: {},
    rangePadding: { default: 0 },
    valFormatter: { default: d => d },
    showValTooltip: { default: true, triggerUpdate: false },
    showRangeTooltip: { default: true, triggerUpdate: false },
    rangeTooltipContent: { triggerUpdate: false },
    onRangeClick: { triggerUpdate: false },
    onRangeHover: { triggerUpdate: false },
    onZoom: { triggerUpdate: false },
    onZoomEnd: { triggerUpdate: false }
  },

  methods: {
    focusOn: function(state, pos, length, transitionDuration) {
      setTimeout(() => { // async so that it runs after initialization
        const N_SAMPLES = Math.pow(4, 2) + 1; // +1 to sample outside of bit boundaries
        const pnts = [{ start: pos, length: 1 }, ...[...Array(N_SAMPLES).keys()].map(n => ({ start: pos + Math.round(length * (n + 1)/ N_SAMPLES), length: 1 }))];
        pnts.forEach(state.hilbert.layout);

        // Figure out bounding box (in side bit units)
        const tl = [Math.min(...pnts.map(p => p.startCell[0])), Math.min(...pnts.map(p => p.startCell[1]))];
        const br = [Math.max(...pnts.map(p => p.startCell[0])), Math.max(...pnts.map(p => p.startCell[1]))];
        const side = Math.max(br[0] - tl[0], br[1] - tl[1]);

        const destination = {
          x: -tl[0] * state.canvasWidth / side,
          y: -tl[1] * state.canvasWidth / side,
          k: Math.pow(2, state.hilbertOrder) / side
        };

        if (!transitionDuration) { // no animation
          state.zoom.transform(state.zoom.__baseElem, new ZoomTransform(destination.k, destination.x, destination.y));
        } else {
          const t = { ...d3ZoomTransform(state.zoom.__baseElem.node()) }; // { k, x, y }
          gsap.to(
            t,
            Object.assign({
              duration: transitionDuration / 1000,
              ease: 'power1.inOut',
              onUpdate: () => {
                state.zooming = true;
                state.zoom.transform(state.zoom.__baseElem, new ZoomTransform(t.k, t.x, t.y))
              },
              onComplete: () => state.zooming = false,
            }, destination)
          );
        }
      });

      return this;
    },
    addMarker(state, pos, markerUrl, width, height, tooltipFormatter) {
      if (state.useCanvas) return this; // not supported in canvas mode

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

      marker.on('mouseover', (ev, d) => markerTooltip.show(d));
      marker.on('mouseout', (ev, d) => markerTooltip.hide(d));

      return this;
    },
    addHeatmap(pnts) {
      if (state.useCanvas) return this; // not supported in canvas mode

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

      const axisScaleX = state.zoomedAxisScaleX || state.axisScaleX;
      const axisScaleY = state.zoomedAxisScaleY || state.axisScaleY;

      axisScaleX.range([0, state.canvasWidth]);
      axisScaleY.range([0, state.canvasWidth]);
      state.axisScaleX.range([0, state.canvasWidth]);
      state.axisScaleY.range([0, state.canvasWidth]);

      axises.select('.axis-left').call(state.axisLeft.scale(axisScaleY));
      axises.select('.axis-right').call(state.axisRight.scale(axisScaleY));
      axises.select('.axis-top').call(state.axisTop.scale(axisScaleX))
        .selectAll('text')
          .attr('x', 9)
          .attr('dy', '.35em')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'start');
      axises.select('.axis-bottom').call(state.axisBottom.scale(axisScaleX))
        .selectAll('text')
          .attr('x', -9)
          .attr('dy', '.35em')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end');

      return this;
    }
  },

  stateInit() {
    const shadowCanvasEl = document.createElement('canvas');
    return {
      hilbert: d3Hilbert().simplifyCurves(true),
      defaultColorScale: d3ScaleOrdinal(d3SchemePaired),
      zoomBox: [[0, 0], [N_TICKS, N_TICKS]],
      axisScaleX: d3ScaleLinear().domain([0, N_TICKS]),
      axisScaleY: d3ScaleLinear().domain([0, N_TICKS]),
      shadowCanvasEl,
      shadowCtx: shadowCanvasEl.getContext('2d', { willReadFrequently: true })
    };
  },

  init: function(el, state, { useCanvas = false }) {
    const isD3Selection = !!el && typeof el === 'object' && !!el.node && typeof el.node === 'function';
    const d3El = d3Select(isD3Selection ? el.node() : el);
    d3El.html(null); // Wipe DOM

    // Dom
    state.nodeElem = d3El.node();
    state.useCanvas = useCanvas;

    const svg = state.svg = d3El
      .attr('class', 'hilbert-chart')
      .append('svg')
        .style('display', 'block');

    state.canvasWidth = state.width || Math.min(window.innerWidth, window.innerHeight) - state.margin * 2;

    // zoom interaction
    state.zoom = d3Zoom()
      .on('zoom', ev => {
        const zoomTransform = ev.transform;
        ev.sourceEvent && (state.zooming = true);

        // Adjust axes
        const xScale = state.zoomedAxisScaleX = zoomTransform.rescaleX(state.axisScaleX);
        const yScale = state.zoomedAxisScaleY = zoomTransform.rescaleY(state.axisScaleY);
        state.zoomBox[0] = [xScale.domain()[0], yScale.domain()[0]];
        state.zoomBox[1] = [xScale.domain()[1], yScale.domain()[1]];

        // Apply transform to chart
        if (!useCanvas) { // svg
          state.hilbertCanvas.attr('transform', zoomTransform);
          this._refreshAxises();
        } else { // canvas
          // reapply zoom transform on rerender (without recalculating layout)
          state.skipRelayout = true;
          requestAnimationFrame(state._rerender);
        }

        state.onZoom && state.onZoom({ ...zoomTransform });
      })
      .on('end', ev => {
        if (ev.sourceEvent && ev.sourceEvent.type === 'mouseup' && !state.zooming) return; // ignore clicks without drag
        ev.sourceEvent && (state.zooming = false); // end of interactive zoom
        if (useCanvas) {
          state.skipRelayout = true;
          requestAnimationFrame(state._rerender);
        }
        state.onZoomEnd && state.onZoomEnd({ ...ev.transform })
      });

    let hilbertCanvas;
    if (!useCanvas) { // svg mode
      const defs = state.defs = svg.append('defs');

      const zoomCanvas = state.zoomCanvas = svg.append('g');
      hilbertCanvas = state.hilbertCanvas = zoomCanvas.append('g')
        .attr('class', 'hilbert-canvas');

      hilbertCanvas.append('rect')
        .attr('class', 'zoom-trap')
        .attr('x', 0)
        .attr('y', 0)
        .attr('opacity', 0);

      hilbertCanvas.append('g').attr('class', 'ranges-canvas');
      hilbertCanvas.append('g').attr('class', 'markers-canvas');

      // Zoom binding
      zoomCanvas.call(state.zoom).on("dblclick.zoom", null);
      state.zoom.__baseElem = zoomCanvas; // Attach controlling elem for easy access

      defs.append('clipPath')
        .attr('id', 'canvas-cp')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0);

      zoomCanvas.attr('clip-path', 'url(#canvas-cp)');
    } else { // Canvas mode
      hilbertCanvas = state.hilbertCanvas = d3El
        .style('position', 'relative')
        .append('canvas')
          .attr('class', 'hilbert-canvas')
          .style('display', 'block')
          .style('position', 'absolute');

      // Zoom binding
      hilbertCanvas.call(state.zoom).on("dblclick.zoom", null);
      state.zoom.__baseElem = hilbertCanvas; // Attach controlling elem for easy access
    }

    // Range Tooltip
    let rangeTooltip = d3Select('#range-tooltip');

    if (rangeTooltip.empty()) {
      rangeTooltip = d3Select('body').append('div')
        .attr('id', 'range-tooltip')
    }

    rangeTooltip.classed('hilbert-tooltip', true);
    state.rangeTooltip = rangeTooltip;

    // Value Tooltip
    let valTooltip = d3Select('#val-tooltip');

    if (valTooltip.empty()) {
      valTooltip = d3Select('body').append('div')
        .attr('id', 'val-tooltip')
    }

    valTooltip.classed('hilbert-tooltip', true);

    hilbertCanvas.on('mouseover', () => state.showValTooltip && valTooltip.style('display', 'inline'));
    hilbertCanvas.on('mouseout', () => {
      valTooltip.style('display', 'none');
      rangeTooltip.style('display', 'none');

      if (state.useCanvas && state.hoverD) {
        state.hoverD = null;
        state.onRangeHover && state.onRangeHover(null);
      }
    });
    hilbertCanvas.on('click', () => state.useCanvas && state.onRangeClick && state.hoverD && state.onRangeClick(state.hoverD));
    hilbertCanvas.on('mousemove', function(ev) {
      const coords = d3Pointer(ev);

      // Hover detection based on shadow canvas
      if (state.useCanvas && (state.onRangeHover || state.showRangeTooltip)) {
        const pxScale = window.devicePixelRatio;
        const hoverD = state.colorTracker.lookup(state.shadowCtx.getImageData(...coords.map(c => c * pxScale), 1, 1).data);

        if (hoverD !== state.hoverD) {
          state.hoverD = hoverD;

          state.rangeTooltip.style('display', 'none');
          if (hoverD && state.showRangeTooltip) {
            const d = hoverD;
            const tooltipContent = state.rangeTooltipContent
              ? accessorFn(state.rangeTooltipContent)(d)
              // default tooltip
              : `<b>${accessorFn(state.rangeLabel)(d)}</b>: ${state.valFormatter(d.start) + (d.length > 1 ? ' - ' + state.valFormatter(d.start + d.length - 1) : '')}`

            state.rangeTooltip.html(tooltipContent || '');
            tooltipContent && state.rangeTooltip.style('display', 'inline');
          }

          hilbertCanvas.style('cursor', hoverD && state.onRangeClick ? 'pointer' : null);
          state.onRangeHover && state.onRangeHover(hoverD || null);
        }
      }

      if (state.showValTooltip) {
        const c = coords.slice();
        if (state.useCanvas) {
          // Need to consider zoom on canvas
          const zoomTransform = d3ZoomTransform(state.zoom.__baseElem.node());
          c[0] -= zoomTransform.x;
          c[0] /= zoomTransform.k;
          c[1] -= zoomTransform.y;
          c[1] /= zoomTransform.k;
        }
        valTooltip.text(state.valFormatter(state.hilbert.getValAtXY(...c)))
          .style('left', `${ev.pageX}px`)
          .style('top', `${ev.pageY}px`);
      }
      if (state.showRangeTooltip) {
        rangeTooltip
          .style('left', `${ev.pageX}px`)
          .style('top', `${ev.pageY}px`);
      }
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
    const labelColorAccessor = accessorFn(state.rangeLabelColor);
    const colorAccessor = state.rangeColor ? accessorFn(state.rangeColor) : (d => state.defaultColorScale(labelAcessor(d)));
    const _paddingAccessorFn = accessorFn(state.rangePadding);
    const paddingAccessor = d => Math.max(0, Math.min(1, _paddingAccessorFn(d))); // limit to [0, 1] range

    state.hilbert
      .order(state.hilbertOrder)
      .canvasWidth(canvasWidth);

    // resizing
    state.svg
      .attr('width', canvasWidth + state.margin * 2)
      .attr('height', canvasWidth + state.margin * 2);

    state.zoom
      .scaleExtent([1, Math.pow(2, state.hilbertOrder)])
      .translateExtent([[0, 0], [canvasWidth, canvasWidth].map(w => w + (state.useCanvas ? 0 : state.margin * 2))]); // fix margin glitch on svg

    state.axises.attr('transform', `translate(${state.margin}, ${state.margin})`);
    state.axises.select('.axis-right').attr('transform', `translate(${canvasWidth},0)`);
    state.axises.select('.axis-bottom').attr('transform', `translate(0,${canvasWidth})`);

    this._refreshAxises();

    if (!state.skipRelayout) {
      // compute layout
      state.data.forEach(state.hilbert.layout);
    } else {
      state.skipRelayout = false;
    }

    state.useCanvas ? canvasUpdate() : svgUpdate();

    //

    function svgUpdate() {
      // chart resizing
      state.zoomCanvas.attr('transform', `translate(${state.margin}, ${state.margin})`);

      state.hilbertCanvas.select('.zoom-trap')
        .attr('width', canvasWidth)
        .attr('height', canvasWidth);

      state.defs.select('#canvas-cp rect')
        .attr('width', state.canvasWidth)
        .attr('height', state.canvasWidth);

      // D3 digest
      let rangePaths = state.svg.select('.ranges-canvas')
        .selectAll('.hilbert-segment')
        .data(state.data.slice());

      rangePaths.exit().remove();

      const newPaths = rangePaths.enter().append('g')
        .attr('class', 'hilbert-segment')
        .attr('fill', labelColorAccessor)
        .on('click', (ev, d) => state.onRangeClick && state.onRangeClick(d))
        .on('mouseover', (ev, d) => {
          state.rangeTooltip.style('display', 'none');

          if (state.showRangeTooltip) {
            const tooltipContent = state.rangeTooltipContent
              ? accessorFn(state.rangeTooltipContent)(d)
              // default tooltip
              : `<b>${accessorFn(state.rangeLabel)(d)}</b>: ${state.valFormatter(d.start) + (d.length > 1 ? ' - ' + state.valFormatter(d.start + d.length - 1) : '')}`

            state.rangeTooltip.html(tooltipContent || '');
            tooltipContent && state.rangeTooltip.style('display', 'inline');
          }

          state.onRangeHover && state.onRangeHover(d);
        })
        .on('mouseout', () => {
          state.rangeTooltip.style('display', 'none');
          state.onRangeHover && state.onRangeHover(null);
        });

      newPaths.append('path');

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
          .attr('startOffset', function (d) {
            if (!d.pathVertices.length) return '0';
            return ((1 - d3Select(this).attr('textLength') / d.pathVertices.length) / 2 * 100) + '%'
          });

      // Ensure propagation of data binding into sub-elements
      rangePaths.select('path');

      rangePaths = rangePaths.merge(newPaths);

      rangePaths.selectAll('path') //.transition()
        .attr('d', d => getHilbertPath(d.pathVertices))
        .style('stroke', colorAccessor)
        .style('stroke-width', d => 1 - paddingAccessor(d))
        .style('cursor', state.onRangeClick ? 'pointer' : null);

      rangePaths
        .attr('transform', d =>
          `scale(${d.cellWidth}) translate(${d.startCell[0] + .5},${d.startCell[1] + .5})`
      );

      rangePaths.selectAll('text')
        .attr('font-size', d => Math.min(...[
          0.25,                 // Max 25% of path height
          (d.pathVertices.length + 1 - paddingAccessor(d)) * 0.25, // Max 25% path length
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
            return Math.min(0.95 * (1 - paddingAccessor(d)), name.length * MAX_TEXT_EXPANSION);
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

    function canvasUpdate() {
      const pxScale = window.devicePixelRatio; // 2 on retina displays

      // canvas resize (and clear)
      state.hilbertCanvas
        .style('top', `${state.margin}px`)
        .style('left', `${state.margin}px`)
        .style('width', `${canvasWidth}px`)
        .style('height', `${canvasWidth}px`);

      [state.hilbertCanvas.node(), state.shadowCanvasEl].forEach(canvasEl => {
        // Memory size (scaled to avoid blurriness)
        canvasEl.width = state.canvasWidth * pxScale;
        canvasEl.height = state.canvasWidth * pxScale;
      });

      const zoomTransform = d3ZoomTransform(state.zoom.__baseElem.node());
      const viewWindow = { // in px
        x: -zoomTransform.x / zoomTransform.k,
        y: -zoomTransform.y / zoomTransform.k,
        len: canvasWidth / zoomTransform.k
      };

      const ctx = state.hilbertCanvas.node().getContext('2d');
      const shadowCtx = state.shadowCtx;

      [ctx, shadowCtx].forEach(ctx => {
        ctx.clearRect(0, 0, canvasWidth, canvasWidth);

        // Apply zoom transform (respecting pxScale)
        ctx.translate(zoomTransform.x * pxScale, zoomTransform.y * pxScale);
        ctx.scale(zoomTransform.k * pxScale, zoomTransform.k * pxScale);
      });

      let dataInView = state.data.filter(d => {
        if (d.pathVertices.length) return true; // Can't judge multi-cell

        const w = d.cellWidth;
        const [x, y] = d.startCell.map(c => c * w);
        // cell out of view, no need to draw
        return !(x > viewWindow.x + viewWindow.len || (x + w) < viewWindow.x || y > viewWindow.y + viewWindow.len || (y + w) < viewWindow.y);
      });

      if (state.zooming && dataInView.length > MAX_OBJECTS_TO_ANIMATE_ZOOM) {
        const getBitBoundary = n => {
          if (!n) return 0;
          let cnt = 0;
          while(!(n%1)) { n /= 2; cnt++; }
          return cnt;
        };

        // prefer larger objects on a bit boundary
        const keepIdxs = new Set(dataInView
          .map((d, idx) => ({
            idx,
            size: d.cellWidth,
            bitBoundary: getBitBoundary(d.start)
          }))
          .sort((a, b) => (b.size - a.size) || (b.bitBoundary - a.bitBoundary))
          .slice(0, MAX_OBJECTS_TO_ANIMATE_ZOOM)
          .map(({ idx }) => idx)
        );

        dataInView = dataInView.filter((_, idx) => keepIdxs.has(idx));
      }

      // indexed blocks for rgb lookup
      const n = dataInView.length;
      state.colorTracker = new ColorTracker(
        n < 250e3 ? 6 : n < 500e3 ? 5 : n < 1e6 ? 4 : n < 2e6 ? 3 : n < 4e6 ? 2 : n < 8e6 ? 1 : 0
      );

      const updateShadowCanvas = !state.zooming || n < MAX_OBJECTS_TO_ALWAYS_UPDATE_SHADOW_CANVAS;

      for (let i = 0; i < n ; i++) {
        const d = dataInView[i];

        const w = d.cellWidth;
        const scaledW = w * zoomTransform.k;
        const relPadding = paddingAccessor(d);

        if (d.pathVertices.length === 0) { // single cell -> draw a square
          const [x, y] = d.startCell.map(c => c * w);

          const rectPadding = relPadding * w / 2;
          const rectW = w * (1 - relPadding);

          ctx.fillStyle = colorAccessor(d);
          const ctxs = [ctx];
          if (updateShadowCanvas && scaledW >= 1) { // don't bother registering sub-pixel squares on shadow canvas, it kills performance
            shadowCtx.fillStyle = state.colorTracker.register(d);
            ctxs.push(shadowCtx);
          }
          ctxs.forEach(ctx => ctx.fillRect(x + rectPadding, y + rectPadding, rectW, rectW));

          if (scaledW > 12) { // Hide labels on small square cells
            const name = labelAcessor(d);
            const fontSize = Math.min(
              20,             // absolute
              scaledW * 0.25, // Max 25% of cell height
              scaledW * (1 - relPadding) / name.length * 1.5 // Fit text length
            ) / zoomTransform.k;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = labelColorAccessor(d);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, ...[x, y].map(c => c + w / 2));
          }
        } else { // draw path (with textpath labels)
          let [x, y] = d.startCell.map(c => c * w + w / 2);
          const path = [[x, y], ...d.pathVertices.map(vert => {
            switch(vert) {
              case 'U': y-=w; break;
              case 'D': y+=w; break;
              case 'L': x-=w; break;
              case 'R': x+=w; break;
            }
            return [x, y];
          })];

          ctx.strokeStyle = colorAccessor(d);
          const ctxs = [ctx];
          if (updateShadowCanvas) {
            shadowCtx.strokeStyle = state.colorTracker.register(d);
            ctxs.push(shadowCtx);
          }
          ctxs.forEach(ctx => {
            ctx.lineWidth = w * (1 - relPadding);
            ctx.lineCap = 'square';
            ctx.beginPath();
            ctx.moveTo(...path[0]);
            path.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
            ctx.stroke();
          });

          // extend path extremities to cell edges for textpath
          const pathStart = path[0].map((c, idx) => c - (path[1][idx] - c) / 2);
          const pathEnd = path[path.length - 1].map((c, idx) => c - (path[path.length - 2][idx] - c) / 2);
          path[0] = pathStart;
          path[path.length - 1] = pathEnd;

          const name = labelAcessor(d);
          const fontSize = Math.min(
            20,            // absolute
            scaledW * 0.4, // Max 40% of cell height
            scaledW * (path.length - relPadding) / name.length * 1.2 // Fit text length
          ) / zoomTransform.k;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = labelColorAccessor(d);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineWidth = 0.01; // no stroke outline
          ctx.textPath(name, [].concat(...path));
        }
      }
    }
  }
});
