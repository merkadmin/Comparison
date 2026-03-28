import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { IItemCategory } from '../../core/models/interfaces/IItemCategory';
import { ItemBrand } from '../../core/models/item-brand.model';
import { ProductItemVariant, VariantType } from '../../core/models/product-item-variant.model';
import { ProductItemVariantMap } from '../../core/models/product-item-variant-map.model';
import { ItemBrandService } from '../../core/services/item-brand.service';
import { ItemCategoryService } from '../../core/services/item-category.service';
import { ProductItemVariantService } from '../../core/services/product-item-variant.service';
import { ProductItemVariantMapService } from '../../core/services/product-item-variant-map.service';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.less',
})
export class DashboardComponent implements OnInit {
  private router     = inject(Router);
  private brandSvc   = inject(ItemBrandService);
  private catSvc     = inject(ItemCategoryService);
  private variantSvc = inject(ProductItemVariantService);
  private mapSvc     = inject(ProductItemVariantMapService);
  translate          = inject(TranslateService);

  // ── Data ──────────────────────────────────────────────────────────────────
  brands         = signal<ItemBrand[]>([]);
  allCategories  = signal<IItemCategory[]>([]);
  allVariants    = signal<ProductItemVariant[]>([]);
  variantMaps    = signal<ProductItemVariantMap[]>([]);

  loading = signal(true);
  catSearch   = signal('');
  brandSearch = signal('');

  // ── Derived ───────────────────────────────────────────────────────────────

  /** Leaf categories: those that have no children. */
  leafCategories = computed<IItemCategory[]>(() => {
    const all = this.allCategories();
    const parentIds = new Set(all.map(c => c.parentCategoryId).filter(Boolean));
    return all.filter(c => !parentIds.has(c.id));
  });

  filteredLeafCategories = computed<IItemCategory[]>(() => {
    const q = this.catSearch().trim().toLowerCase();
    return q ? this.leafCategories().filter(c => this.localize(c).toLowerCase().includes(q)) : this.leafCategories();
  });

  filteredBrands = computed<ItemBrand[]>(() => {
    const q = this.brandSearch().trim().toLowerCase();
    return q ? this.brands().filter(b => b.name.toLowerCase().includes(q)) : this.brands();
  });

  /** Variant types that are actually used in active maps. */
  usedVariantTypes = computed<VariantType[]>(() => {
    const usedIds = new Set(
      this.variantMaps()
        .filter(m => m.isActive !== false)
        .flatMap(m => m.variants.map(e => e.variantId))
    );
    const types = new Set<VariantType>();
    for (const v of this.allVariants()) {
      if (v.isActive !== false && usedIds.has(v.id!)) types.add(v.variantTypeId);
    }
    return [...types];
  });

  /** Individual active variants used in active maps (for the Specs chips row). */
  usedVariants = computed<ProductItemVariant[]>(() => {
    const usedIds = new Set(
      this.variantMaps()
        .filter(m => m.isActive !== false)
        .flatMap(m => m.variants.map(e => e.variantId))
    );
    return this.allVariants().filter(v => v.isActive !== false && usedIds.has(v.id!));
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  localize(cat: IItemCategory): string {
    const lang = this.translate.currentLang();
    return cat.name[lang] || cat.name['en'];
  }

  brandImgUrl(brand: ItemBrand): string | null {
    if (brand.brandImage) return this.brandSvc.resolveImageUrl(brand.brandImage);
    return brand.logoUrl ?? null;
  }

  catImgUrl(cat: IItemCategory): string | null {
    const all = this.allCategories();
    let cur: IItemCategory | undefined = cat;
    while (cur) {
      if (cur.categoryImage) return this.catSvc.resolveImageUrl(cur.categoryImage);
      cur = all.find(c => c.id === cur!.parentCategoryId);
    }
    return null;
  }

  typeColor(type: VariantType): string {
    const map: Partial<Record<VariantType, string>> = {
      Color:             '#f1416c',
      Size:              '#7239ea',
      Material:          '#17c653',
      Style:             '#f6c000',
      Pattern:           '#e74694',
      Brand:             '#0095e8',
      Model:             '#00b0b9',
      Version:           '#5014d0',
      RamType:           '#3e97ff',
      RamSize:           '#1b84ff',
      HardDiskType:      '#f59e0b',
      HardDiskSize:      '#d97706',
      OperatingSystem:   '#10b981',
      ScreenType:        '#8b5cf6',
      ScreenSize:        '#6d28d9',
      Resolution:        '#ec4899',
      RefreshRate:       '#14b8a6',
      CellularTechnology:'#0ea5e9',
      Other:             '#6b7280',
    };
    return map[type] ?? '#009ef7';
  }

  typeIcon(type: VariantType): string {
    const map: Partial<Record<VariantType, string>> = {
      Color: 'palette', Size: 'size', Material: 'abstract-14',
      Style: 'design-1', Pattern: 'abstract-26', Brand: 'tag',
      Model: 'category', Version: 'code', RamType: 'server',
      RamSize: 'server', HardDiskType: 'drive', HardDiskSize: 'drive',
      OperatingSystem: 'laptop', ScreenType: 'tablet-text-up',
      ScreenSize: 'tablet-text-up', Resolution: 'picture',
      RefreshRate: 'timer', CellularTechnology: 'phone', Other: 'filter-search',
    };
    return map[type] ?? 'filter-search';
  }

  // ── Type picker ───────────────────────────────────────────────────────────

  selectedType      = signal<VariantType | null>(null);
  pickerSelectedIds = signal<Set<number>>(new Set());

  variantsForType = computed<ProductItemVariant[]>(() => {
    const t = this.selectedType();
    if (!t) return [];
    const usedIds = new Set(
      this.variantMaps()
        .filter(m => m.isActive !== false)
        .flatMap(m => m.variants.map(e => e.variantId))
    );
    return this.allVariants().filter(v => v.isActive !== false && v.variantTypeId === t && usedIds.has(v.id!));
  });

  openTypePicker(type: VariantType): void {
    this.selectedType.set(type);
    this.pickerSelectedIds.set(new Set());
  }

  closePicker(): void { this.selectedType.set(null); }

  togglePickerVariant(id: number): void {
    this.pickerSelectedIds.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  isPickerSelected(id: number): boolean { return this.pickerSelectedIds().has(id); }
  clearPickerSelection(): void { this.pickerSelectedIds.set(new Set()); }

  browseWithSelection(): void {
    const ids = [...this.pickerSelectedIds()].join(',');
    this.router.navigate(['/shop-by-specs'], ids ? { queryParams: { ids } } : {});
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goToBrand(brand: ItemBrand): void {
    this.router.navigate(['/shop-by-brand/by-brand', brand.id]);
  }

  goToCategory(cat: IItemCategory): void {
    this.router.navigate(['/shop-by-category/by-category', cat.id]);
  }

  // ── Scroll ────────────────────────────────────────────────────────────────

  scroll(el: HTMLElement, dir: 1 | -1): void {
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    combineLatest([
      this.brandSvc.getAll(),
      this.catSvc.getAll(),
      this.variantSvc.getAll(),
      this.mapSvc.getAll(),
    ]).subscribe({
      next: ([brands, cats, variants, maps]) => {
        this.brands.set(brands.filter(b => b.isActive !== false).sort((a, b) => a.name.localeCompare(b.name)));
        this.allCategories.set(cats.filter(c => c.isActive !== false));
        this.allVariants.set(variants);
        this.variantMaps.set(maps);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }
}
