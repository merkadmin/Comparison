import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { SelectOption } from '../../shared/components/common-select/common-select.component';
import { Subscription, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ItemService } from '../../core/services/item.service';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemImageService } from '../../core/services/item-image.service';
import { ProductItemTypeService } from '../../core/services/product-item-type.service';
import { ProductInformationService } from '../../core/services/product-information.service';
import { FavoriteProductItemService } from '../../core/services/favorite-product-item.service';
import { CartItemService } from '../../core/services/cart-item.service';
import { Item } from '../../core/models/item.model';
import { ItemCategory, LocalizedString } from '../../core/models/item-category.model';
import { ItemBrand } from '../../core/models/item-brand.model';
import { ProductItemType } from '../../core/models/product-item-type.model';
import { ProductInformation } from '../../core/models/product-information.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonViewModeComponent } from '../../shared/components/commonActions/common-view-mode/common-view-mode';
import { CommonDropDownMenuActionButton, ActionMenuItem } from '../../shared/components/commonActions/common-drop-down-menu-action-button/common-drop-down-menu-action-button';
import { CommonImageUploadButton } from '../../shared/components/commonActions/common-image-upload-button/common-image-upload-button';
import { CommonGridColumnsButton, GridColumns } from '../../shared/components/commonActions/common-grid-columns-button/common-grid-columns-button';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CommonSelectComponent, CommonViewModeComponent, CommonDropDownMenuActionButton, CommonImageUploadButton, CommonGridColumnsButton],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.less',
})
export class ItemListComponent implements OnInit, OnDestroy {
  auth                    = inject(AuthService);
  private itemService     = inject(ItemService);
  private categoryService = inject(ItemCategoryService);
  private brandService    = inject(ItemBrandService);
  private imageService    = inject(ItemImageService);
  private typeService     = inject(ProductItemTypeService);
  private infoService     = inject(ProductInformationService);
  private favoriteService = inject(FavoriteProductItemService);
  private cartService     = inject(CartItemService);
  private translate       = inject(TranslateService);
  private route           = inject(ActivatedRoute);

  editingId       = signal<number | null>(null);
  editDraft: Item = { name: '', brandId: 0, itemCategoryId: 0, images: [], prices: [], customerReviews: [], customerCommentIds: [] };
  uploadingImages = signal(false);

  productItemTypes   = signal<ProductItemType[]>([]);
  productInfos       = signal<ProductInformation[]>([]);
  favoriteIds        = signal<Set<number>>(new Set());
  cartIds            = signal<Set<number>>(new Set());
  compareIds         = signal<Set<number>>(new Set());

  openEdit(item: Item): void {
    this.editDraft = {
      ...item,
      images:             [...(item.images ?? [])],
      prices:             (item.prices ?? []).map(p => ({ ...p })),
      customerReviews:    [...(item.customerReviews ?? [])],
      customerCommentIds: [...(item.customerCommentIds ?? [])],
    };
    this.editingId.set(item.id!);
  }

  closeEdit(): void { this.editingId.set(null); }

  saveEdit(): void {
    const id = this.editingId();
    if (id === null) return;
    this.itemService.update(id, this.editDraft).subscribe({
      next: () => { this.loadItems(); this.closeEdit(); }
    });
  }

  addPrice(): void {
    this.editDraft.prices = [...(this.editDraft.prices ?? []), { storeId: 0, price: 0 }];
  }

  removePrice(index: number): void {
    this.editDraft.prices = (this.editDraft.prices ?? []).filter((_, i) => i !== index);
  }

  /** Resolve a stored relative path to a full URL for display. */
  imgUrl(path: string): string { return this.imageService.resolveUrl(path); }

  onImageFilesSelected(event: Event): void {
    const id = this.editingId();
    if (id === null) return;
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length) return;

