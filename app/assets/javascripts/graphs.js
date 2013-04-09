var margin = 40;
var margin_top = 80;
var h = 388;
var w = 1038;
var LINE_DOT_R = 4;
var INTERPOLATE_METHOD = "cardinal";

//chart info
var subject = [];

//svgs for d3
var svg = [];

var LINE_DOT_R = 4;
var x_scale;

//Creates generic tooltip
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip generic_tooltip tooltip-top");


function moveOverlayLine() {
  var mouse_x = d3.mouse(this)[0];
  var time = new Date(x_scale.invert(mouse_x));

  d3.selectAll(".year_marker")
    .text((time.getMonth()+1)+"/"+time.getFullYear())

  $(".year_marker").css('left',mouse_x-35);

  if(mouse_x < -2 || mouse_x > 1038) {
    d3.selectAll(".year_marker").style("visibility", "hidden");
  };

  $(".overlay-line")
    .attr("transform", "translate(" + mouse_x + ",0)")
    .attr("css", "visibility: visible;");
}

function moveOverlayLineSelector() {
  var mouse_x = d3.mouse(this)[0]+30;
  var time = new Date(x_scale.invert(mouse_x));

  d3.selectAll(".year_marker")
    .text((time.getMonth()+1)+"/"+time.getFullYear())

  $(".year_marker").css('left',mouse_x-35);
  $(".overlay-line").css('left',mouse_x-35);
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
      .attr("height", h+margin);

    _domainq = _domainq + 'SELECT%20min(date_processed)%20as%20min,%20max(date_processed)%20as%20max%20FROM%20'+subject[i].table
  }

  //Creates year marker on every years timeline
  d3.selectAll(".years").each(function(d){
    year_marker = $(this).append("<div class='year_marker'>1990</div>");
  });


  d3.json(_domainq+')%20as%20aux%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79', function(data) {

    var std_domain = [new Date(data.rows[0].min),new Date(data.rows[0].max)];

    // Calculates the global x_scale
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
        var year_x_position = Math.round(x_scale(newYear)) - 15;
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
            posit.push(parseFloat(value));
          } else {
            negat.push(Math.abs(parseFloat(value)));
          }
        }
      });

      var max_negat  = d3.max(negat),
        max_posit = d3.max(posit),
        max = d3.max([max_negat, max_posit]);

      var total_graph_area_width = 650;
      var total_series_height = 200;
      var group_width = total_graph_area_width/subject[index].x_groups.length;
      var bar_height = 2
      
      var max_bar = 0;
      if (max_negat != null) {
        max_bar = group_width*parseFloat(max)/parseFloat(parseFloat(max_negat) + parseFloat(max_posit));
      } else{
        max_bar = group_width;
      }      

      var series_step = total_series_height/data.rows.length;
      var series_label_left_margin = 40;
      var series_label_top_margin = 70;
      var series_label_width = 363;

      var positive_color = "#546DBC";
      var negative_color = "#F0542C";


      var bar_width_scale = d3.scale.linear()
        .domain([0,max])
        .range([0, max_bar]);

      var zero_pos = 0;
      if (max_negat != null) {
        zero_pos = bar_width_scale(max_negat); // Zero position for each group equals the bar of the mazimum negative number
      }

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
          return d[subject[index].name_column];
        })
        .attr("x", function(d,i) {
          return series_label_left_margin;
        })
        .attr("y", function(d,i) {
          return series_label_top_margin + (i * series_step);
        });

      // Drawing group-x labels if there are more than one
      if ((subject[index].x_groups).length > 1) {
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
            return 30;
          });
      }
      
      // Drawing each x-group
      for (var j = 0; j < subject[index].x_groups.length; j++) {

        // Drawing an axis for each group_x
        var lineGraph = svg[index].append("svg:line")
          .attr("x1", series_label_width+group_width*j+zero_pos)
          .attr("y1", 50)
          .attr("x2", series_label_width+group_width*j+zero_pos)
          .attr("y2", h-130)
          .style("stroke", "#ddd")
          .style("shape-rendering", "crispEdges");

        var group_name_ = subject[index].x_groups[j].column;
        var units_ = subject[index].units;

        (function(group_name, units) { // We need a reference to group_name & units in runtime, for tooltips
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
              if (d[group_name] > 0) {
                return "fill: "+positive_color;
              } else {
                return "fill: "+negative_color;
              }              
            })
            .attr("name", function(d){
              return Math.round(d[group_name]*1000)/1000;
            })

          svg[index].selectAll("circle."+group_name)
            .data(data.rows)
            .enter()
            .append("circle")
            .attr("class", group_name+' linedot linedot'+i)
            .attr("style",function(d) {
              if (d[group_name] > 0) {
                return "stroke: "+positive_color+"; fill: #fff";
              } else {
                return "stroke: "+negative_color+"; fill: #fff";
              }              
            })
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
            .attr("name", function(d){return (Math.round(d[group_name]*1000)/1000) + " " + units}) //Uses this for tooltip
            .on("mouseover", function(d) {
              var tooltipClassname = "";
              var x_tooltip = 0;

              if (d[group_name] > 0) {
                tooltipClassname = "tooltip generic_tooltip tooltip-left";
                x_tooltip = $(this).offset().left + 24;
              } else {                
                tooltipClassname =  "tooltip generic_tooltip tooltip-right";
                x_tooltip = $(this).offset().left - $(".generic_tooltip").width() - 30;
              }

              d3.select(this)
                .transition()
                .duration(100)
                .attr("r",LINE_DOT_R+1);

              tooltip.style("visibility", "visible")
                .text($(this).attr('name'))
                .attr("class",tooltipClassname)
                .style("top", ($(this).offset().top-11)+"px")
                .style("left",x_tooltip+"px");
            })
            .on("mousemove", moveOverlayLine)
            .on("mouseout", function(){
              tooltip.style("visibility", "hidden");

              d3.select(this)
                .attr("style",function(d) {
                  if (d[group_name] > 0) {
                    return "stroke: "+positive_color+"; fill: #fff";
                  } else {
                    return "stroke: "+negative_color+"; fill: #fff";
                  }              
                })
                .transition()
                .duration(100)
                .attr("r",LINE_DOT_R);
            });
        })(group_name_, units_);
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
      //var previous_stacked_column = null;
      var stacked_area_accumulated = new Array();
      var min_val = 0;

      for (var i = 0; i < subject[index].series.length; i++) {
        // append one group per series
        var g = svg[index].append("svg:g");
        var strokeColor_ = subject[index].series[i].strokeColor;
        var fillColor = subject[index].series[i].fillColor;
        var y_col = subject[index].series[i].column;
        var y_col_name = subject[index].series[i].name;

        var y_scale = d3.scale.linear()
          .range([h, margin_top])
          .domain(subject[index].series[i].y_extent);

        // remove null values and find min_val if negative value
        var data_col = _data.rows.filter(function(d) {
          if(d[y_col] < min_val) {
            min_val = d[y_col];
          }
          return (d[y_col] != null) && (d[y_col] != 0)
        });

        // //Creates focus + multiple tooltips per serie
        // g.append("div")
        //   .attr("class", "tooltip tooltip-top multiple_tooltip multiple_tooltip_"+index+"_"+i);
        // g.append("circle")
        //   .attr("class", 'focus focus_'+index+"_"+i)
        //   .data(data_col)
        //   .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
        //   .attr("cy", function(d){return y_scale(d[y_col])})
        //   .attr("r", LINE_DOT_R)

        svg[index].append("rect")
          .attr("class", "overlay-line")
          .attr("height", h)
          .attr("width", 2)
          .attr("cy", 0);

        if (subject[index].series[i].class == "line") {
          var line = d3.svg.line()
            .x(function(d){return x_scale(new Date(d[x_col]))})
            .y(function(d){return y_scale(d[y_col])})
            .interpolate(INTERPOLATE_METHOD);

          var units_ = subject[index].series[i].units;

          g.append("svg:path")
            .attr("d", line(data_col))
            .attr("class", 'lineStyle')
            .attr("style",'stroke:'+strokeColor_);

          (function(strokeColor, units){  // We need a reference to strokeColor in runtime, for hover
          g.selectAll(".linedot")
            .data(data_col)
            .enter()
            .append("circle")
            .attr("class", 'linedot linedot'+i)
            //This shows only the first point during each year
            .attr("style",function(d){ var _fill = (new Date(d.date_processed).getMonth() + 1 == 1) ? 'fill:'+strokeColor : 'display: none'; return _fill;})
            .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
            .attr("cy", function(d){return y_scale(d[y_col])})
            .attr("r", LINE_DOT_R)
            .attr("name", function(d){return (Math.round(d[y_col]*1000)/1000)+ " " + units}) //Uses this for tooltip
            .on("mouseover", function(d) {
              d3.selectAll(".overlay-line").style("visibility", "visible");
              d3.selectAll(".year_marker").style("visibility", "visible");

              tooltip.style("visibility", "visible")
                .html($(this).attr('name'))
                .style("top", $(this).offset().top+30+"px")
                .style("left", $(this).offset().left-$(".generic_tooltip").width()/2-2+"px")
                .attr("class","tooltip generic_tooltip tooltip-top");

              d3.select(this).attr("style","fill: #fff; stroke: #000")
                .transition()
                .duration(100)
                .attr("r",LINE_DOT_R+1);
            })
            .on("mousemove", moveOverlayLine)
            .on("mouseout", function(d){
              d3.selectAll(".overlay-line").style("visibility", "hidden");
              d3.selectAll(".year_marker").style("visibility", "hidden");

              tooltip.style("visibility", "hidden");

              d3.select(this).attr("style","fill: "+strokeColor+"; stroke: #fff")
                .transition()
                .duration(100)
                .attr("r",LINE_DOT_R);
            });
          })(strokeColor_, units_);
        } else if (subject[index].series[i].class == "area") {

          var units_ = subject[index].series[i].units;

          // Preparing things for the side gradients
          // Insert a value before and after the time range, for the sides gradient
          var extended_data_col = new Array();
          extended_data_col = jQuery.extend(true,[],data_col);
          var fake_right = jQuery.extend(true,{},extended_data_col[extended_data_col.length - 1]);
          fake_right[x_col] = (parseInt(fake_right[x_col])+1)+""; 
          extended_data_col.push(fake_right);
          var fake_left = jQuery.extend(true,{},extended_data_col[0]);
          fake_left[x_col] = (parseInt(fake_left[x_col])-1)+"";
          extended_data_col.unshift(fake_left);
          var firstDate = new Date("January 1, 2030 00:00:00"); // Max value to make sure we find a minimum
          var lastDate = new Date("January 1, 1960 00:00:00"); // Min value to make sure we find a maximum

          y_scale = d3.scale.linear()
            .range([h, margin_top])
            .domain(subject[index].series[i].y_extent);

          function getAccumulatedValue(d) {
            var date = (new Date(d[x_col])).getFullYear();
            var accumulated_value = stacked_area_accumulated[date];
            if (accumulated_value == null) accumulated_value = 0;
            var current_value = d[y_col];
            return y_scale(parseFloat(current_value)+parseFloat(accumulated_value));
          }

          var area = d3.svg.area()
            .x(function(d) {return x_scale(new Date(d[x_col]))})
            .y0(function(d) {
              var date = new Date(d[x_col]);
              if (date < firstDate) firstDate = date;
              if (date > lastDate) lastDate = date;              
              var yearStr = date.getFullYear();
              var accumulated_value = stacked_area_accumulated[yearStr];
              if (accumulated_value == null) accumulated_value = 0;
              return y_scale(parseFloat(accumulated_value));
            })
            .y1(function(d) {
              return getAccumulatedValue(d);
            })
            .interpolate(INTERPOLATE_METHOD);

          g.append("svg:path")
            .attr("d", area(extended_data_col))
            .attr("style",'stroke:'+strokeColor_)
            .attr("style",'fill:'+fillColor)
            .on("mouseover", function(d) {
              d3.selectAll(".overlay-line").style("visibility", "visible");
              d3.selectAll(".year_marker").style("visibility", "visible");
            })
            .on("mousemove", moveOverlayLine)
            .on("mouseout", function(){
              d3.selectAll(".overlay-line").style("visibility", "hidden");
              d3.selectAll(".year_marker").style("visibility", "hidden");
            });

          var line = d3.svg.line()
            .x(function(d){return x_scale(new Date(d[x_col]))})
            .y(function(d){
              return getAccumulatedValue(d);
            })
            .interpolate(INTERPOLATE_METHOD);

          g.append("svg:path")
            .attr("d", line(extended_data_col))
            .attr("class", 'lineStyle')
            .attr("style",'stroke:'+strokeColor_);

          var g_circles = svg[index].append("svg:g");
          g_circles.attr("class","dataCircles");

          (function(strokeColor, units){  // We need a reference to strokeColor in runtime, for hover
            g_circles.selectAll("circle")
              .data(data_col)
              .enter()
              .append("circle")
              .attr("class", 'linedot linedot'+i)
              .attr("style",function(d){ var _fill = (new Date(d.date_processed).getMonth() + 1 == 1) ? 'fill:'+strokeColor : 'display: none'; return _fill;})
              .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
              .attr("cy", function(d){
                return getAccumulatedValue(d);                
              })
              .attr("r", LINE_DOT_R)
              .attr("name", function(d){return d[y_col]+ " " + units}) //Uses this for tooltip
              .on("mouseover", function(d) {
                d3.selectAll(".overlay-line").style("visibility", "visible");
                d3.selectAll(".year_marker").style("visibility", "visible");
                
                tooltip.text($(this).attr('name'))
                  .style("visibility", "visible")
                  .style("top", $(this).offset().top+30+"px")
                  .style("left", $(this).offset().left-$(".generic_tooltip").width()/2-2+"px")
                  .attr("class","tooltip generic_tooltip tooltip-top");

                d3.select(this).attr("style","fill: #fff; stroke: #000;")
                  .transition()
                  .duration(100)
                  .attr("r",LINE_DOT_R+1);
              })
              .on("mousemove", moveOverlayLine)
              .on("mouseout", function(){
                d3.selectAll(".overlay-line").style("visibility", "hidden");
                d3.selectAll(".year_marker").style("visibility", "hidden");

                tooltip.style("visibility", "hidden");

                d3.select(this).attr("style","fill: "+strokeColor+"; stroke: #fff;")
                  .transition()
                  .duration(100)
                  .attr("r",LINE_DOT_R);
              });
          })(strokeColor_, units_);

          // Accumulating this series' values for next stacked areas
          extended_data_col.forEach(function (d) {
            var date = (new Date(d[x_col])).getFullYear();
            var accumulated_value = stacked_area_accumulated[date];
            if (accumulated_value == null) accumulated_value = 0;
            var current_value = d[y_col];
            stacked_area_accumulated[""+date] = parseFloat(accumulated_value) + parseFloat(current_value);
          });
        }

        $("#"+subject[index].table).find(".graph-legend").append('<li><div class="legend-item" style="background-color:'+strokeColor_+'"></div><span>'+y_col_name+'</span></li>')
          .attr("r", LINE_DOT_R);
      }

      //Overlay
      d3.selectAll(".graph-slider")
        .on("mouseover", function() {
          d3.selectAll(".overlay-line").style("visibility", "visible");
          d3.selectAll(".year_marker").style("visibility", "visible");
        })
        .on("mousemove", moveOverlayLine)
        .on("mouseout", function() {
          d3.selectAll(".overlay-line").style("visibility", "hidden");
          d3.selectAll(".year_marker").style("visibility", "hidden");
        })

      //Add zero-line if negative value
      if(min_val < 0) {
        var x_axis = d3.svg.axis().scale(x_scale);

        svg[index].append("svg:line")
          .attr("class", "zero-mark")
          .attr("x1", 0)
          .attr("x2", w)
          .attr("y1", y_scale(0))
          .attr("y2", y_scale(0))
          .style("stroke-dasharray", "8, 4");
      }

      if (stacked_area_accumulated.length > 0) {
        // If there are any stacked area, we draw the side gradients
        var left_gradient_x = x_scale(firstDate) - 15;
        var right_gradient_x = x_scale(lastDate) - 55;
        svg[index].append("svg:image")
          .attr("x",left_gradient_x)
          .attr("y",0)
          .attr("width",70)
          .attr("height",h)
          .attr("xlink:href","/img/left_gradient.png");
        svg[index].append("svg:image")
          .attr("x",right_gradient_x)
          .attr("y",0)
          .attr("width",70)
          .attr("height",h)
          .attr("xlink:href","/img/right_gradient.png");
      }

      // Bringing all circles over lines + areas + overlay lines
      svg[index].selectAll("circle").each(function() {
        svg[index].node().appendChild(this);
      });
    });
  }

  // Year marker
  d3.selectAll(".years")
    .on("mouseover", function() {
      d3.selectAll(".overlay-line").style("visibility", "visible");
      d3.selectAll(".year_marker").style("visibility", "visible");
    })
    .on("mousemove", moveOverlayLine)
    .on("mouseout", function(){
      d3.selectAll(".overlay-line").style("visibility", "hidden");
      d3.selectAll(".year_marker").style("visibility", "hidden");
    });
});