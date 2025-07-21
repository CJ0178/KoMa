import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplainManagementComponent } from './complain-management.component';

describe('ComplainManagementComponent', () => {
  let component: ComplainManagementComponent;
  let fixture: ComponentFixture<ComplainManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComplainManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplainManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
