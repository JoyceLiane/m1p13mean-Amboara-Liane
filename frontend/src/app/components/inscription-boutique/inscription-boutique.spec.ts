import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionBoutique } from './inscription-boutique';

describe('InscriptionBoutique', () => {
  let component: InscriptionBoutique;
  let fixture: ComponentFixture<InscriptionBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
