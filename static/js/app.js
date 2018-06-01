function getSampleList() 
{
    /* data route */
    var url = "/names";
    Plotly.d3.json(url, function(error, response) {
        
        if (error) return console.warn(error);
        
        var names = response
        selector = document.getElementById("selDataset")
        for (i=0; i<names.length;i++)
        {
            var currentOption = document.createElement('option');
            currentOption.text = names[i];
            selector.appendChild(currentOption);
        }
        
    });
}

function getSampleMetaData(sampleid) 
{
    
    var url = "/metadata/" + sampleid;
    Plotly.d3.json(url, function(error, response) {
        
        if (error) return console.warn(error);
        
        selector = document.getElementById("sampleMetaData")
        selector.innerHTML = "AGE: " + response.AGE + "<br>" + 
                             "BBTYPE: " + response.BBTYPE + "<br>" + 
                             "ETHNICITY: " + response.ETHNICITY + "<br>" + 
                             "GENDER: " + response.GENDER + "<br>" + 
                             "LOCATION: " + response.LOCATION + "<br>" + 
                             "SAMPLEID: " + response.SAMPLEID        
    });
}

function plotPie(sampleid) 
{
    var url = "/samples/" + sampleid;
    //console.log(sampleid)
    //console.log(url)
    
    Plotly.d3.json(url, function(error, response){
            if (error) return console.warn(error);

            var labels = response.otu_ids.slice(0, 10);
            var values = response.sample_values.slice(0,10);
            
            desc = []
            
            new_url = "/otu"
        
            Plotly.d3.json(new_url,function(error,response1)
                           {
                                    for (var i=0;i<labels.length;i++)
                                    {
                                        if (error) return console.warn(error);
                                            desc.push(response1[labels[i]-1])
                                    }
                                }
                            )
            
            //console.log(desc)
            data =  [{  "labels": labels,
                        "values": values,
                        "text":desc,
                        "type": "pie"}   ]
             var layout = {
                title: '<b>Bacterial OTUs of Sample <br> for ' + sampleid
                };
        
            var PIE = document.getElementById('PieChart');
        
            Plotly.newPlot(PIE, data, layout);
        })
}

function buildGauge(sample) 
{
        Plotly.d3.json(`/wfreq/${sample}`, function(error, wfreq) {
                if (error) return console.warn(error);
                // Enter the washing frequency between 0 and 180
                //console.log(wfreq.WFREQ)
                var level = wfreq.WFREQ*20;
                //console.log(level)
                // Trig to calc meter point
                var degrees = 180 - level,
                    radius = .5;
                var radians = degrees * Math.PI / 180;
                var x = radius * Math.cos(radians);
                var y = radius * Math.sin(radians);

                // Path: may have to change to create a better triangle
                var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
                    pathX = String(x),
                    space = ' ',
                    pathY = String(y),
                    pathEnd = ' Z';
                var path = mainPath.concat(pathX,space,pathY,pathEnd);

                var data = [{ type: 'scatter',
                x: [0], y:[0],
                    marker: {size: 12, color:'850000'},
                    showlegend: false,
                    name: 'Freq',
                    text: level,
                    hoverinfo: 'text+name'},
                { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
                rotation: 90,
                text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
                textinfo: 'text',
                textposition:'inside',
                marker: {
                    colors:[
                        'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                        'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                        'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                        'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                        'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
                labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
                hoverinfo: 'label',
                hole: .5,
                type: 'pie',
                showlegend: false
                }];

                var layout = {
                shapes:[{
                    type: 'path',
                    path: path,
                    fillcolor: '850000',
                    line: {
                        color: '850000'
                    }
                    }],
                title: '<b>Belly Button Washing Frequency <br> for BB_' + wfreq.SAMPLEID,
                height: 500,
                width: 500,
                xaxis: {zeroline:false, showticklabels:false,
                            showgrid: false, range: [-1, 1]},
                yaxis: {zeroline:false, showticklabels:false,
                            showgrid: false, range: [-1, 1]}
                };

                var GAUGE = document.getElementById('gauge');
                Plotly.newPlot(GAUGE, data, layout);
            });
}

function plotScatter(sampleid)
{
  var url = "/samples/" + sampleid;
    Plotly.d3.json(url, function(error, response){
            if (error) return console.warn(error);
            
            var xaxis = response.otu_ids;
            var yaxis = response.sample_values;
            var size = []
            
            for (i=0;i<yaxis.length;i++)
            {
                size.push(yaxis[i]*0.45)   
            }

            desc1 = []
            new_url = "/otu"
        
            Plotly.d3.json(new_url,function(error,response1){
                                    for (var i=0;i<xaxis.length;i++)
                                    {
                                        if (error) return console.warn(error);
                                            desc1.push(response1[xaxis[i]-1])
                                    }
                                }
                            )
            
            console.log(desc1)
        
        
            data =  [   {   x: xaxis,
                             y: yaxis,
                             mode: 'markers',
                             type: "scatter",
                             text:desc1,
                             marker: {size: size,
                                     color:xaxis.map(j=>j)
                                     }
                         }   
                    ]
            
            var layout = {
                title: '<b>Number of Bacterial Samples per OTU for Sample ' + sampleid,
                showlegend: false,
                hovermode: "closest",
                yaxis: {title: "# of Samples",
                    showline: true,
                    zeroline: false},
                xaxis: {title: "OTU ID",
                    showline: true,
                    zeroline: false
                }};
        
            var SCATTER = document.getElementById('scatter');
        
            Plotly.newPlot(SCATTER, data,layout);
        })
}

function getData(sampleid)
{
    getSampleMetaData(sampleid)
    plotPie(sampleid)
    buildGauge(sampleid)
    plotScatter(sampleid)
}

getSampleList()
getSampleMetaData("BB_940")
plotPie("BB_940")
buildGauge("BB_940")
plotScatter("BB_940")
console.log("I am here")
