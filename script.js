
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const w = 800;
const h = 550;
const margin = { top: 50, right: 50, bottom: 0, left: 50 }; // Adjusted margins

const tooltipFunct = (data) => {
    let name = data.Name;
    let national = data.Nationality;
    let year = data.Year;
    let time = data.Time;
    let doping = data.Doping;
    let result = `${name}, ${national} <br> Year: ${year}, Time: ${time} <br> ${doping}`;
    return result;
}

const didDope = data => data.Doping === "" ? false: true;

document.addEventListener('DOMContentLoaded', () => {
    d3.json(url)
        .then(d => {
            const dataset = d;
            const timeMax = d3.max(dataset, (d) => d.Time);
            const timeMin = d3.min(dataset, (d) => d.Time);
            const yearMax = d3.max(dataset, (d) => d.Year) + 2;
            const yearMin = d3.min(dataset, (d) => d.Year);

            const svg = d3.select("#chart")
                .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom)
                .style("margin", `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`)
                .style("overflow", "visible");

            // Define the inner shadow filter
            const defs = svg.append("defs");
            const filter = defs.append("filter")
                .attr("id", "inner-shadow");


                filter.append("feComponentTransfer")
                .append("feFuncA")
                .attr("type", "table")
                .attr("tableValues", "0 3");

            filter.append("feGaussianBlur")
                .attr("stdDeviation", 3)
                .attr("result", "blur");

            filter.append("feOffset")
                .attr("dx", 1)
                .attr("dy", 1);

            filter.append("feComposite")
                .attr("operator", "out")
                .attr("in", "SourceGraphic")
                .attr("in2", "blur")
                .attr("result", "inverse");

            filter.append("feFlood")
                .attr("flood-color", "grey")
                .attr("result", "color");

            filter.append("feComposite")
                .attr("operator", "in")
                .attr("in", "color")
                .attr("in2", "inverse")
                .attr("result", "shadow");

            filter.append("feComposite")
                .attr("operator", "over")
                .attr("in", "shadow")
                .attr("in2", "SourceGraphic");

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -200)
                .attr('y', 80)
                .text('Time in Minutes')
                .style("fill", "#333")
                .attr("filter", "url(#inner-shadow)");
            
            svg.append('text')
                .attr("id", "title")
                .attr('x', w / 1.2)
                .attr('y', h - margin.bottom + 40)
                .text('Code by AG')
                .style("fill", "#333")
                .attr("filter", "url(#inner-shadow)");
                
                svg.append('text')
                .attr("class", "title")
                .attr('x', w/2 + margin.left)
                .attr('y', 40)
                .text('Doping in Professional Bicycle Racing')
                .attr("text-anchor", "middle")
                .style("font-size", "2em")
                .style("font-weight", "bold")
                .style("fill", "white")
                .style("stroke", "silver")
                .style("stroke-width", "0.5px")
                .style("stroke-opacity", "0.2")
                .attr("filter", "url(#inner-shadow)");
                
                svg.append('text')
                .attr("id", "legend")
                .attr('x', w/2 + margin.left)
                .attr('y', 40 + 32)
                .text("35 Fastest times up Alpe d'Huez")
                .attr("text-anchor", "middle")
                .style("font-size", "1.5em")
                .style("fill", "white")
                .style("stroke", "silver")
                .style("stroke-width", "0.5px")
                .style("stroke-opacity", "0.2")
                .attr("filter", "url(#inner-shadow)");
                
                const tooltip = d3.select("#chart")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "rgba(0, 0, 0, 0.7)")
                .style("color", "white")
                .style("padding", "10px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");

            const xScale = d3.scaleTime()
                .domain([d3.timeParse("%Y")(yearMin), d3.timeParse("%Y")(yearMax)])
                .range([0, w]);

            const yScale = d3.scaleTime()
                .domain([d3.timeParse("%M:%S")(timeMax), d3.timeParse("%M:%S")(timeMin)])
                .range([h - margin.bottom, 0]);

            const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat("%Y"));
            const yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat("%M:%S"));

            svg.append("g")
                .call(xAxis)
                .attr("id", "x-axis")
                .attr("transform", `translate(${margin.left}, ${h - margin.bottom})`);

            svg.append("g")
                .call(yAxis)
                .attr("id", "y-axis")
                .attr("transform", `translate(${margin.left}, 0)`);

            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d3.timeParse("%Y")(d.Year)) + margin.left)
                .attr("cy", d => yScale(d3.timeParse("%M:%S")(d.Time)) + margin.bottom)
                .attr("r", 10)
                .attr("fill", d => didDope(d) ? "rgba(255, 162, 0, 0.5)" : "rgba(0, 119, 255, 0.5)")
                .attr("class", "dot")
                .attr("data-xvalue", d => d.Year)
                .attr("data-yvalue", d => d3.timeParse("%M:%S")(d.Time))
                .on("mouseover", (event, d) => {
                    tooltip.attr("data-year", d.Year);
                    tooltip.transition()
                        .duration(0)
                        .style("opacity", 0.9);
                        
                    tooltip.html(tooltipFunct(d))
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 200) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        })
        .catch(err => console.log(err));
});