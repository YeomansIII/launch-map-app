/* SystemJS module definition */
declare var module: NodeModule;

interface NodeModule {
  id: string;
}

import * as L from 'leaflet';

declare module 'leaflet' {
  let timeDimension: any;
  let TimeDimension: any;
  let Timeline: any;
  let timeline: any;
  let timelineSliderControl: any;
  let markerClusterGroup: any;

  // abstract function timeDimension();
}
