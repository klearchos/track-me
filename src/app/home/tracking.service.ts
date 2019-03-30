import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Locations } from './model/locations.model';
import { UserLocation } from './model/user-location.model';
import { environment } from '../../environments/environment';

export type EntityResponseType = HttpResponse<Locations>;

@Injectable()
export class TrackingService {

    constructor(private http: HttpClient) { }

    updateMyLocation(req?: UserLocation): Observable<HttpResponse<Locations>> {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'x-api-key': environment.xApiKey
        });
        return this.http.post(environment.apiUrl, req, { observe: 'response', headers: headers });
    }
}
