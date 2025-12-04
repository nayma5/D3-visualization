// Load the CSV dataset
d3.csv("data/ai_job_dataset.csv").then(function(data) {

    console.log("Dataset Loaded:", data);

    // 1. CLEAN + PREPARE DATA
    data.forEach(function(d) {
        d.salary_usd = +d.salary_usd.replace(/[^0-9.-]+/g, "");
        d.experience = d.experience_level;
    });

    data = data.filter(d => !isNaN(d.salary_usd) && d.experience);

    const groupedData = Array.from(
        d3.group(data, d => d.experience),
        ([key, values]) => ({
            key: key,
            value: d3.mean(values, v => v.salary_usd)
        })
    );

    console.log("Grouped Data:", groupedData);

    // 2. SVG 

    const margin = { top: 45, right: 30, bottom: 55, left: 85 },
          width = 850 - margin.left - margin.right,
          height = 460 - margin.top - margin.bottom; 

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("display", "block")
        .style("margin", "0 auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 3. SCALES
    const x = d3.scaleBand()
        .domain(groupedData.map(d => d.key))
        .range([0, width])
        .padding(0.25);

    const y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.value)])
        .nice()
        .range([height, 0]); 

    const color = d3.scaleOrdinal()
        .domain(groupedData.map(d => d.key))
        .range(d3.schemeSet2);

    // 4. AXES
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // X LABEL
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("font-size", "15px")
        .text("Experience Level");

    // Y LABEL
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("font-size", "15px")
        .text("Average Salary (USD)");

    // 5. TOOLTIP
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // 6. DRAW BARS + ANIMATION
    svg.selectAll(".bar")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("width", x.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .style("fill", d => color(d.key))
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`
                <strong>${d.key}</strong><br>
                Avg Salary: $${Math.round(d.value).toLocaleString()}
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(300).style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .delay((d, i) => i * 140)
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value));

    // 7. LEGEND (CENTERED, ONE ROW)
    const legend = svg.append("g")
        .attr("transform", `translate(${width / 2 - 140}, -18)`);

    groupedData.forEach((d, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(${i * 85}, 0)`);

        row.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", color(d.key));

        row.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("font-size", "14px")
            .text(d.key);
    });
});
