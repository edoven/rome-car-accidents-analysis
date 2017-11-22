// var regions = {
//         "SAS": "South Asia",
//         "ECS": "Europe and Central Asia",
//         "MEA": "Middle East & North Africa",
//         "SSF": "Sub-Saharan Africa",
//         "LCN": "Latin America & Caribbean",
//         "EAS": "East Asia &amp; Pacific",
//         "NAC": "North America"
//     },

// helper function
parseDate = d3.timeParse("%Y-%m-%d")
// function getDate(d) {
//     return dateParser(d);
// }


var w = 925,
    h = 550,
    margin = 30,
    axies_ticks_length = 7, //this is in pixels
    //startDate = parseDate('2014-01-01'),
    //endDate = parseDate('2014-05-01'),
    startAge = 20,
    endAge = 80,
    dates = ['Jan 2014','Feb 2014','Mar 2014','Apr 2014','May 2014']
    y = d3.scaleLinear().domain([endAge, startAge]).range([0 + margin, h - margin]),
    //x = d3.scaleTime().domain([startDate, endDate]).range([0 + margin - 5, w]);
    x = d3.scaleLinear().domain([0,dates.length]).range([0 + margin - 5, w]);
    //years = d3.range(startYear, endYear+1);
    

    // myDateScale = d3.scaleTime()
    //                      .range([startDate, 
    //                              endDate
    //                              ])
    //                      .domain([1,10]);


var vis = d3.select("#vis")
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg:g")
var line = d3.line()
             .x(function(d, i) { return x(d.x); })
             .y(function(d) { return y(d.y); });
var countries_regions = {},
    startEnd = {},
    countryCodes = {};



// d3.text('data/country-regions.csv', 
//         function(error, data) {
//             if (error) throw error;
//             var regions = d3.csvParseRows(data);
//             for (i = 1; i < regions.length; i++) {
//                 countryCode = regions[i][0]
//                 regionCode = regions[i][1]
//                 countries_regions[countryCode] = regionCode;
//             }
//             }
//         );



d3.text('data/life-expectancy-cleaned-all.csv', function(error, data) {
    if (error) throw error;
    var countries = d3.csvParseRows(data);
    for (i = 1; i < countries.length; i++) {
        var values = countries[i].slice(2, countries[i.length - 1]);
        var currData = [];
        //CountryName CountryCode
        countryCode = countries[i][1]
        cointryName = countries[i][0]
        countryCodes[countryCode] = cointryName;
        var started = false;
        for (j = 0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({
                    //x: dates[j],
                    x: j,
                    y: values[j]
                });
                if (!started) {
                    startEnd[countries[i][1]] = {
                        //'startYear': dates[j],
                        'startYear': j,
                        'startVal': values[j]
                    };
                    started = true;
                } else if (j == values.length - 1) {
                    //startEnd[countries[i][1]]['endYear'] = dates[j];
                    startEnd[countries[i][1]]['endYear'] = j;
                    startEnd[countries[i][1]]['endVal'] = values[j];
                }
            }
        }

        vis.append("svg:path")
           .data([currData])
           .attr("country", countryCode)
           .attr("class", countries_regions[countryCode])
           .attr("d", line)
           .on("mouseover", onmouseover)
           .on("mouseout", onmouseout);
    }
});


/********************** 
Y AND X AXIES AND TICKS
**********************/

// X axies
vis.append("svg:line")
   .attr("x1", x(0))
   .attr("y1", y(startAge))
   .attr("x2", x(dates.length))
   .attr("y2", y(startAge))
   .attr("class", "axis")


// Y axies
vis.append("svg:line")
   .attr("x1", x(0))
   .attr("y1", y(startAge))
   .attr("x2", x(0))
   .attr("y2", y(endAge))
   .attr("class", "axis")


// X ticks
vis.selectAll(".xLabel")
   .data(x.ticks(5))
   .enter()
   .append("svg:text")
   .attr("class", "xLabel")
   //.text(String)
   .text(function(d) { return dates[d]; })
   .attr("x", function(d) { return x(d); })
   .attr("y", h - 10)
   .attr("text-anchor", "middle")

vis.selectAll(".xTicks")
   .data(x.ticks(5))
   .enter()
   .append("svg:line")
   .attr("class", "xTicks")
   .attr("x1", function(d) { return x(d); })
   .attr("y1", y(startAge))
   .attr("x2", function(d) { return x(d); })
   .attr("y2", y(startAge) + axies_ticks_length)



// Y ticks
vis.selectAll(".yLabel")
   .data(y.ticks(4))
   .enter()
   .append("svg:text")
   .attr("class", "yLabel")
   .text(String)
   .attr("x", 0)
   .attr("y", function(d) { return y(d) })
   .attr("text-anchor", "right")
   .attr("dy", 3)

vis.selectAll(".yTicks")
   .data(y.ticks(4))
   .enter()
   .append("svg:line")
   .attr("class", "yTicks")
   .attr("y1", function(d) { return y(d); })
   .attr("x1", 25-axies_ticks_length)
   .attr("y2", function(d) { return y(d); })
   .attr("x2", 25)


/************** 
MOUSE FUNCTIONS
***************/

function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length - 9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

function onmouseover(d, i) {
    var currClass = d3.select(this).attr("class");
    d3.select(this).attr("class", currClass + " current");
    var countryCode = $(this).attr("country");
    var countryVals = startEnd[countryCode];
    var percentChange = 100 * (countryVals['endVal'] - countryVals['startVal']) / countryVals['startVal'];
    var blurb = '<h2>' + countryCodes[countryCode] + '</h2>';
    blurb += "<p>" + Math.round(countryVals['startVal']) + " accidents in " + dates[countryVals['startYear']] + " and " + Math.round(countryVals['endVal']) + " accidents in " + dates[countryVals['endYear']] + ", ";
    if (percentChange >= 0) {
        blurb += "an increase of " + Math.round(percentChange) + " percent."
    } else {
        blurb += "a decrease of " + -1 * Math.round(percentChange) + " percent."
    }
    blurb += "</p>";
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}

function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length - 8);
    d3.select(this).attr("class", prevClass);
    $("#default-blurb").show();
    $("#blurb-content").html('');
}

// function showRegion(regionCode) {
//     var countries = d3.selectAll("path." + regionCode);
//     if (countries.classed('highlight')) {
//         countries.attr("class", regionCode);
//     } else {
//         countries.classed('highlight', true);
//     }
// }