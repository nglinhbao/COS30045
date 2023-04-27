function init() {
        // set the dimensions and margins of the graph
    const width = 800,
    height = 800,
    margin = 40;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(width, height) / 2.5 - margin

    // append the svg object to the div called 'my_dataviz'
    const svg = d3.select("#my_dataviz")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", `translate(${width/2},${height/2})`);

    // Create dummy data
    const data = {a: 9, b: 20, c:30}
    const data2 = {a1: 5, a2:4, b1: 10, b2: 8, b3:2, c1:4, c2:26}

    // set the color scale
    const color = d3.scaleOrdinal()
                    .domain(["a", "b", "c", "d", "e", "f", "g", "h"])
                    .range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    const pie = d3.pie()
                .sort(null) // Do not sort group by size
                .value(d => d[1])

    const data_ready = pie(Object.entries(data))
    const data_ready2 = pie(Object.entries(data2))

    // The arc generator
    const arc = d3.arc()
                .innerRadius(radius * 0.3)         // This is the size of the donut hole
                .outerRadius(radius * 0.6)

    const arc2 = d3.arc()
                .innerRadius(radius * 0.6)         // This is the size of the donut hole
                .outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    const outerArc2 = d3.arc()
                    .innerRadius(radius * 0.5)
                    .outerRadius(radius * 1)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    let selectArea = "";
    let mouseOverExtend = false;
    let tempThis = "";
    
    svg
        .selectAll('allSlices')
        .data(data_ready)
        .join('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[1]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            svg.select('.middle-text')
                .text(d.data[0]);
            selectArea = d.data[0];
            d3.select(this)
                .transition()
                .delay(50)
                .attr("stroke", "black")
                .attr("stroke-width", "5px");
            svg.selectAll(".extended-slice")
                .data(data_ready2)
                .join("path")
                .attr("class", "extended-slice")
                .attr('d', arc2)
                .attr('fill', d => color(d.data[1]))
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .style("opacity", d => {
                        if (d.data[0][0] === selectArea) {
                            return 0.7;
                        } else {
                            return 0;
                        }
                })
            svg
                .selectAll('allLabels')
                .data(data_ready2)
                .join('text')
                .attr("class", "extended-label")
                .text(d => {
                    if (d.data[0][0] === selectArea) {
                        return d.data[1]
                    }
                })
                .attr('transform', function(d) {
                    if (d.data[0][0] === selectArea) {
                        const pos = arc2.centroid(d);
                        return `translate(${pos})`;
                    }
                })
                .style('text-anchor', 'middle')

            // Add the polylines between chart and labels:
            svg
            .selectAll('allPolylines')
            .data(data_ready2)
            .enter()
            .append('polyline')
            .attr("class", "extendPolylines")
            .attr("stroke", "black")
            .style("fill", "none")
            .style("stroke-width", "2px")
            .attr('points', function(d) {
                if (d.data[0][0] === selectArea) {
                    var posA = arc2.centroid(d) // line insertion in the slice
                    var posB = outerArc2.centroid(d) // line break: we use the other arc generator that has been built only for that
                    var posC = outerArc2.centroid(d); // Label position = almost the same as posB
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                    if (posC[0] > 0) {
                        posA[0] += 20
                        posB[0] += 20
                    }
                    else {
                        posA[0] -= 20
                        posB[0] -= 20
                    }
                    return [posA, posB, posC]
                }
            })

            // Add the polylines between chart and labels:
            svg
            .selectAll('allLabels')
            .data(data_ready2)
            .enter()
            .append('text')
            .attr("class", "extendLabels")
            .text((d) => {
                if (d.data[0][0] === selectArea) {
                    return d.data[0]
                }
            })
            .attr('transform', function(d) {
                if (d.data[0][0] === selectArea) {
                    var pos = outerArc2.centroid(d);
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                }
            })
            .style('text-anchor', function(d) {
                if (d.data[0][0] === selectArea) {
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    return (midangle < Math.PI ? 'start' : 'end')
                }
            })
        })
        .on("mouseout", function(event, d) {
            svg.select('.middle-text')
                .text("Vietnam");

            d3.select(this)
            .transition()
            .delay(50)
            .attr('stroke', "white")
            .style("stroke-width", "2px")
            svg.selectAll(".extended-slice").remove()
            svg.selectAll(".extended-label").remove()
            svg.selectAll(".extendPolylines").remove()
            svg.selectAll(".extendLabels").remove()
        })

    // // Add the polylines between chart and labels:
    svg
        .selectAll('allLabels')
        .data(data_ready)
        .join('text')
        .text(d => d.data[1])
        .attr('transform', function(d) {
            const pos = arc.centroid(d);
            return `translate(${pos})`;
        })
        .style('text-anchor', 'middle');

    svg
        .append("text")
        .attr("class", "middle-text")
        .text("Vietnam")
        .style('text-anchor', 'middle');
}

window.onload = init;