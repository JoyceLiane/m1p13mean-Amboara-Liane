import { TestBed } from '@angular/core/testing';

import { Produits } from './produits';

describe('Produits', () => {
  let service: Produits;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Produits);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
