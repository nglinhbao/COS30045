function init() {
    let region = {}
    let subRegion = {}
    let subRegionExplain = {}
    let name = []

    //input process
    const takeInput = (input) => {
        d3.csv("./data/dataVietnam.csv", function(d) {
            if (d["Sub-region"] != "Total") {
                subRegion[d["Sub-region"]] = parseInt(d[input])
                subRegionExplain[d["Sub-region"]] = d["Region"]
                name.push(d["Sub-region"])
            }
            else {
                region[d["Region"]] = parseInt(d[input])
                name.push(d["Region"])
            }
        })
        .then(function() {
            // Code to execute after the CSV file has finished loading
            drawDonut(region, subRegion, subRegionExplain, name, input)
        })
        .catch(function(error) {
            // Code to execute if an error occurs while loading the CSV file
            console.log("Error loading CSV data:", error);
        });
    }

    //draw donut
    const drawDonut = (data, data2, data2explain, nameDomain, input) => {
        // set the dimensions and margins of the graph
        const width = 910,
        height = 700,
        margin = 0;

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        const radius = Math.min(width, height) / 2.5 - margin

        // append the svg object to the div called 'my_dataviz'
        const svg = d3.select("#my_dataviz")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", `translate(${width/2},${height/2})`);

        // set the color scale
        const color = d3.scaleOrdinal()
                        .domain(nameDomain)
                        .range(d3.schemeAccent);

        // Compute the position of each group on the pie:
        const pie = d3.pie()
                    .sort(null) // Do not sort group by size
                    .value(d => {
                        return d[1]
                    })

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
        
        //draw inner slices
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
                //change middle text
                svg.select('.middle-text')
                    .text(d.data[0]);
                selectArea = d.data[0];
                //add border
                d3.select(this)
                    .transition()
                    .delay(50)
                    .attr("stroke", "black")
                    .attr("stroke-width", "5px");
                //add extended slices when hovering
                svg.selectAll(".extended-slice")
                    .data(data_ready2)
                    .join("path")
                    .attr("class", "extended-slice")
                    .attr('d', arc2)
                    .attr('fill', d => {
                        return color(d.data[0])
                    })
                    .attr("stroke", "white")
                    .style("stroke-width", "2px")
                    .style("opacity", d => {
                        if (data2explain[d.data[0]] === selectArea) {
                            return 0.7;
                        } else {
                            return 0;
                        }
                    })
                //add label for extended slices
                svg
                    .selectAll('allLabels')
                    .data(data_ready2)
                    .join('text')
                    .attr("class", "extended-label")
                    .text(d => {
                        if (data2explain[d.data[0]] === selectArea) {
                            return d.data[1].toLocaleString("en-US")
                        }
                    })
                    .attr('transform', function(d) {
                        if (data2explain[d.data[0]] === selectArea) {
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
                        if (data2explain[d.data[0]] === selectArea) {
                            var posA = arc2.centroid(d) // line insertion in the slice
                            var posB = outerArc2.centroid(d) // line break: we use the other arc generator that has been built only for that
                            var posC = outerArc2.centroid(d); // Label position = almost the same as posB
                            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                            posC[0] = radius * 0.87 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                            if (posC[0] > 0) {
                                posA[0] += 30
                                posB[0] += 30
                            }
                            else {
                                posA[0] -= 30
                                posB[0] -= 30
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
                        if (data2explain[d.data[0]] === selectArea) {
                            return d.data[0]
                        }
                    })
                    .attr('transform', function(d) {
                        if (data2explain[d.data[0]] === selectArea) {
                            var pos = outerArc2.centroid(d);
                            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                            pos[0] = radius * 0.89 * (midangle < Math.PI ? 1 : -1);
                            return 'translate(' + pos + ')';
                        }
                    })
                    .style('text-anchor', function(d) {
                        if (data2explain[d.data[0]] === selectArea) {
                            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                            return (midangle < Math.PI ? 'start' : 'end')
                        }
                    })
        })
        .on("mouseout", function(event, d) {
            //return to default middle text
            svg.select('.middle-text')
            .text(input);

            //remove stroke and extended slices
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

        // Add the polylines between chart and labels:
        svg
            .selectAll('allLabels')
            .data(data_ready)
            .join('text')
            .text(d => d.data[1].toLocaleString("en-US"))
            .attr('transform', function(d) {
            const pos = arc.centroid(d);
                return `translate(${pos})`;
            })
            .style('text-anchor', 'middle');

        svg
            .append("text")
            .attr("class", "middle-text")
            .text(input)
            .style('text-anchor', 'middle');
    }

    takeInput('Immigrants')

    //immigrants
    const Ibutton = document.getElementById('Ibutton')
    Ibutton.addEventListener('click', () => {
        let svgTag = document.querySelector('svg');
        if (svgTag) {
            svgTag.remove()
        }
        takeInput('Immigrants')
    })

    //emigrants
    const Ebutton = document.getElementById('Ebutton')
    Ebutton.addEventListener('click', () => {
        let svgTag = document.querySelector('svg');
        if (svgTag) {
            svgTag.remove()
        }
        takeInput('Emigrants')
    })

    
}

window.onload = init;