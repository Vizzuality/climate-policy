var margin = 30;
var top_margin = 100;
var h = 388;
var w = 1038;
var LINE_DOT_R = 4;

//chart info
var subject = [];

//svgs for d3
var svg = [];

var LINE_DOT_R = 4;
var x_scale;


//Creates generic tooltip
//TODO: Create simultaeous tooltips per serie
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip tooltip-top");
  //uncomment for left tooltip
  // .attr("class", "tooltip tooltip-left");
  //uncomment for right tooltip
  // .attr("class", "tooltip tooltip-right");


function moveOverlayLine() {
  d3.selectAll(".overlay-line")
    .attr("cx", d3.mouse(this)[0])
    .attr("transform", "translate(" + d3.mouse(this)[0] + ",0)")
    .attr("cy", 0);

  var mouse_x = d3.mouse(this)[0];
  if (x_scale) {
    var time = new Date(x_scale.invert(mouse_x));
    //console.log(time);
  }

  /*  
  var x_scale = d3.scale.linear()
    .range([margin,w-margin])
    .domain(_domain);
    */

}


$(document).ready(function() {
  var _domainq = 'http://cpi.cartodb.com/api/v2/sql?q=SELECT%20min(min)%20as%20min,%20max(max)%20as%20max%20FROM%20(';

  //Creates the query needed for calculating the default domain for the charts
  for (var i = 0; i < datasets.sectors[0].subjects.length; i++) {
    if(i!=0){
      _domainq = _domainq + '%20UNION%20'
    }

    subject[i] = datasets.sectors[0].subjects[i];

    svg[i] = d3.select("#"+subject[i].table)
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    _domainq = _domainq + 'SELECT%20min(date_processed)%20as%20min,%20max(date_processed)%20as%20max%20FROM%20'+subject[i].table

    //Creates an overlay + overlay line per subject unless barchart type
    if(subject[i].type != 'BarGraph') {
      svg[i].append("rect")
        .attr("class", "overlay")
        .attr("width", w)
        .attr("height", h)
        .on("mouseover", function(d){d3.selectAll(".overlay-line").style("visibility", "visible");})
        .on("mousemove", moveOverlayLine)
        .on("mouseout", function(){d3.selectAll(".overlay-line").style("visibility", "hidden");});

      svg[i].append("rect")
        .attr("class", "overlay-line")
        .attr("width", 2)
        .attr("height", h)
    }
  }

  d3.json(_domainq+')%20as%20aux%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79', function(data) {
    var std_domain = [new Date(data.rows[0].min),new Date(data.rows[0].max)];

    // Calculates the x_scale
    x_scale = d3.scale.linear()
      .range([margin,w-margin])
      .domain(std_domain);

    // Calculates the years for the time axis

    var year_step = 2;

    d3.selectAll("div.years").each(function(d){

      var year_init = parseInt(std_domain[0].getFullYear());
      var year_end = parseInt(std_domain[1].getFullYear());
      
      for (var y = year_init; y<=year_end; y += 3) {
        var newYear = new Date();
        newYear.setDate(1);
        newYear.setMonth(0);
        newYear.setFullYear(y);

        // Add each year as a span
        var year_x_position = Math.round(x_scale(newYear)) - 15;
        console.log(year_x_position);
        $(this).append("<span class='year_label' style='left:"+year_x_position+"px'>"+y+"</span>");        

      }
    });

    for (var i = 0; i < datasets.sectors[0].subjects.length; i++) {
      if(subject[i].type == 'BarGraph') {
        drawBarChart(i, std_domain);
      } else {
        drawChart(i, std_domain);
      }
    }
  })


  function drawBarChart(index,domain) {
    d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[index].table+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data) {

      // Graph settings, domain & ranges calculation, scales, etc.
      var negat = [], posit = [];

      data.rows.forEach(function(d){
        var values = [];
        for (var j = 0; j < subject[index].x_groups.length; j++) {
          var value = d[subject[index].x_groups[j].column];
          if (value > 0) {
            posit.push(value);
          } else {
            negat.push(Math.abs(value));
          }
        }
      });

      var max_negat  = d3.max(negat),
        max_posit = d3.max(posit),
        max = d3.max([max_negat, max_posit]);

      var total_graph_area_width = 650;
      var total_series_height = 200;
      var group_width = total_graph_area_width/subject[index].x_groups.length;
      //var bar_height = 100/data.rows.length;
      var bar_height = 2
      var max_bar = group_width*parseFloat(max)/parseFloat(parseFloat(max_negat) + parseFloat(max_posit));

      var series_step = total_series_height/data.rows.length;
      var series_label_left_margin = 40;
      var series_label_top_margin = 170;
      var series_label_width = 363;

      var bar_width_scale = d3.scale.linear()
        .domain([0,max])
        .range([0, max_bar]);

      var zero_pos = bar_width_scale(max_negat); // Zero position for each group equals the bar of the mazimum negative number

      // Series labels
      svg[index].selectAll("text.graph-series-label")
        .data(data.rows)
        .enter()
        .append("text")
        .attr("class","graph-series-label")
        .attr("id",function(d) {
          return "series_label_"+d.cartodb_id;
        })
        .text(function(d) {
          return d.variable;
        })
        .attr("x", function(d,i) {
          return series_label_left_margin;
        })
        .attr("y", function(d,i) {
          return series_label_top_margin + (i * series_step);
        });

      // Group labels
      svg[index].selectAll("text.graph-groups-label")
        .data(subject[index].x_groups)
        .enter()
        .append("text")
        .attr("class","graph-groups-label")
        .text(function(d) {
          return d.label;
        })
        .attr("x", function(d,i) {
          return series_label_width + group_width*i + zero_pos - 40;
        })
        .attr("y", function(d,i) {
          return 140;
        });
      
      // Drawing each x-group
      for (var j = 0; j < subject[index].x_groups.length; j++) {

        // Drawing an axis for each group_x
        var lineGraph = svg[index].append("svg:line")
          .attr("x1", series_label_width+group_width*j+zero_pos)
          .attr("y1", 160)
          .attr("x2", series_label_width+group_width*j+zero_pos)
          .attr("y2", h-30)
          .style("stroke", "#DDDDDD");

        var group_name_ = subject[index].x_groups[j].column;

        (function(group_name) { // We need a reference to group_name in runtime, for tooltips
          svg[index].selectAll("rect."+group_name)
            .data(data.rows)
            .enter()
            .append("rect")
            .attr("class",group_name)
            .attr("x", function(d,i) {
              if (d[group_name] > 0) {
                return series_label_width + group_width*j + zero_pos;
              } else {
                return series_label_width + group_width*j + zero_pos - bar_width_scale(Math.abs(d[group_name]));
              }
            })
            .attr("y", function(d,i) {
              return series_label_top_margin + (i * series_step) - bar_height/2 - 7;
            })
            .attr("width", function(d,i) {
              var bar_width = bar_width_scale(Math.abs(d[group_name]));
              if (bar_width <= 2) bar_width = 2;
              return bar_width;
            })
            .attr("height", function(d,i) {
              return bar_height;
            })
            .attr("style",function (d) {
              return "fill: #546DBC";
            })
            .attr("name", function(d){
              return Math.round(d[group_name]*1000)/1000;
            })

          svg[index].selectAll("circle."+group_name)
            .data(data.rows)
            .enter()
            .append("circle")
            .attr("class", group_name+' linedot linedot'+i)
            .attr("style",'stroke: #546DBC; fill: #fff')
            .attr("cx", function(d){
              var x = series_label_width + group_width*j + zero_pos;

              if (d[group_name] > 0) {
                x += bar_width_scale(Math.abs(d[group_name]));
              } else {
                x -= bar_width_scale(Math.abs(d[group_name]))
              }

              return x;
            })
            .attr("cy", function(d,i){
              return series_label_top_margin + (i * series_step) - bar_height/2 - 6}
            )
            .attr("r", LINE_DOT_R)
            .attr("name", function(d){return Math.round(d[group_name]*1000)/1000}) //Uses this for tooltip
            .on("mouseover", function(d) {
              tooltip.style("visibility", "visible")
                .text($(this).attr('name'))
                .style("top", $(this).offset().top+30+"px")
                .style("left", $(this).offset().left-25+"px");
            })
            .on("mousemove", moveOverlayLine)
            .on("mouseout", function(){
              tooltip.style("visibility", "hidden");
            });
        })(group_name_);
      }
    });
  }

  //Draws a lineChart
  //index:index of the table on the json, 
  //std_domain: specific domain - keep undefined for showing the chart's own domain
  function drawChart(index,domain) {
    d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[index].table+"%20order%20by%20"+subject[index].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data) {
      var _data = data;

      if(domain === undefined) {
        _data['min_domain'] = d3.min(_data.rows, function(data){return data.date_processed;})
        _data['max_domain'] = d3.max(_data.rows, function(data){return data.date_processed;})
        _domain = [new Date(_data.min_domain),new Date(_data.max_domain)];
      } else {
        _domain = domain;
      }

      var x_col = subject[index].x_axis;
      //var x_scale = d3.scale.linear()
      /*
      x_scale = d3.scale.linear()
        .range([margin,w-margin])
        .domain(_domain);
        */

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
          .range([h, top_margin])
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
              var date = new Date(d[x_col]);
              tooltip.style("visibility", "visible")
                .text($(this).attr('name') + "·" + date)
                .style("top", $(this).offset().top+30+"px")
                .style("left", $(this).offset().left-25+"px");
            })
            .on("mousemove", moveOverlayLine)
            .on("mouseout", function(){
              d3.selectAll(".overlay-line").style("visibility", "hidden");
              tooltip.style("visibility", "hidden");
            });

        } else if (subject[index].series[i].class == "area") {

          // y_scale needs to be adjusted to the maximum
          y_scale = d3.scale.linear()
          .range([h, top_margin])
          .domain(subject[index].series[i].y_extent);

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
            .on("mousemove", moveOverlayLine)
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
            .on("mousemove", moveOverlayLine)
            .on("mouseout", function(){
              d3.selectAll(".overlay-line").style("visibility", "hidden");
              tooltip.style("visibility", "hidden");
            });
          previous_stacked_column = y_col;
        }

        $("#"+subject[index].table).find(".graph-legend").append('<li><div class="legend-item" style="background-color:'+strokeColor+'"></div><span>'+y_col_name+'</span></li>')
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