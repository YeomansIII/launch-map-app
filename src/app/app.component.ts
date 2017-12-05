import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {circle, latLng, polygon, tileLayer, Map as LeafletMap, point, marker, PointExpression, Point} from 'leaflet';
import {HttpClient} from '@angular/common/http';

import * as L from 'leaflet';
import * as moment from 'moment';
import 'leaflet.timeline';
import '../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js';
import '../../node_modules/leaflet.markercluster.freezable/dist/leaflet.markercluster.freezable.js';
import '../../node_modules/leaflet.timeline/dist/leaflet.timeline.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'app';
  map: LeafletMap;
  markerCluster: any;
  timelineControl: any;
  launches: any;
  launchesSearch: any;
  timelineGeoJson: any;
  timelineMode: boolean;
  query = 'https://yeomansiii.carto.com:443/api/v2/sql?format=GeoJSON&q=select * from public.launches';
  orbits = {
    'EEO/M': 0,
    'FTO': 0,
    'FSO': 0,
    'GTO': 0,
    'GTO+': 0,
    'GTO-': 0,
    'GEO': 0,
    'HCO': 0,
    'HTO': 0,
    'LEO': 0,
    'LEO/S': 0,
    'LEO/P': 0,
    'MEO': 0,
    'MTO': 0
  };
  timelineSlider = {
    disabled: false,
    invert: false,
    max: 0,
    min: 1,
    step: 86400,
    thumbLabel: true,
    tickInterval: 2628000 / 86400,
    value: 0,
    displayValue: 'hello'
  };

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
    html: '<div class="map-marker"></div>',
    // Set marker width and height
    iconSize: [22, 22]
  });
  icon = L.icon({
    iconUrl: 'assets/images/rocket_icon.png',
    iconSize: new Point(40, 40)
  });

  constructor(private http: HttpClient,
              private changeDetectorRef: ChangeDetectorRef) {
    const app = this;
    L.Timeline.prototype.addLayer = (layer) => {
      // this.orbits[layer.feature.properties.orbit.replace(/\(|\)/g, '')]++;
      const icon = L.divIcon({
        className: 'new-marker',
        html: '<div class="map-marker flash-marker"></div>',
        // Set marker width and height
        iconSize: [22, 22]
      });
      // layer._icon = icon;
      this.markerCluster.addLayer(layer);
      layer.setIcon(icon);
      setTimeout(() => {
        layer.setIcon(this.divIcon);
      }, 1000);
      // layer._icon.classList.push('flash-marker');
    };
    L.Timeline.prototype.removeLayer = (layer) => {
      // this.orbits[layer.feature.properties.orbit.replace(/\(|\)/g, '')]--;
      this.markerCluster.removeLayer(layer);
    };
    L.Timeline.prototype.updateDisplayedLayers = function () {
      /**
       * Update the layer to show only the features that are relevant at the current
       * time. Usually shouldn't need to be called manually, unless you set
       * `drawOnSetTime` to `false`.
       */
        // This loop is intended to help optimize things a bit. First, we find all
        // the features that should be displayed at the current time.
      const features = this.ranges.lookup(this.time);
      app.calcOrbits(this.ranges.overlap(0, this.time));
      // Then we try to match each currently displayed layer up to a feature. If
      // we find a match, then we remove it from the feature list. If we don't
      // find a match, then the displayed layer is no longer valid at this time.
      // We should remove it.
      for (let i = 0; i < app.markerCluster.getLayers().length; i++) {
        let found = false;
        const layer = app.markerCluster.getLayers()[i];
        for (let j = 0; j < features.length; j++) {
          if (layer.feature === features[j]) {
            found = true;
            features.splice(j, 1);
            break;
          }
        }
        if (!found) {
          console.log('not found');
          const toRemove = app.markerCluster.getLayers()[i--];
          this.removeLayer(toRemove);
        }
      }
      // Finally, with any features left, they must be new data! We can add them.
      features.forEach(feature => {
        (this as any).addData(feature);
      });
    };
  }

  ngOnInit() {
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
    // (L.control as any).timeDimension().addTo(map);
    this.timelineControl = L.timelineSliderControl({
      formatOutput: function (date) {
        return moment.unix(date).format('MMMM DD, YYYY');
      },
      steps: 15000
    });
    this.http.get(this.query).subscribe(
      (data: any) => {
        this.launches = data;
        this.timelineControl.addTo(map);
        this.showTimeline();
      });
    // this.markerCluster.freezeAtZoom(1);
  }

  calcOrbits(features: any) {
    for (const orbit in this.orbits) {
      if (orbit in this.orbits) {
        this.orbits[orbit] = 0;
      }
    }
    for (const feature of features) {
      this.orbits[feature.properties.orbit.replace(/\(|\)/g, '')]++;
    }
  }

  slideTimeline(event) {
    if (!this.timelineMode) {
      this.showTimeline();
    }
    this.timelineControl.setTime(event.value)
  }

  toggleTimeline() {
    if (this.timelineMode) {
      this.showAll();
    } else {
      this.showTimeline();
    }
  }

  showTimeline() {
    this.timelineMode = true;
    if (this.markerCluster) {
      this.map.removeLayer(this.markerCluster);
    }
    this.markerCluster = L.markerClusterGroup({
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 1
    });
    this.timelineGeoJson = new L.timeline(this.launches, {
      pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {icon: this.divIcon});
        // this.markerCluster.addLayer(marker2);
        // return this.markerCluster;
      },
      onEachFeature: this.onEachFeature,
      getInterval: (feature) => {
        return {
          start: moment(feature.properties.time).unix(),
          end: moment(feature.properties.time).unix() + 604800
        };
      }
    });

    this.timelineControl.addTimelines(this.timelineGeoJson);
    this.timelineGeoJson.on('change', (e) => {
      this.timelineSlider.value = e.target.time;
      this.changeDetectorRef.detectChanges();
    });
    this.timelineSlider.max = this.timelineGeoJson.end;
    this.timelineSlider.min = this.timelineGeoJson.start;
    this.timelineGeoJson.addTo(this.markerCluster);
    this.map.addLayer(this.markerCluster);
  }

  showAll(dataset?) {
    this.timelineControl.pause();
    this.timelineControl.setTime(this.timelineGeoJson.end);
    this.timelineMode = false;
    this.map.removeLayer(this.markerCluster);
    this.markerCluster = L.markerClusterGroup();
    this.markerCluster.addLayer(new L.GeoJSON(dataset ? dataset : this.launches, {
      pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {icon: this.divIcon});
        // this.markerCluster.addLayer(marker2);
        // return this.markerCluster;
      },
      onEachFeature: this.onEachFeature
    }));
    this.markerCluster.addTo(this.map);
    this.calcOrbits((dataset ? dataset : this.launches).features);
  }

  vehicleSearch(s: string) {
    this.http.get(`${this.query} where lower(vehicle) like lower('%25${s}%25')`).subscribe(
      (data: any) => {
        this.launchesSearch = data;
        this.showAll(this.launchesSearch);
      });
  }

  onEachFeature(feature: any, layer) {
    layer.bindPopup(`<h2>${feature.properties.mission}</h2>
                                  <ul>
                                    <li>Date: ${moment(feature.properties.time).format('MMMM DD, YYYY')}</li>
                                    <li>Vehicle: ${feature.properties.vehicle}</li>
                                    <li>Launch Site: ${feature.properties.site} ${feature.properties.pad}</li>
                                    <li>ID: ${feature.properties.id}</li>
                                    <li>Orbit: ${feature.properties.orbit}</li>
                                  </ul>`);
  }
}
