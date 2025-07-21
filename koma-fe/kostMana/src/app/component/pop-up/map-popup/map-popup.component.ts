import { Component, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';

@Component({
  selector: 'app-map-popup',
  standalone: false,

  templateUrl: './map-popup.component.html',
  styleUrl: './map-popup.component.css'
})
export class MapPopupComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number; address?: string }>();

  private map!: Map;
  private vectorSource = new VectorSource();
  public searchQuery = '';
  public coordinates: { lat: number; lng: number; address?: string } | null = null;

  lat : any = '';
  lng : any = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getCurrLocation();
    }
  }

  getCurrLocation(){
    if (isPlatformBrowser(this.platformId) && navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: any) =>{
        console.log(position);
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.initializeMap();
        this.setLocation(this.lat, this.lng)
      })
    }
  }

  private initializeMap(): void {
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          source: this.vectorSource
        })
      ],
      view: new View({
        center: fromLonLat([this.lng, this.lat]),
        zoom: 18
      })
    });

    this.map.on('click', (evt) => {
      const coordinate = evt.coordinate;
      const lonLat = toLonLat(coordinate);
      this.setLocation(lonLat[1], lonLat[0]);
    });
  }

  public async searchLocation(): Promise<void> {
    if (!this.searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`
      );

      const results = await response.json();

      if (results.length > 0) {
        const firstResult = results[0];
        this.setLocation(
          parseFloat(firstResult.lat),
          parseFloat(firstResult.lon),
          firstResult.display_name
        );

        this.map.getView().animate({
          center: fromLonLat([firstResult.lon, firstResult.lat]),
          zoom: 14
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  private setLocation(lat: number, lng: number, address?: string): void {
    this.coordinates = { lat, lng, address };
    this.updateMarker(fromLonLat([lng, lat]));
    this.locationSelected.emit(this.coordinates);
  }

  private updateMarker(coordinate: number[]): void {
    this.vectorSource.clear();

    const marker = new Feature({
      geometry: new Point(coordinate)
    });

    marker.setStyle(new Style({
      image: new Icon({
        src: '../../../assets/images/map-marker.svg',
        scale: 0.5,
        anchor: [0.5, 1]
      })
    }));

    this.vectorSource.addFeature(marker);
  }
}
