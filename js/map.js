function map(){

    // Temp
    year = "2014";

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

    var mapDiv = $("#map");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = mapDiv.width() - margin.right - margin.left,
        height = mapDiv.height() - margin.top - margin.bottom;

    //initialize color scale
    color = new Map();
    color.set("Moderaterna", "#52BDEC");
    color.set("Centerpartiet", "#016A3A");
    color.set("Folkpartiet", "#0094D7");
    color.set("Kristdemokraterna", "#231977");
    color.set("Miljöpartiet", "#53A045");
    color.set("Socialdemokraterna", "#ED1B34");
    color.set("Vänsterpartiet", "#DA291C");
    color.set("Sverigedemokraterna", "#DDDD00");
    color.set("övriga partier", "gray");

    //initialize tooltip
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    var projection = d3.geo.mercator()
        .center([50, 60 ])
        .scale(600);

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var path = d3.geo.path()
        .projection(projection);

    g = svg.append("g");

    // load data and draw the map
    d3.json("data/sweden_mun.topojson", function(error, sweden) {

        var mun = topojson.feature(sweden, sweden.objects.swe_mun).features;
        
        //load summary data
        d3.csv("data/Swedish_Election.csv", function(error, data) {  
            data.forEach(function(d) {
                parseData(d, year);
            });
            draw(mun, data);  
        });
    });

    function draw(mun, electionData)
    {
        var mun = g.selectAll(".swe_mun").data(mun);
        var colorOfParty = partyColor(electionData, "2014");

        mun.enter().insert("path")
            .attr("class", "mun")
            .attr("d", path)
            .attr("title", function(d) { return d.properties.name; })
            .style("fill", function(d, i) {
                var index = 0;
                for(var l = 0; l < colorOfParty.length; ++l) {
                    // Compare region-name
                    if(d.properties.name == colorOfParty[l].reg) {
                        index = l;
                        break;
                    }

                };
                return color.get(colorOfParty[index].par);
            })
            .attr("stroke-width", 0.1)
            .attr("stroke", "black")
            
/*          // Fungerar inte, css krånglar
            //tooltip
            .on("mousemove", function(d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", 0); 
            }) 
*/          
            .on("click", function(d) {
                map.selectMun(d.properties.name);
            })
            
            .on('mouseover', function(d) {
                d3.select(this)
                    .style('fill-opacity', .5);
            })
            .on('mouseout', function(d) {
                d3.selectAll('path')
                    .style( 'fill-opacity', 1 );
            });
    }

    function partyColor(electionData, year) {
        
        var nested_data = d3.nest()
            .key(function(d) { return d.region; })
            .sortValues(function(a, b) { return b[year] - a[year]; })
            .entries(electionData);

        var colorOfParty = [];

        nested_data.forEach(function(d, i) {
            colorOfParty.push({reg: d.values[0].region, par: d.values[0].parti });
        });
        return colorOfParty;
    }

    // Removes region code from region name
    // Parse year to float
    function parseData(data, year) {

        data.region = data.region.slice(5);
        data[year] = +data[year];
    }


    //zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;
        

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

    }

    // Sends the name of the mun to other .js-files
    this.selectMun = function (mun) {

        //console.log(mun);

    }
}