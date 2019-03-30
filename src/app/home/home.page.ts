import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Locations } from './model/locations.model';
import { HttpResponse } from '@angular/common/http';
import { TrackingService } from './tracking.service';
import { UserLocation } from './model/user-location.model';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  ILatLng,
  Marker,
  BaseArrayClass,
  MyLocation
} from '@ionic-native/google-maps';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  map: GoogleMap;
  responseWithLocations: HttpResponse<Locations>;
  myLocation: MyLocation;
  markers: Marker[] = [];


  constructor (private platform: Platform,
               private trackingService: TrackingService) {
  }

  async synchroniseLocations() {
    this.myLocation = await this.map.getMyLocation();
    console.log(JSON.stringify(this.myLocation, null, 2));
    const myUserLocation = new UserLocation(environment.userId, environment.userGroup,
        this.myLocation.latLng.lng.toString(), this.myLocation.latLng.lat.toString());
    this.responseWithLocations = await this.trackingService.updateMyLocation(myUserLocation).toPromise();
    console.log('responseWithLocations', this.responseWithLocations);
    await this.loadMap();
  }

  async ngOnInit () {
    await this.platform.ready();
    this.map = GoogleMaps.create('map_canvas', {
    });
    this.synchroniseLocations();
  }

  loadMap () {
    let points: BaseArrayClass<any> = new BaseArrayClass<any>([]);

    this.responseWithLocations.body.locations.forEach(userLocation => {
      points.push({
        position: {lat: userLocation.latitude, lng: userLocation.longitude},
        title: userLocation.userId,
        iconData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAACVUlEQVRIS8WWjVXCMBRGwwTqBMIEuAG4ARuIE6gTK' +
            'BOgEyAT4AbABjKBMIE/C+h3m6S2pWlJ8BzfOTkpad6770teEzom3bZy/VbrpYTopDjJZ6w2c77X6p9j46SCUXvuYDxHq04BZ2rPHXa3y/DRqlPAmdqZW+h' +
            'rkMZEq44F52q3oGTdrjEpqmPBudoxKVBVKqsU1THgPbW+klNUt4GHCn6idqEGuMveerUeXFGtNTCvah9qaz+n2gMmKMGBnLrfjPFcMirZ7231XUF19RUJk' +
            'IhPZqXnT8AM9Osy62v0VPihUqIfjWwx1RkJvbxIpjArhabfbEJ6zQYwysiiT3CW8kJ6Q4BgqMALEnqVNAqQZGSkM/R7nMOBLhZ/B/ZQeg9V/1EsrpLy5d' +
            'IqP8aAXV6WlQIlZrWq/wzeBK0DM3Y0vA0aAh8FPwTaBC7B2W8+qUOMT4l9dYUUrJK2k4tCOHl7O7zK+Xx69nbWU/iebgKz1+9E+OYPToR1fqOe+Squuje' +
            'BWdzlYGBPohhjW9b2lGbRa72bwLdyml5d2auvaPyeTOzIw4MxzCkal8h8no3cqT3WJd0ExuFmOjXmlhRIXbnfKZQ7hfJ4HDTM8wVIMi6xJ01y3mV8E5gl' +
            'GlDRGIEKS75DrAtFn/0DA3x/b0ddZbPgGt23JnBW0agpKPzUGCvhoT4iv1HG9Zodtc6HGBTYnoXAXc3UR5SbBwK1d8y+8RUAzxNwU2orOwQeyolF/lLT' +
            '7mUqQ8BqCj4Bt+j1lR0Cs3Sopt8GFLYNF/2JU7K2k6stePL7fwP/AER2xy+mY1/QAAAAAElFTkSuQmCC'
      });
    });

    let bounds: ILatLng[] = points.map((data: any, idx: number) => {
      return data.position;
    });
    this.clearMarkers();
    points.forEach((data: any) => {
      data.disableAutoPan = true;
      let marker: Marker = this.map.addMarkerSync(data);
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(this.onMarkerClick);
      marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(this.onMarkerClick);
      this.markers.push(marker);
    });
    this.moveToPosition(bounds);
  }

  clearMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setVisible(false);
      this.markers[i].destroy();
    }
    this.markers = [];
  }

  async moveToPosition (bounds: ILatLng[]) {
    await this.map.animateCamera({
      target: bounds
    });
  }

  onMarkerClick (params: any) {
    let marker: Marker = <Marker>params[1];
    let iconData: any = marker.get('iconData');
    marker.setIcon(iconData);
  }
}
