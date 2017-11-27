          $(document).ready(function () {
              console.log("hello");
              $("#about").show();
              
              $(".nav-link").on("click",function(){
                  var target = $(this).attr("href");
                  
                  console.log($(this));
                  $(".screen").hide();
                  $(target).show();
              });
          });
          
          
          if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('./sw.js')
           .then(function() { console.log("Service Worker Registered"); 
             
           });
              
          }
    
   
    
    var db = new Dexie('Settings');

	// Define a schema
	db.version(1).stores({
		setting: 'id,name, value'
	});


	// Open the database
	db.open().catch(function(error) {
		alert('Uh oh : ' + error);
	});
    
    db.setting.add({id:1, name:"radius", value:"1"});
    $("#save").on("click", function(){
        
        var radiusValue= $("#radius").val();
        db.setting.update(1,{value:radiusValue}).then(function (updated) {
  if (updated)
    console.log ("Updated");
  else
    console.log ("Could not update");
        
        })
    
    
    });
    
 
    //action listener for the shearch button
   function search_cur_location(){
       //get the current location....
        console.log("In search_cur_Location");
       //function getLocation() {
           console.log("In get Loacation");
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(function(position) {
             
//              console.log ("in get position")
//              console.log(position.coords.latitude);
              getData(position.coords.latitude, position.coords.longitude)
              
       
            });
        } else {
          alert('no geolocation');
        }
      //}
   
   
   }
    
    var nearStations;
    function getData(lat, lng){
        
        
        var radiusInMiles; 
       db.setting
           .where("name")
           .equalsIgnoreCase("radius")
           .each(function (setting) {
            console.log("Found: " + setting.name + ". Value: " + setting.value);
           radiusInMiles=setting.value;
        }).catch(function (error) {
            console.error(error);
        }).then(function(){
        
        
        var radius = parseInt(radiusInMiles)*1609;
        var stringRadius = radius.toString();
        console.log(radiusInMiles);
        //console.log(radius.value);
        var url = "https://data.cityofchicago.org/resource/67g3-8ig8.json?$where=within_circle(location,%20"+lat+",%20"+lng+",%20"+stringRadius+")"
        
            console.log(url);
         $("#results").remove();
        $.get(url,function(data){
            
           console.log(data)
           
         nearStations=data;
             $("#search_by_cur_location").append("<div id='results'><br><br><p>Total "+data.length+" results</p></div>")
           initMap(data);
        google.charts.load('current', {'packages':['corechart']});

           
      // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(getRidesData);

        
        
        
        });
       
       
       });
        
    }
    
    
    
     var map
    var markers=[];
    
        function initMap(data) {
          
          deleteMarkers();
          
          console.log("in initMap");
            var chicago = { lat: 41.8781, lng: -87.6298 };
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 10,
                center: chicago
            });
            
        

           $.each(data,function(i, v) {
               //console.log(v);
          
                    //from here the marker code start
                    var uluru = { lat: parseFloat(v.latitude), lng: parseFloat(v.longitude) };
                  //console.log(uluru);

                    var contentString = "<strong>Station Name: </strong> "+v.station_name+"<br><strong>Total Docks:</strong> "+v.total_docks+"<br><strong>Docks Inservice: </strong>"+v.docks_in_service+"<br><strong>Address:</strong> "+v.address;

                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    var marker = new google.maps.Marker({
                        position: uluru,
                        map: map,
                        title: 'Uluru (Ayers Rock)'
                    });
                    
                    
                    
                    
                    marker.addListener('click', function() {
                        infowindow.open(map, marker);
                    });

                markers.push(marker);
                }); //This is the end of the each loop

           

        }//end of initMap
        
        
         // Sets the map on all markers in the array.
      function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }
        
        
        // Removes the markers from the map, but keeps them in the array.
      function clearMarkers() {
        setMapOnAll(null);
      }
        
        
        // Deletes all markers in the array by removing references to them.
      function deleteMarkers() {
        clearMarkers();
        markers = [];
      }
    
    
    
         function getRidesData(){
        
            // console.log(nearStationsions);
            $.get("https://data.cityofchicago.org/resource/fg6s-gzvg.json?$query=SELECT%20from_station_id,%20from_station_name,%20Count%20(*)%20As%20Total%20GROUP%20BY%20from_station_id%20,%20from_station_name%20Order%20By%20Total%20DESC",
                    function(responce){
                    console.log(responce);
                    drawChart(responce);
                     });
             
        
            }
    
     function drawChart(cityData){
                 var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Station');
                     data.addColumn('number', 'numTrips');
                     
                     $.each(cityData, function(i,v){
                       if (isInNearStations(v.from_station_id))
                         data.addRow([v.from_station_name, parseFloat(v.Total)]);
                         
                     });
                 
             
             

        // Set chart options
        var options = {'title':'Total Rides form the near by stations',
                       'width':400,
                       'height':300};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
        
    }
    
    function isInNearStations( id){
        
    
       for (var i= 0 ; i< nearStations.length; i++){
           if (nearStations[i].id == id){
               return true;
           }
           
       }  
        
        return false;
    }
      
    