    this.uploadingImages.set(true);
    this.imageService.upload(id, this.editDraft.itemCategoryId, files).subscribe({
      next: (paths) => {
        this.editDraft.images = [...(this.editDraft.images ?? []), ...paths];
        this.uploadingImages.set(false);
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.uploadingImages.set(false);
        (event.target as HTMLInputElement).value = '';
      }
    });
  }

  onImagesUploaded(itemId: number, newPaths: string[]): void {
    const item = this.items().find(i => i.id === itemId);
    if (!item) return;
    const updated = { ...item, images: [...(item.images ?? []), ...newPaths] };
    this.itemService.update(itemId, updated).subscribe({
      next: () => this.items.update(list => list.map(i => i.id === itemId ? updated : i))
    });
  }

  removeImage(index: number): void {
    const id   = this.editingId();
    const path = this.editDraft.images?.[index];
    if (!path) return;

    if (id !== null) {
      this.imageService.delete(id, path).subscribe({ error: () => {} });
    }
    this.editDraft.images = (this.editDraft.images ?? []).filter((_, i) => i !== index);
  }

  localize(ls: LocalizedString): string {
    const lang = this.translate.currentLang();
    return ls[lang] || ls.en;
  }

  isFavorite(id: number): boolean { return this.favoriteIds().has(id); }
  inCart(id: number): boolean     { return this.cartIds().has(id); }
  inCompare(id: number): boolean  { return this.compareIds().has(id); }

  toggleFavorite(id: number): void {
    if (this.isFavorite(id)) {
      this.favoriteService.remove(id).subscribe({ error: () => {} });
      this.favoriteIds.update(s => { const n = new Set(s); n.delete(id); return n; });
    } else {
      this.favoriteService.add(id).subscribe({ error: () => {} });
      this.favoriteIds.update(s => new Set(s).add(id));
    }
  }

  toggleCart(id: number): void {
    if (this.inCart(id)) {
      this.cartService.remove(id).subscribe({ error: () => {} });
      this.cartIds.update(s => { const n = new Set(s); n.delete(id); return n; });
    } else {
      this.cartService.add(id).subscribe({ error: () => {} });
      this.cartIds.update(s => new Set(s).add(id));
    }
  }

  toggleCompare(id: number): void {
    this.compareIds.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  getTypeName(typeId: number | null | undefined): string {
    if (!typeId) return '—';
    return this.productItemTypes().find(t => t.id === typeId)?.type ?? String(typeId);
  }

  items       = signal<Item[]>([]);
  categories  = signal<ItemCategory[]>([]);
  brands      = signal<ItemBrand[]>([]);
  loading     = signal(false);
  error       = signal<string | null>(null);
  selectedCategoryId = signal<number | null>(null);
  selectedBrandId    = signal<number | null>(null);
  searchQuery        = signal('');
  importing          = signal(false);
  importError        = signal<string | null>(null);
  importSuccess      = signal(false);
  selectedIds        = signal<Set<number>>(new Set());
  viewMode           = signal<'list' | 'cards'>('cards');
  colsPerRow         = signal<GridColumns>(5);
  colClass           = computed(() => ({
    1: 'col-12',
    2: 'col-6',
    3: 'col-4',
    4: 'col-3',
    5: 'col-grid-5',
    6: 'col-2',
  })[this.colsPerRow()]);
  private querySub!: Subscription;

  importMenuItems: ActionMenuItem[] = [
    { labelKey: 'common.exportTemplate', iconClass: 'ki-file-down', iconPaths: 2, action: () => this.exportTemplate() }
  ];

  allSelectedInactive = computed<boolean>(() => {
    const ids = this.selectedIds();
    if (ids.size === 0) return false;
    return this.items().filter(i => ids.has(i.id!)).every(i => i.isActive === false);
  });

  bulkMenuItems: ActionMenuItem[] = [
    { labelKey: 'item.deleteSelected', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.deleteSelected() }
  ];

  getRowMenuItems(id: number): ActionMenuItem[] {
    return [
      { labelKey: 'common.delete', iconClass: 'ki-trash', iconPaths: 5, color: 'danger', action: () => this.delete(id) }
    ];
  }

  categoryOptions = computed<SelectOption[]>(() =>
    this.categories().map(c => ({ value: c.id, label: this.localize(c.name) }))
  );
  brandOptions = computed<SelectOption[]>(() =>
    this.brands().map(b => ({ value: b.id, label: b.name }))
  );
  private categoryMap = computed<Map<number, ItemCategory>>(() =>
    new Map(this.categories().map(c => [c.id!, c]))
  );
  private brandMap = computed<Map<number, ItemBrand>>(() =>
    new Map(this.brands().map(b => [b.id!, b]))
  );
  filteredItems = computed<Item[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return q ? this.items().filter(i => i.name.toLowerCase().includes(q)) : this.items();
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: c => this.categories.set(c), error: () => {} });
    this.brandService.getAll().subscribe({ next: b => this.brands.set(b), error: () => {} });
    this.typeService.getAll().subscribe({ next: t => this.productItemTypes.set(t), error: () => {} });
    this.infoService.getAll().subscribe({ next: i => this.productInfos.set(i), error: () => {} });
    this.favoriteService.getMyFavorites().subscribe({ next: f => this.favoriteIds.set(new Set(f.map(x => x.productItemId))), error: () => {} });
    this.cartService.getMyCart().subscribe({ next: c => this.cartIds.set(new Set(c.map(x => x.productItemId))), error: () => {} });

    this.querySub = this.route.queryParamMap.subscribe(params => {
      const categoryId = params.get('categoryId');
      this.selectedCategoryId.set(categoryId ? +categoryId : null);
      this.selectedBrandId.set(null);
      this.loadItems();
    });
  }

  ngOnDestroy(): void { this.querySub.unsubscribe(); }

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.selectedCategoryId() !== null
      ? this.itemService.getByCategory(this.selectedCategoryId()!)
      : this.selectedBrandId() !== null
        ? this.itemService.getByBrand(this.selectedBrandId()!)
        : this.itemService.getAll();

    obs.subscribe({
      next: data => {
        this.loading.set(false);
        // Parallel-fetch images from file storage and merge into each item
        const imageRequests = data.map(item =>
          item.images?.length ? of(item.images) : this.imageService.getImages(item.id!)
        );
        forkJoin(imageRequests.length ? imageRequests : [of([])]).subscribe({
          next: results => {
            this.items.set(data.map((item, i) => ({ ...item, images: results[i] })));
          },
          error: () => { this.items.set(data); }  // fall back to DB data if file server is down
        });
      },
      error: () => { this.error.set('Failed to load items.'); this.loading.set(false); }
    });
  }

  resetFilters(): void {
    this.selectedCategoryId.set(null);
    this.selectedBrandId.set(null);
    this.loadItems();
  }

  getBrandName(brandId: number): string {
    return this.brandMap().get(+brandId)?.name ?? String(brandId);
  }

  getCategoryName(id: number): string {
    const cat = this.categoryMap().get(+id);
    return cat ? this.localize(cat.name) : String(id);
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }
  isAllSelected(): boolean {
    const all = this.filteredItems();
    return all.length > 0 && all.every(i => this.selectedIds().has(i.id!));
  }
  toggleOne(id: number): void {
    const s = new Set(this.selectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedIds.set(s);
  }
  toggleAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.filteredItems().map(i => i.id!))
    );
  }

  delete(id: number): void {
    if (!confirm('Delete this item?')) return;
    this.itemService.delete(id).subscribe({
      next: () => {
        this.imageService.deleteAll(id).subscribe({ error: () => {} });
        const s = new Set(this.selectedIds()); s.delete(id); this.selectedIds.set(s);
        this.loadItems();
      }
    });
  }

  setActive(id: number, isActive: boolean): void {
    this.itemService.setActive(id, isActive).subscribe({
      next: () => this.items.update(list => list.map(i => i.id === id ? { ...i, isActive } : i))
    });
  }

  deleteSelected(): void {
    const ids = [...this.selectedIds()];
    const text = this.translate.translate('item.deleteBulkText').replace('{count}', String(ids.length));
    Swal.fire({
      title: this.translate.translate('item.deleteBulkConfirm'),
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f1416c',
      confirmButtonText: this.translate.translate('common.delete'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.itemService.deleteMany(ids).subscribe({
        next: () => {
          ids.forEach(id => this.imageService.deleteAll(id).subscribe({ error: () => {} }));
          this.selectedIds.set(new Set());
          this.loadItems();
        }
      });
    });
  }

  activateSelected(): void {
    const ids = [...this.selectedIds()];
    this.itemService.setActiveMany(ids, true).subscribe({
      next: () => {
        this.items.update(list => list.map(i => ids.includes(i.id!) ? { ...i, isActive: true } : i));
        this.selectedIds.set(new Set());
      }
    });
  }

  deactivateSelected(): void {
    const ids = [...this.selectedIds()];
    Swal.fire({
      title: this.translate.translate('item.deactivateBulkConfirm'),
      text: this.translate.translate('item.deactivateBulkText').replace('{count}', String(ids.length)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      confirmButtonText: this.translate.translate('common.deactivate'),
      cancelButtonText: this.translate.translate('common.cancel'),
    }).then(result => {
      if (!result.isConfirmed) return;
      this.itemService.setActiveMany(ids, false).subscribe({
        next: () => {
          this.items.update(list => list.map(i => ids.includes(i.id!) ? { ...i, isActive: false } : i));
          this.selectedIds.set(new Set());
        }
      });
    });
  }

  exportTemplate(): void {
    this.itemService.exportTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'items-template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importing.set(true);
    this.importError.set(null);
    this.importSuccess.set(false);
    this.itemService.importExcel(file).subscribe({
      next: () => {
        this.importing.set(false);
        this.importSuccess.set(true);
        this.loadItems();
        (event.target as HTMLInputElement).value = '';
      },
      error: () => {
        this.importing.set(false);
        this.importError.set(this.translate.translate('item.importError'));
        (event.target as HTMLInputElement).value = '';
      }
    });
  }
}
