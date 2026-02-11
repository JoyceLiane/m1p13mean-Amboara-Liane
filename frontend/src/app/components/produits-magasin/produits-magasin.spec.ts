import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitsMagasin } from './produits-magasin';

describe('ProduitsMagasin', () => {
  let component: ProduitsMagasin;
  let fixture: ComponentFixture<ProduitsMagasin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitsMagasin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitsMagasin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
