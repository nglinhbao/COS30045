function init() {
    let totalShowed = false

    const yearRange = [1, 100, 500, 1000, 2000, 10000, 50000];
    const totalRange = [1, 10000, 20000, 50000, 100000, 300000, 500000, 1000000]
    const colorScale = d3.scaleThreshold()
            .domain(yearRange)
            .range(d3.schemeBlues[8]);
    const totalColorRange = d3.scaleThreshold()
            .domain(totalRange)
            .range(d3.schemeGreens[9]);

    const drawLengend = (dataset) => {
        const svg2 = d3.select("#legend")
                .append("svg")
                .attr("width", 500)
                .attr("height", 100);

        svg2.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", (d,i) => {
                return i*60
            })
            .attr("y", (d,i) => {
                return 30
            })
            .attr("width",100)
            .attr("height", 20)
            .attr("fill", (d) => {
                if (!totalShowed) {
                    return colorScale(d)
                }
                else {
                    return totalColorRange(d)
                }
            })

        svg2.selectAll("text.label")
            .data(dataset)
            .enter()
            .append("text")
            .text((d) => d)
            .attr("x", (d,i) => {
                return i*60
            })
            .attr("y", (d,i) => {
                return 30-5
            })
            .attr("fill", 'black');
    }

    const drawMap = (year) => {
        // The svg
        const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

        // Map and projection
        const path = d3.geoPath();
        const projection = d3.geoMercator()
            .center([0, 30])
            .scale(140)
            .translate([width / 2, height / 2]);

        // Data and color scale
        let data = new Map();
        
        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        const mouseleave = function(event,d) {
            d3.select(this)
                .style("stroke", "none")
            // tooltip.style("opacity", 0)
        }

        // Load external data and boot
        Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("./data/emigration.csv", function(d) {
            data.set(d.code, +d[year])
        })
        ]).then(function(loadData){
            const topo = loadData[0]
            // Draw the map
            const mapGroup = svg.append("g")
            mapGroup.selectAll("path")
                .data(topo.features)
                .join("path")
                // draw each country
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                // set the color of each country
                .attr("fill", function (d) {
                    if  (d.id == "VNM") { return "red" }
                    d.total = data.get(d.id) || 0;
                    if (!totalShowed) {
                        return colorScale(d.total)
                    }
                    else {
                        return totalColorRange(d.total)
                    }
                })
                // add hover effect
                .on("mouseover", function(event, d) {
                    const country = d3.select(this).datum();
                    d3.select(this)
                        .style("stroke", "#333")
                        .style("stroke-width", 1)
                    tooltip.style("opacity", 1)
                        .html(`<h3>${country.properties.name}:</h3>${country.total === 0 ? 'N/A' : country.total}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 30) + "px");
                       
                })
                .on("mouseleave", mouseleave)
                .on("mouseout", function(d) {       
                    d3.select("#tooltip")       
                       .style("opacity", 0);   
                });

                const tooltip = d3.select(".center")
                                .append("div")
                                .attr("id", "tooltip")
                                .style("opacity", 0)
                                .style("stroke", "none");
                            
                                
        }
    )}

    

    drawMap(2000)
    drawLengend(yearRange)
    totalShowed = true;
    drawLengend(totalRange)
    totalShowed = false;

    const yearSlider = document.getElementById('yearSlider')
    const yearLabel = document.getElementById('yearLabel')

    yearSlider.addEventListener('input', () => {
        totalShowed = false;
        const selectedYear = parseInt(yearSlider.value);
        yearLabel.textContent = selectedYear;
        let element = document.getElementById("tooltip");
        element.remove();
        drawMap(selectedYear)
    })

    const totalButton = document.getElementById('totalButton')
    totalButton.addEventListener('click', () => {
        yearLabel.textContent = 'Total';

        let element = document.getElementById("tooltip");
        element.remove();
        
        totalShowed = true
        drawMap('Total')
    })
}

window.onload = init; 

//https://gist.github.com/jgujgu/bfbb41f5e8b90ff09d7805f71ef2538e
//https://github.com/connorrothschild/D3.js/tree/master/map-overdoses