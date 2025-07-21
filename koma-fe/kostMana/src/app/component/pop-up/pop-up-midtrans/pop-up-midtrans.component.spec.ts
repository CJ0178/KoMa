import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpMidtransComponent } from './pop-up-midtrans.component';

describe('PopUpMidtransComponent', () => {
  let component: PopUpMidtransComponent;
  let fixture: ComponentFixture<PopUpMidtransComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopUpMidtransComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpMidtransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
