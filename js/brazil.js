var margin = 30;
var top_margin = 150;
var h = 380;
var w = 1038;
var subject = [];
var svg = [];
var overlayLine;

var LINE_DOT_R = 4;


function mousemove() {
  overlayLine
    .attr("cx", d3.mouse(this)[0])
    .attr("transform", "translate(" + d3.mouse(this)[0] + ",0)")
    .attr("cy", 0);
}


$(document).ready(function() {
  var _domainq = 'http://cpi.cartodb.com/api/v2/sql?q=SELECT%20min(min)%20as%20min,%20max(max)%20as%20max%20FROM%20(';

  //Creates generic tooltip
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

  //Creates an overlay
  var overlay = d3.select(".graphs")
    .append("svg")
    .attr("class", "overlay")
    .attr("width", w)
    .attr("height", $(".graphs").height()-$(".slider").height())
    .style("top", $(".graphs").offset().top)
    .on("mousemove", mousemove);

  overlayLine = overlay.append("rect")
    .attr("class", "overlay-line")
    .attr("width", 2)
    .attr("height", $('.graphs').height()-$(".slider").height());

  //Creates the query needed for calculating the default domain for the charts
  for (var i = 0; i < datasets.sectors[0].subjects.length; i++) {
    if(i!=0){
      _domainq = _domainq + '%20UNION%20'
    }
    subject[i] = datasets.sectors[0].subjects[i];
    svg[i] = d3.select("#"+subject[i].table).append("svg").attr("width", w).attr("height", h);
    _domainq = _domainq + 'SELECT%20min(date_processed)%20as%20min,%20max(date_processed)%20as%20max%20FROM%20'+subject[i].table
  }

  d3.json(_domainq+')%20as%20aux%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79', function(data) {
    var std_domain = [new Date(data.rows[0].min),new Date(data.rows[0].max)];
    drawLineChart(0, std_domain);
    drawLineChart(1, std_domain);
    drawLineChart(2, std_domain);
    drawAreaChart(3, std_domain);
  })

  function drawAreaChart(index, domain) {
    console.log("Drawing area chart for "+index);

    d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[index].table+"%20order%20by%20"+subject[index].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data) {
      
      // Refactorizar para no hacerlo en cada gráfica
      var _data = data;
      if(domain === undefined){
        _data['min_domain'] = d3.min(_data.rows, function(data){return data.date_processed;})
        _data['max_domain'] = d3.max(_data.rows, function(data){return data.date_processed;})
        _domain = [new Date(_data.min_domain),new Date(_data.max_domain)];
      } else {
        _domain = domain;
      }

      var x_col = subject[index].x_axis;
      var x_scale = d3.scale.linear()
        .range([margin,w-margin])
        .domain(_domain);

      var previous_column;

      for (var i = 0; i < subject[index].series.length; i++) {

        var g = svg[index].append("svg:g");
        var strokeColor = subject[index].series[i].strokeColor;
        var y_col = subject[index].series[i].column;
        var y_col_name = subject[index].series[i].name;

        var y_scale = d3.scale.linear()
          .range([h-margin, top_margin]) // Esto está mal
          .domain(subject[index].series[i].y_extent);

        // remove null values
        var data_col = _data.rows.filter(function(d) {
          return (d[y_col] != null) && (d[y_col] != 0)
        });

        var area = d3.svg.area()
            
            .x(function(d) {return x_scale(new Date(d[x_col]))})
            .y0(function(d) {                             
              var value = y_scale(0);
              if (i>0) {
                value = y_scale(d[previous_column]);
              }
              return value;
            })
            .y1(function(d) {              
              var value = y_scale(d[y_col]);
              if (i>0) {
                value = y_scale(d[y_col]+d[previous_column])
              };
              return value;
            });
      
        g.append("svg:path")
          .attr("d", area(data_col))                    
          .attr("style",'stroke:'+strokeColor)
          .attr("style",'fill:'+strokeColor)

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
            var value = y_scale(d[y_col]);
            if (i>0) {
              value = y_scale(d[y_col]+d[previous_column])
            };
            return value;
          })
          .attr("r", LINE_DOT_R)
          .attr("name", function(d){return d[y_col]}) //Uses this for tooltip
          .on("mouseover", function(d) {
            tooltip.style("visibility", "visible")
              .text($(this).attr('name'))
              .style("top", $(this).offset().top+30+"px")
              .style("left", $(this).offset().left-25+"px");
          })
          .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
          previous_column = y_col; // Para que el siguiente área tenga el dato de partida
        }

        // Reordeno para sacar los círculos por encima
        svg[index].selectAll("g.dataCircles").each(function(d) {
          svg[index].node().appendChild(this);
        });
      });
  }

  //Draws a lineChart
  //index:index of the table on the json, 
  //std_domain: specific domain - keep undefined for showing the chart's own domain
  function drawLineChart(index,domain) {

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

      for (var i = 0; i < subject[index].series.length; i++) {
        // append one group per series
        var g = svg[index].append("svg:g");
        var strokeColor = subject[index].series[i].strokeColor;
        var y_col = subject[index].series[i].column;
        var y_col_name = subject[index].series[i].name;

        var y_scale = d3.scale.linear()
          .range([h-margin, top_margin])
          .domain(subject[index].series[i].y_extent);

        // remove null values
        var data_col = _data.rows.filter(function(d) {
          return (d[y_col] != null) && (d[y_col] != 0)
        });

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
            tooltip.style("visibility", "visible")
              .text($(this).attr('name'))
              .style("top", $(this).offset().top+30+"px")
              .style("left", $(this).offset().left-25+"px");
          })
          .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

        $("#"+subject[index].table).parent().find(".graph-data-legend ul").append('<li><div class="legend-item" style="background-color:'+strokeColor+'"></div><span>'+y_col_name+'</span></li>')
          .attr("r", LINE_DOT_R);
      }
    });
  }
});