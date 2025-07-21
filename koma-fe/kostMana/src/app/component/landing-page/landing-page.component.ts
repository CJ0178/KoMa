import { trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyService } from '../../service/property.service';
import { Location } from '@angular/common';
import { AlertService } from '../../service/alert.service';

export interface landingPropertyData{
  id: any;
  name: string;
  type: string;
  price: number;
  propimage: string;
  location: string;
  rating: number;
  total_rater: number;
}

@Component({
  selector: 'app-landing-page',
  standalone: false,

  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  pageStatus : string = 'landing';

  landingProperties : landingPropertyData[] = [];

  searchText: string = '';

  isLoading: boolean = false;

  constructor(
    private route: Router,
    private propertyService: PropertyService,
    private location: Location,
    private alertService: AlertService
  ){
  }

  ngOnInit(){
    this.isLoading = true;
    this.propertyService.getAllProperties().subscribe((response: any) => {
      if (response && response.success && Array.isArray(response.data)) {
        this.landingProperties = response.data.map((p: any) => ({
          id: p.id,
          name: p.property_name,
          type: p.property_type,
          price: p.price, // No price in PropertyDTO, set as needed
          propimage: p.thumbnail_photo_path || '',
          location: p.city || '',
          rating: p.rating, // No rating in PropertyDTO, set as needed
          total_rater: p.total_rater // No total_rater in PropertyDTO, set as needed
        }));
      }
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
    });
  }

  goToJakartaListing(){
    this.pageStatus = 'Jakarta'
  }

  goToTanggerangListing(){
    this.pageStatus = 'Tanggerang'
  }

  Kembali(){
    this.pageStatus = 'landing'
  }

  goToDetails(id: any){
    this.route.navigate(['/property-detail', id]);
  }

  goBack() {
    this.location.back();
  }

  get landingPropertiesJakarta(): landingPropertyData[] {
    return this.landingProperties.filter(p => p.location && p.location.toLowerCase().includes('jakarta')).slice(0, 7);
  }

  get landingPropertiesTangerang(): landingPropertyData[] {
    return this.landingProperties.filter(p => p.location && p.location.toLowerCase().includes('tangerang')).slice(0, 7);
  }

  get uniqueLocations(): string[] {
    const locations = this.landingProperties.map(p => p.location).filter(loc => !!loc);
    return Array.from(new Set(locations));
  }

  getPropertiesByLocation(location: string, searchText?: string): landingPropertyData[] {
    let filtered = this.landingProperties.filter(p => p.location && p.location.toLowerCase() === location.toLowerCase());
    if (searchText && searchText.trim() !== '') {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
        (p.type && p.type.toLowerCase().includes(lowerSearch)) ||
        (p.location && p.location.toLowerCase().includes(lowerSearch))
      );
    }
    return filtered.slice(0, 7);
  }

  goToCityListing(city: string) {
    this.pageStatus = city;
  }
}
