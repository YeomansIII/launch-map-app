import {Component, ViewEncapsulation} from '@angular/core';
import {circle, latLng, polygon, tileLayer, Map as LeafletMap, point, marker, PointExpression, Point} from 'leaflet';
import {HttpClient} from '@angular/common/http';

import * as L from 'leaflet';
import * as moment from 'moment';
import 'leaflet.timeline';
import '../../node_modules/leaflet-timedimension/dist/leaflet.timedimension.src.js';
import '../../node_modules/leaflet.timeline/dist/leaflet.timeline.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'app';
  map: LeafletMap;
  markerCluster: any;
  timeDimension: any;
  launches: any;
  launchesGeoJsonLayer: any;
  query = 'https://yeomansiii.carto.com:443/api/v2/sql?format=GeoJSON&q=select * from public.launches';

  rocketIcon = L.icon({
    iconUrl: '/assets/images/rocket_icon.png',
    iconSize: [90, 90],
    iconAnchor: [90, 90],
    popupAnchor: [-3, -76]
  });
  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
    ],
    zoomControl: false,
    zoom: 2,
    minZoom: 2,
    noWrap: true,
    continuousWorld: false,
    center: latLng(20, 0),
    timeDimension: true
  };
  layersControl = {
    baseLayers: {
      'Open Street Map': tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '...',
        noWrap: true,
        continuousWorld: false
      }),
      'Open Cycle Map': tileLayer('http://{s}.tile.opencyclemap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '...',
        noWrap: true,
        continuousWorld: false
      })
    },
    overlays: {
      'Big Circle': circle([46.95, -122], {radius: 5000}),
      'Big Square': polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]]),
      '0,0': marker([0, 0], {icon: this.rocketIcon}),
      '1, 4351': marker([90, 180], {icon: this.rocketIcon}),
      '1247, 1': marker([-90, -180], {icon: this.rocketIcon})
    }
  };
  divIcon = L.divIcon({
    className: 'marker',
    html: '<div class="map-marker flash-marker"></div>',
    // Set marker width and height
    iconSize: [22, 22]
  });
  icon = L.icon({
    iconUrl: 'assets/images/rocket_icon.png',
    iconSize: new Point(40, 40)
  });

  constructor(private http: HttpClient) {

  }

  onMapReady(map: LeafletMap) {
    this.map = map;
    const mapBounds = new L.LatLngBounds(
      [90, 180],
      [-90, -180]);
    map.setMaxBounds(mapBounds);
    for (const layer in this.layersControl.baseLayers) {
      if (layer in this.layersControl.baseLayers) {
        this.layersControl.baseLayers[layer].bounds = mapBounds;
      }
    }
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);
    L.control.layers(this.layersControl.baseLayers, this.layersControl.overlays, {position: 'bottomright'}).addTo(map);
    // (L.control as any).timeDimension().addTo(map);
    const timelineControl = L.timelineSliderControl({
      formatOutput: function (date) {
        return moment(date).format('MMMM, DD, YYYY');
      },
      steps: 10000
    });

    this.http.get(this.query).subscribe(
      (data: any) => {
        console.log(data);
        this.launches = data;
        this.launchesGeoJsonLayer = new L.timeline(data, {
          pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {icon: this.divIcon});
          },
          onEachFeature: (feature, layer) => {
            // add popup with info
            layer.bindPopup(`<h2>${(feature.properties as any).mission}</h2>`);
          },
          getInterval: (feature) => {
            return {
              start: moment(feature.properties.time).unix(),
              end: moment(feature.properties.time).unix() + 2000000
            };
          }
        });
        timelineControl.addTo(map);
        timelineControl.addTimelines(this.launchesGeoJsonLayer);
        this.launchesGeoJsonLayer.addTo(map);
        console.log(timelineControl);
        console.log(this.launchesGeoJsonLayer);
        // const timeDimension = L.timeDimension.layer.geoJson(this.launchesGeoJsonLayer, {duration: 'P3W'});
        // timeDimension.addTo(markerCluster);
        // (new L.TimeDimension.Player({}, timeDimension)).addTo(map);
      });
  }

  // markerClusterReady(markerCluster: L.LayerGroup) {
  //   this.markerCluster = markerCluster;
  //   this.http.get(this.query).subscribe(
  //     (data: any) => {
  //       console.log(data);
  //       this.launches = data;
  //       this.launchesGeoJsonLayer = new L.GeoJSON(data, {
  //         pointToLayer: (feature, latlng) => {
  //           return L.marker(latlng, {icon: this.icon});
  //         },
  //         onEachFeature: (feature, layer) => {
  //           // add popup with info
  //           layer.bindPopup(`<h2>${(feature.properties as any).mission}</h2>`);
  //         }
  //       });
  //       // timelineControl.addTimelines(this.launchesGeoJsonLayer);
  //       // this.launchesGeoJsonLayer.addTo(map);
  //       this.timeDimension = L.timeDimension.layer.geoJson(this.launchesGeoJsonLayer, {duration: 'P2W'});
  //       markerCluster.addLayer(this.timeDimension);
  //       // this.timeDimension.on('timeload', () => {
  //       //   console.log('event!');
  //       // });
  //       // timeDimension.addTo(markerCluster);
  //       // (new L.TimeDimension.Player({}, timeDimension)).addTo(map);
  //     });
  // }
}
