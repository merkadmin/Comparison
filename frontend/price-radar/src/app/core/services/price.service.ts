import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PriceListing } from '../models/price-listing.model';
import { PriceHistory } from '../models/price-history.model';

@Injectable({ providedIn: 'root' })
export class PriceService {
  private api = inject(ApiService);

  getListingsByProduct(productId: string): Observable<PriceListing[]> {
    return this.api.get<PriceListing[]>(`/pricelistings/product/${productId}`).pipe(
      map(listings => {
        const min = Math.min(...listings.map(l => l.price));
        return listings.map(l => ({ ...l, isBestDeal: l.price === min }));
      })
    );
  }

  getPriceHistory(productId: string, storeId: string): Observable<PriceHistory[]> {
    return this.api.get<PriceHistory[]>(
      `/pricehistory?productId=${productId}&storeId=${storeId}`
    );
  }

  createListing(listing: PriceListing): Observable<PriceListing> {
    return this.api.post<PriceListing>('/pricelistings', listing);
  }
}
