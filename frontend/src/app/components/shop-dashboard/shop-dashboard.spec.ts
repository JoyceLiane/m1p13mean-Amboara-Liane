import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopDashboard } from './shop-dashboard';

describe('ShopDashboard', () => {
  let component: ShopDashboard;
  let fixture: ComponentFixture<ShopDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
