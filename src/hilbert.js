import './hilbert.css';

import * as d3 from 'd3';
import { hilbert as d3Hilbert } from 'd3-hilbert';
import d3Tip from 'd3-tip';

export default function() {

    var svg,
        order,
        hilbert,

        margin = 90,
        canvasWidth = Math.min(window.innerWidth, window.innerHeight - 30) - margin * 2,
        segmentColorScale = d3.scaleOrdinal(d3.schemeCategory20),
        valFormatter = function(val) {
            return val;
        },
        rangeFormatter = function(d) {
            return valFormatter(d.start) + ' - ' + valFormatter(d.start + d.length);
        },
        rangeTooltip;

    function chart(nodeElem, ranges, hilbertOrder) {

        order = hilbertOrder;
        hilbert = d3Hilbert()
            .order(order)
            .canvasWidth(canvasWidth)
            .simplifyCurves(true);

        svg = d3.select(nodeElem)
            .attr('class', 'hilbert-chart')
            .append('svg');

        init();
        d3Digest(ranges);

        return chart;
    }

    function init() {
        svg
            .attr("width", canvasWidth + margin * 2)
            .attr("height", canvasWidth + margin * 2);

        svg.append('defs');

        var hilbertCanvas = svg.append('g')
            .attr('class', 'hilbert-canvas')
            .attr('transform', 'translate(' + margin + ',' + margin + ')');

        hilbertCanvas.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', canvasWidth)
            .attr('height', canvasWidth)
            .attr('fill', 'white');

        hilbertCanvas.append('g').attr('class', 'ranges-canvas');
        hilbertCanvas.append('g').attr('class', 'markers-canvas');

        // Range Tooltip
        rangeTooltip = d3Tip()
            .attr('class', 'hilbert-tooltip')
            .offset([-15, 0])
            .html(function(d) {
                return '<b>' + d.name + '</b>: ' + rangeFormatter(d);
            });
        svg.call(rangeTooltip);

        // Value Tooltip
        var valTooltip = d3.select('#val-tooltip');

        if (valTooltip.empty()) {
            valTooltip = d3.select('body').append('div')
                .attr('id', 'val-tooltip')
        }

        valTooltip.classed('hilbert-tooltip', true);

        hilbertCanvas.on('mouseover', function() { valTooltip.style("display", "inline"); });
        hilbertCanvas.on('mouseout', function() { valTooltip.style("display", "none"); });
        hilbertCanvas.on('mousemove', function () {
            var coords = d3.mouse(this);
            valTooltip.text(valFormatter(hilbert.getValAtXY(coords[0], coords[1])))
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY + 'px');
        });

        // Setup axises
        var axises = svg.append('g')
            .attr('class', 'hilbert-axises')
            .attr("transform", "translate(" + margin + "," + margin + ")"),
            nTicks = Math.pow(2, 3),
            nCells = Math.pow(2, order),
            axisScale = d3.scaleLinear()
                .domain([0, nTicks])
                .range([0, canvasWidth]),
            getTickFormatter = function(xPreset, yPreset) {
                return function(d) {
                    d *= canvasWidth / nTicks;
                    return valFormatter(hilbert.getValAtXY(xPreset != null ? xPreset : d, yPreset != null ? yPreset : d));
                }
            };
        axises.append("g")
            .call(d3.axisLeft(axisScale).tickValues(d3.range(nTicks)).tickFormat(getTickFormatter(0)));
        axises.append("g")
            .call(d3.axisRight(axisScale).tickValues(d3.range(nTicks)).tickFormat(getTickFormatter(canvasWidth - canvasWidth / nCells)))
            .attr("transform", "translate(" + canvasWidth + ",0)");
        axises.append("g")
            .call(d3.axisTop(axisScale).tickValues(d3.range(nTicks)).tickFormat(getTickFormatter(null, 0)))
            .selectAll("text")
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start");
        axises.append("g")
            .call(d3.axisBottom(axisScale).tickValues(d3.range(nTicks)).tickFormat(getTickFormatter(null, canvasWidth - canvasWidth / nCells)))
            .attr("transform", "translate(0," + canvasWidth + ")")
            .selectAll("text")
            .attr("x", -9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
    }

    function d3Digest(ranges) {

        var names = ranges.map(function(range) { return range.name; });
        names = names.filter(function(name, idx) {
            return names.indexOf(name) == idx;
        });
        segmentColorScale.domain(names);

        ranges.forEach(hilbert.layout);

        var rangePaths = svg.select('.ranges-canvas')
            .selectAll('.hilbert-segment')
            .data(ranges.slice(0));

        rangePaths.exit().remove();

        var newPaths = rangePaths.enter().append('g')
            .attr('class', 'hilbert-segment')
            .on('mouseover', rangeTooltip.show)
            .on('mouseout', rangeTooltip.hide);

        newPaths.append('path');
        newPaths.append('text')
            .attr('dominant-baseline', 'middle')
            .append('textPath')
                // Label that follows the path contour
                .attr('xlink:href', function(d) {
                    var id = 'textPath-' + Math.round(Math.random() * 1e10);
                    svg.select('defs').append('path')
                        .attr('id', id)
                        .attr('d', getHilbertPath(d.pathVertices));

                    return '#' + id;
                })
                .text(function(d) {
                    var MAX_TEXT_COMPRESSION = 16;
                    var name = d.name;

                    /*
                    var MIN_FILL_RATIO = 4;
                    while(name.length / d.pathVertices.length < MIN_FILL_RATIO) {
                        name += '. . ';
                        name += name;
                    }
                    */
                    return (!d.pathVertices.length || d.name.length / d.pathVertices.length > MAX_TEXT_COMPRESSION) ? '' : name /*d.name*/ ;
                })
                .attr('textLength', function(d) {
                    //return d.pathVertices.length;
                    var MAX_TEXT_EXPANSION = 0.4;
                    return Math.min(d.pathVertices.length, d.name.length * MAX_TEXT_EXPANSION);
                })
                .attr('startOffset', function(d) {
                    if (!d.pathVertices.length) return '0';
                    return ((1 - d3.select(this).attr('textLength') / d.pathVertices.length) / 2 * 100) + '%'
                });

        // Ensure propagation of data binding into sub-elements
        rangePaths.select('path');

        rangePaths = rangePaths.merge(newPaths);

        rangePaths.selectAll('path') //.transition()
            .attr('d', function(d) { return getHilbertPath(d.pathVertices); })
            .style('stroke', function(d) { return segmentColorScale(d.name); });

        rangePaths
            .attr('transform', function(d) {
                return 'scale('+ d.cellWidth + ') '
                    + 'translate(' + (d.startCell[0] +.5) + ',' + (d.startCell[1] +.5) + ')';
            });

        rangePaths.selectAll('text')
            .attr('font-size', function(d) { return 1.4 / Math.sqrt(d.cellWidth); })
            /*.text(function(d) {
             return d.name;
             })*/
            /*.attr('x', function() {
             //var bbox = this.parentNode.getBBox();
             var bbox = d3.select(this.parentNode).select('path').node().getBBox();
             console.log(d3.select(this.parentNode).select('path').node().getBBox(), this.parentNode.getBBox(), this.parentNode.getBoundingClientRect());
             return bbox.x + bbox.width / 2;
             })
             .attr('y', function() {
             //var bbox = this.parentNode.getBBox();
             var bbox = d3.select(this.parentNode).select('path').node().getBBox();

             return bbox.y + bbox.height / 2;
             })
             .attr('transform', function() {
             var pathBbox = d3.select(this.parentNode).select('path').node().getBoundingClientRect(),
             textBbox = this.getBoundingClientRect();

             return 'scale(' + Math.min(pathBbox.width/textBbox.width, pathBbox.height/textBbox.height) + ')';
             })*/
            // Those with no path (plain square)
            .filter(function(d) {
                return !d.pathVertices.length;
            })
            .text(function(d) {
                var MAX_TEXT_COMPRESSION = 0.25;
                return (d.name.length / d.cellWidth > MAX_TEXT_COMPRESSION) ? '' : d.name;
            })
            .attr('textLength', function(d) {
                var MAX_TEXT_EXPANSION = 0.15;
                return Math.min(0.95, d.name.length * MAX_TEXT_EXPANSION);
            })
            .attr('text-anchor', 'middle');
    }

    function getHilbertPath(vertices) {
        var path = 'M0 0L0 0';

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

    function addMarker(pos, markerUrl, width, height, tooltipFormatter) {
        tooltipFormatter = tooltipFormatter || function(d) {
            return valFormatter(d.start);
        };

        var range = {
            start: pos,
            length: 1
        };
        hilbert.layout(range);

        var marker = svg.select('.markers-canvas').append("svg:image")
            .attr("xlink:href", markerUrl)
            .attr("width", width)
            .attr("height", height)
            .attr("x", range.startCell[0] * range.cellWidth - width/2)
            .attr("y", range.startCell[1] * range.cellWidth - height/2);

        // Tooltip
        var markerTooltip = d3Tip()
            .attr('class', 'hilbert-tooltip')
            .offset([-15, 0])
            .html(tooltipFormatter);
        svg.call(markerTooltip);

        marker.on('mouseover', markerTooltip.show);
        marker.on('mouseout', markerTooltip.hide);

        return chart;
    }

    // Getter/setter methods

    chart.width = function(_) {
        if (!arguments.length) { return canvasWidth; }
        canvasWidth = _;
        return chart;
    };

    chart.margin = function(_) {
        if (!arguments.length) { return margin; }
        margin = _;
        return chart;
    };

    chart.valFormatter = function(_) {
        if (!arguments.length) { return valFormatter; }
        valFormatter = _;
        return chart;
    };

    chart.rangeFormatter = function(_) {
        if (!arguments.length) { return rangeFormatter; }
        rangeFormatter = _;
        return chart;
    };

    chart.addMarker = addMarker;

    return chart;
};