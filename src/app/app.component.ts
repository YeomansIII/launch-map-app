import {Component, ViewEncapsulation} from '@angular/core';
import {circle, latLng, polygon, tileLayer, Map as LeafletMap, point, marker} from 'leaflet';

declare const L: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'app';
  // mapBounds = new L.LatLngBounds(
  //   [0, 4352],
  //   [2048, 0]);
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
    center: latLng(20, 0)
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

  onMapReady(map: LeafletMap) {
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
  }
}
