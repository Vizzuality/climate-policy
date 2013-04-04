var margin = 30;
var top_margin = 150;
var h = 388;
var w = 1038;
var subject = [];
var svg = [];

var LINE_DOT_R = 4;


function mousemove() {
  d3.selectAll(".overlay-line")
    .attr("cx", d3.mouse(this)[0])
    .attr("transform", "translate(" + d3.mouse(this)[0] + ",0)")
    .attr("cy", 0);
}


$(document).ready(function() {
  var _domainq = 'http://cpi.cartodb.com/api/v2/sql?q=SELECT%20min(min)%20as%20min,%20max(max)%20as%20max%20FROM%20(';

  //Creates generic tooltip
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  //Creates the query needed for calculating the default domain for the charts
  for (var i = 0; i < datasets.sectors[0].subjects.length; i++) {
    if(i!=0){
      _domainq = _domainq + '%20UNION%20'
    }
    subject[i] = datasets.sectors[0].subjects[i];
    svg[i] = d3.select("#"+subject[i].table).append("svg").attr("width", w).attr("height", h);
    _domainq = _domainq + 'SELECT%20min(date_processed)%20as%20min,%20max(date_processed)%20as%20max%20FROM%20'+subject[i].table

    //Creates an overlay per subject
    var overlay = svg[i]
      .append("rect")
      .attr("class", "overlay")
      .attr("width", w)
      .attr("height", h)
      .on("mouseover", function(d){d3.selectAll(".overlay-line").style("visibility", "visible");})
      .on("mousemove", mousemove)
      .on("mouseout", function(){d3.selectAll(".overlay-line").style("visibility", "hidden");});

    var overlayLine = svg[i]
      .append("rect")
      .attr("class", "overlay-line")
      .attr("width", 2)
      .attr("height", $('.graphs').height()-$(".slider").height())
      .style("top", $(".graphs").offset().top);
  }

  d3.json(_domainq+')%20as%20aux%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79', function(data) {
    var std_domain = [new Date(data.rows[0].min),new Date(data.rows[0].max)];

    for (var i = 0; i < datasets.sectors[0].subjects.length; i++) {
      drawChart(i, std_domain);
    }
  })

  //Draws a lineChart
  //index:index of the table on the json, 
  //std_domain: specific domain - keep undefined for showing the chart's own domain
  function drawChart(index,domain) {

    d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[index].table+"%20order%20by%20"+subject[index].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data) {

      var _data = data;
      if(domain === undefined){
        _data['min_domain'] = d3.min(_data.rows, function(data){return data.date_processed;})
        _data['max_domain'] = d3.max(_data.rows, function(data){return data.date_processed;})
        _domain = [new Date(_data.min_domain),new Date(_data.max_domain)];
      }else{
        _domain = domain;
      }

      var x_col = subject[index].x_axis;
      var x_scale = d3.scale.linear()
        .range([margin,w-margin])
        .domain(_domain);

      var previous_stacked_column = null;
      var min_val = 0;

      for (var i = 0; i < subject[index].series.length; i++) {
        // append one group per series
        var g = svg[index].append("svg:g");
        var strokeColor = subject[index].series[i].strokeColor;
        var fillColor = subject[index].series[i].fillColor;
        var y_col = subject[index].series[i].column;
        var y_col_name = subject[index].series[i].name;

        var y_scale = d3.scale.linear()
          .range([h-margin, top_margin])
          .domain(subject[index].series[i].y_extent);

        // remove null values and find min_val if negative value
        var data_col = _data.rows.filter(function(d) {
          if(d[y_col] < min_val) {
            min_val = d[y_col];
          }

          return (d[y_col] != null) && (d[y_col] != 0)
        });

        if (subject[index].series[i].class == "line") {

          var line = d3.svg.line()
            .x(function(d){return x_scale(new Date(d[x_col]))})
            .y(function(d){return y_scale(d[y_col])});

          g.append("svg:path")
            .attr("d", line(data_col))
            .attr("class", 'lineStyle')
            .attr("style",'stroke:'+strokeColor);

          g.selectAll("circle")
            .data(data_col)
            .enter()
            .append("circle")
            .attr("class", 'linedot linedot'+i)
            //This shows only the first point during each year
            .attr("style",function(d){ var _fill = (new Date(d.date_processed).getMonth() + 1 == 1) ? 'fill:'+strokeColor : 'display: none'; return _fill;})
            .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
            .attr("cy", function(d){return y_scale(d[y_col])})
            .attr("r", LINE_DOT_R)
            .attr("name", function(d){return d[y_col]}) //Uses this for tooltip
            .on("mouseover", function(d) {
              d3.selectAll(".overlay-line").style("visibility", "visible");

              tooltip.style("visibility", "visible")
                .text($(this).attr('name'))
                .style("top", $(this).offset().top+30+"px")
                .style("left", $(this).offset().left-25+"px");
            })
            .on("mousemove", mousemove)
            .on("mouseout", function(){
              d3.selectAll(".overlay-line").style("visibility", "hidden");

              tooltip.style("visibility", "hidden");
            });

        } else if (subject[index].series[i].class == "area") {

          var area = d3.svg.area()            
            .x(function(d) {return x_scale(new Date(d[x_col]))})
            .y0(function(d) {                             
              if (previous_stacked_column == null) return y_scale(0);
              return y_scale(d[previous_stacked_column]);
            })
            .y1(function(d) {              
              if (previous_stacked_column == null) return y_scale(d[y_col]);
              return y_scale(d[y_col]+d[previous_stacked_column])
            });

          g.append("svg:path")
            .attr("d", area(data_col))                    
            .attr("style",'stroke:'+strokeColor)
            .attr("style",'fill:'+fillColor)
            .on("mouseover", function(d) {
              d3.selectAll(".overlay-line").style("visibility", "visible");
            })
            .on("mousemove", mousemove)
            .on("mouseout", function(){
              d3.selectAll(".overlay-line").style("visibility", "hidden");
            });

          var line = d3.svg.line()
            .x(function(d){return x_scale(new Date(d[x_col]))})
            .y(function(d){
              if (previous_stacked_column == null) return y_scale(d[y_col]);
              return y_scale(d[y_col]+d[previous_stacked_column]);
            });

          g.append("svg:path")
            .attr("d", line(data_col))
            .attr("class", 'lineStyle')
            .attr("style",'stroke:'+strokeColor);

          var g_circles = svg[index].append("svg:g");
          g_circles.attr("class","dataCircles");

          g_circles.selectAll("circle")
            .data(data_col)
            .enter()
            .append("circle")
            .attr("class", 'linedot linedot'+i)
            .attr("style",function(d){ var _fill = (new Date(d.date_processed).getMonth() + 1 == 1) ? 'fill:'+strokeColor : 'display: none'; return _fill;})
            .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
            .attr("cy", function(d){
              if (previous_stacked_column == null) return y_scale(d[y_col]);
              return y_scale(d[y_col]+d[previous_stacked_column]);
            })
            .attr("r", LINE_DOT_R)
            .attr("name", function(d){return d[y_col]}) //Uses this for tooltip
            .on("mouseover", function(d) {
              d3.selectAll(".overlay-line").style("visibility", "visible");

              tooltip.style("visibility", "visible")
                .text($(this).attr('name'))
                .style("top", $(this).offset().top+30+"px")
                .style("left", $(this).offset().left-25+"px");
            })
            .on("mousemove", mousemove)
            .on("mouseout", function(){
              d3.selectAll(".overlay-line").style("visibility", "hidden");

              tooltip.style("visibility", "hidden");
            });
          previous_stacked_column = y_col;
        }

        $("#"+subject[index].table).find(".graph-data-legend").append('<li><div class="legend-item" style="background-color:'+strokeColor+'"></div><span>'+y_col_name+'</span></li>')
          .attr("r", LINE_DOT_R);
      }

      // Bringing all circles over the areas
      svg[index].selectAll("g.dataCircles").each(function(d) {
        svg[index].node().appendChild(this);
      });

      if(min_val < 0) {
        var x_axis = d3.svg.axis().scale(x_scale);

        svg[index].append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - margin) + ")") // not working
            .call(d3.svg.axis().scale(x_scale).orient("bottom"));
      }

    });
  }
});