var margin = 30;
var top_margin = 150;
var h = 380;
var w = 1038;
var subject = [];
var svg = [];

var LINE_DOT_R = 4;

$(document).ready(function() {

  var _domainq = 'http://cpi.cartodb.com/api/v2/sql?q=SELECT%20min(min)%20as%20min,%20max(max)%20as%20max%20FROM%20(';
  for (var i = 0; i < datasets.sectors[0].subjects.length; i++){
    if(i!=0){
      _domainq = _domainq + '%20UNION%20'
    }
    subject[i] = datasets.sectors[0].subjects[i];
    svg[i] = d3.select("#"+subject[i].table).append("svg").attr("width", w).attr("height", h);
    _domainq = _domainq + 'SELECT%20min(date_processed)%20as%20min,%20max(date_processed)%20as%20max%20FROM%20'+subject[i].table
  }

  d3.json(_domainq+')%20as%20aux%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79', function(data){
    var std_domain = [new Date(data.rows[0].min),new Date(data.rows[0].max)];
    drawLineChart(0, std_domain);
    drawLineChart(1, std_domain);
    drawLineChart(2, std_domain);
    drawLineChart(3, std_domain);
  })

  //Draws a lineChart
  //index:index of the table on the json, 
  //std_domain: specific domain - keep undefined for showing the chart's own domain
  function drawLineChart(index,domain){

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
          .attr("class", 'linedot')
          //This shows only the first point during each year
          .attr("style",function(d){ var _fill = (new Date(d.date_processed).getMonth()==0) ? 'fill:'+strokeColor : 'display: none'; return _fill;})
          .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
          .attr("cy", function(d){return y_scale(d[y_col])})
          .attr("r", LINE_DOT_R);
        
        $("#"+subject[index].table).parent().find(".graph-data-legend ul").append('<li><div class="legend-item" style="background-color:'+strokeColor+'"></div><span>'+y_col_name+'</span></li>')
      }
    });
  }
});