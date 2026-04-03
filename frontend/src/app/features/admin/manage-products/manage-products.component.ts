import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent, base64ToFile } from 'ngx-image-cropper';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category } from '../../../core/models';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { NotificationService } from '../../../shared/services/notification.service';
import {
  SelectComponent,
  SelectOption,
} from '../../../shared/components/select/select.component';
import { SpinComponent } from '../../../shared/components/spin/spin.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SelectComponent,
    SpinComponent,
    ImageCropperComponent,
  ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({
              opacity: 0,
              transform: 'translateY(24px) scale(0.96)',
              backgroundColor: 'var(--bg-highlight, #2d2d2d)',
              filter: 'blur(2px)'
            }),
            stagger('60ms', [
              animate(
                '420ms cubic-bezier(0.22, 1, 0.36, 1)',
                style({
                  opacity: 1,
                  transform: 'translateY(0) scale(1)',
                  backgroundColor: '*',
                  filter: 'none'
                })
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  template: `
    <main class="admin-main">
      <div class="page-header">
        <h1>Manage Products</h1>
        <button class="btn-add" (click)="openModal()">+ Add Product</button>
      </div>

      <div class="section-card">
        <app-spin
          [spinning]="loading"
          [hasContent]="true"
          tip="Loading products..."
        >
          <div class="table-toolbar">
            <div class="toolbar-row">
              <div class="search-wrap">
                <span class="filter-select-label"
                  ><i class="fas fa-magnifying-glass"></i> Search</span
                >
                <div class="search-field">
                  <i class="fas fa-magnifying-glass search-ico"></i>
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    placeholder="Search by name, category…"
                    class="search-input"
                    autocomplete="off"
                  />
                  <button
                    class="search-clear"
                    *ngIf="searchQuery"
                    (click)="searchQuery = ''"
                    title="Clear"
                  >
                    <i class="fas fa-xmark"></i>
                  </button>
                </div>
              </div>
              <div class="filter-selects">
                <div class="filter-select-item">
                  <span class="filter-select-label"
                    ><i class="fas fa-tag"></i> Category</span
                  >
                  <app-select
                    [(ngModel)]="selectedCategories"
                    [options]="categoryFilterOptions"
                    placeholder="Choose tags..."
                    [multiple]="true"
                    [searchable]="true"
                    [clearable]="true"
                  >
                  </app-select>
                </div>
                <div class="filter-select-item">
                  <span class="filter-select-label"
                    ><i class="fas fa-circle-dot"></i> Status</span
                  >
                  <app-select
                    [(ngModel)]="selectedStatus"
                    [options]="statusFilterOptions"
                    placeholder="All statuses"
                    [multiple]="false"
                    [clearable]="true"
                  >
                  </app-select>
                </div>
              </div>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody [@listAnimation]="pagedProducts.length">
              <tr *ngFor="let product of pagedProducts">
                <td>
                  <img
                    [src]="
                      product.image
                        ? apiUrl + product.image
                        : 'assets/no-image.png'
                    "
                    class="table-img"
                    (error)="$any($event.target).src = 'assets/no-image.png'"
                  />
                </td>
                <td class="product-name">{{ product.name }}</td>
                <td>{{ getCategoryName(product) }}</td>
                <td>\${{ product.price | number: '1.2-2' }}</td>
                <td>
                  <span
                    class="status-badge"
                    [class]="'status-' + product.status"
                    >{{ product.status }}</span
                  >
                </td>
                <td class="actions">
                  <button class="btn-edit" (click)="editProduct(product)">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button
                    class="btn-delete"
                    (click)="deleteProduct(product._id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="pagedProducts.length === 0 && !loading">
                <td colspan="7" class="empty">No products found</td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination-bar" *ngIf="totalItems > 0">
            <span class="pagination-info"
              >Showing {{ showingStart }}–{{ showingEnd }} of
              {{ totalItems }}</span
            >
            <div class="pagination-controls">
              <button
                class="pg-btn"
                (click)="setPage(currentPage - 1)"
                [disabled]="currentPage === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <ng-container *ngFor="let p of pageNumbers">
                <span class="pg-ellipsis" *ngIf="p === null">…</span>
                <button
                  class="pg-btn pg-num"
                  *ngIf="p !== null"
                  [class.pg-active]="p === currentPage"
                  (click)="setPage(+p)"
                >
                  {{ p }}
                </button>
              </ng-container>
              <button
                class="pg-btn"
                (click)="setPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="pagination-size">
              <app-select
                [(ngModel)]="pageSize"
                [options]="pageSizeOptions"
                [clearable]="false"
              ></app-select>
            </div>
          </div>
        </app-spin>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-icon">
                <i
                  [class]="
                    editingProduct ? 'fas fa-pen-to-square' : 'fas fa-plus'
                  "
                ></i>
              </div>
              <div>
                <h2>{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h2>
                <p class="modal-subtitle">
                  {{
                    editingProduct
                      ? 'Update product information below'
                      : 'Fill in the details to add a new product'
                  }}
                </p>
              </div>
            </div>
            <button class="modal-close" (click)="closeModal()">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <!-- Image Upload -->
            <div class="form-section">
              <div class="section-label">
                <i class="fas fa-image"></i> Product Image
              </div>
              <div
                class="img-upload-area"
                (click)="fileInput.click()"
                [class.has-image]="imagePreview"
              >
                <img
                  *ngIf="imagePreview"
                  [src]="imagePreview"
                  class="img-preview"
                  (error)="imagePreview = null"
                />
                <div *ngIf="!imagePreview" class="img-placeholder">
                  <div class="upload-icon">
                    <i class="fas fa-cloud-arrow-up"></i>
                  </div>
                  <p class="upload-text">Click to upload image</p>
                  <p class="upload-sub">JPG, PNG, WEBP — max 5 MB</p>
                </div>
                <div *ngIf="imagePreview" class="img-overlay">
                  <i class="fas fa-camera"></i> Change Image
                </div>
              </div>
              <input
                #fileInput
                type="file"
                accept="image/*"
                style="display:none"
                (change)="onFileChange($event)"
              />

              <!-- Crop Modal -->
              <div class="crop-overlay" *ngIf="showCropModal" (click)="cancelCrop()">
                <div class="crop-modal" (click)="$event.stopPropagation()">
                  <div class="crop-modal-header">
                    <div class="crop-modal-title">
                      <i class="fas fa-crop-alt"></i> Crop Image
                    </div>
                    <button class="crop-close" (click)="cancelCrop()">
                      <i class="fas fa-xmark"></i>
                    </button>
                  </div>
                  <div class="crop-modal-body">
                    <image-cropper
                      [imageChangedEvent]="imageChangedEvent"
                      [maintainAspectRatio]="false"
                      [aspectRatio]="1"
                      format="webp"
                      (imageCropped)="imageCropped($event)"
                      (imageLoaded)="imageLoaded()"
                      (cropperReady)="cropperReady()"
                      (loadImageFailed)="loadImageFailed()"
                      backgroundColor="#1a1a2e"
                    ></image-cropper>
                  </div>
                  <div class="crop-modal-footer">
                    <button class="btn-cancel" type="button" (click)="cancelCrop()">
                      <i class="fas fa-xmark"></i> Cancel
                    </button>
                    <button class="btn-save" type="button" (click)="applyCrop()">
                      <i class="fas fa-check"></i> Apply Crop
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-divider"></div>

            <!-- Download Link -->
            <div class="form-section">
              <div class="section-label">
                <i class="fas fa-link"></i> Download Link
              </div>
              <div class="form-group">
                <label>Google Drive Download Link</label>
                <input
                  type="text"
                  [(ngModel)]="formData.downloadLink"
                  class="form-control"
                  placeholder="https://drive.google.com/..."
                />
                <small class="form-text"
                  >Paste the Google Drive link for this product. Leave blank if
                  not applicable.</small
                >
              </div>
            </div>

            <!-- Product Details -->
            <div class="form-section">
              <div class="section-label">
                <i class="fas fa-circle-info"></i> Product Details
              </div>
              <div class="form-group">
                <label>Name <span class="req">*</span></label>
                <div class="input-wrap">
                  <i class="fas fa-gamepad input-icon"></i>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    class="form-control has-icon"
                    placeholder="e.g. The Witcher 3"
                  />
                </div>
              </div>
              <div class="form-group">
                <label>Description <span class="req">*</span></label>
                <textarea
                  [(ngModel)]="formData.description"
                  class="form-control"
                  rows="3"
                  placeholder="Describe the product..."
                ></textarea>
              </div>
            </div>

            <div class="form-divider"></div>

            <!-- Pricing & Inventory -->
            <div class="form-section">
              <div class="section-label">
                <i class="fas fa-tag"></i> Pricing & Inventory
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Price <span class="req">*</span></label>
                  <div class="input-wrap">
                    <span class="input-prefix">$</span>
                    <input
                      type="number"
                      [(ngModel)]="formData.price"
                      class="form-control has-prefix"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-divider"></div>

            <!-- Classification -->
            <div class="form-section">
              <div class="section-label">
                <i class="fas fa-layer-group"></i> Classification
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Category <span class="req">*</span></label>
                  <app-select
                    [(ngModel)]="formData.category"
                    [options]="categoryOptions"
                    placeholder="Select category"
                    [clearable]="false"
                  ></app-select>
                </div>
                <div class="form-group">
                  <label>Status</label>
                  <app-select
                    [(ngModel)]="formData.status"
                    [options]="statusOptions"
                    [clearable]="false"
                  ></app-select>
                </div>
              </div>

              <!-- Featured Toggle -->
              <div class="featured-row">
                <div class="featured-info">
                  <i class="fas fa-star featured-star"></i>
                  <div>
                    <span class="featured-title">Featured Product</span>
                    <span class="featured-desc"
                      >Show this product in featured sections</span
                    >
                  </div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="formData.featured" />
                  <span class="toggle-track"
                    ><span class="toggle-thumb"></span
                  ></span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">
              <i class="fas fa-xmark"></i> Cancel
            </button>
            <button
              class="btn-save"
              (click)="saveProduct()"
              [disabled]="saving"
            >
              <i
                *ngIf="!saving"
                [class]="editingProduct ? 'fas fa-floppy-disk' : 'fas fa-plus'"
              ></i>
              <span *ngIf="saving" class="spinner"></span>
              {{
                saving
                  ? 'Saving...'
                  : editingProduct
                    ? 'Save Changes'
                    : 'Add Product'
              }}
            </button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
      /* ── Header ── */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        animation: pageIn 0.4s ease both;
      }
      @keyframes pageIn {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .page-header h1 {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-white);
      }
      .btn-add {
        padding: 10px 20px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 4px 12px rgba(79, 110, 247, 0.2);
      }
      .btn-add:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(79, 110, 247, 0.35);
      }

      /* ── Section Card ── */
      .section-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid var(--border);
        overflow-x: auto;
        animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
      }
      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* ── Toolbar ── */
      .table-toolbar {
        margin-bottom: 20px;
      }
      .toolbar-row {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        flex-wrap: wrap;
      }
      .filter-selects {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        flex: 1;
      }
      .filter-select-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 200px;
        flex: 1;
      }
      .filter-select-label {
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 0;
      }
      .filter-select-label i {
        color: var(--accent);
        font-size: 0.7rem;
      }

      /* ── Search ── */
      .search-wrap {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 260px;
        flex: 1.4;
      }
      .search-field {
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-ico {
        position: absolute;
        left: 13px;
        color: var(--text-muted);
        font-size: 0.82rem;
        pointer-events: none;
        z-index: 1;
      }
      .search-input {
        width: 100%;
        padding: 10px 36px;
        border: 1.5px solid var(--border);
        border-radius: 10px;
        outline: none;
        background: var(--bg-secondary);
        color: var(--text-white);
        font-size: 0.9rem;
        font-family: inherit;
        box-sizing: border-box;
        transition:
          border-color 0.22s,
          box-shadow 0.22s,
          background 0.22s;
      }
      .search-input::placeholder {
        color: var(--text-muted);
        opacity: 0.6;
      }
      .search-input:hover {
        border-color: var(--text-muted);
      }
      .search-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-light);
        background: var(--bg-card);
      }
      .search-clear {
        position: absolute;
        right: 10px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: var(--border);
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.72rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background 0.18s,
          color 0.18s;
      }
      .search-clear:hover {
        background: var(--danger-light, rgba(239, 68, 68, 0.1));
        color: var(--danger);
      }

      /* ── Table ── */
      @keyframes pageRowIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .page-animate tr {
        animation: pageRowIn 0.28s ease both;
      }
      .page-animate tr:nth-child(1) {
        animation-delay: 0ms;
      }
      .page-animate tr:nth-child(2) {
        animation-delay: 30ms;
      }
      .page-animate tr:nth-child(3) {
        animation-delay: 60ms;
      }
      .page-animate tr:nth-child(4) {
        animation-delay: 90ms;
      }
      .page-animate tr:nth-child(5) {
        animation-delay: 120ms;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 560px;
      }
      .data-table th {
        text-align: left;
        padding: 12px 16px;
        background: var(--bg-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .data-table td {
        padding: 14px 16px;
        border-top: 1px solid var(--border);
        font-size: 0.9rem;
        vertical-align: middle;
        color: var(--text-secondary);
      }
      .data-table tbody tr {
        transition: background 0.18s;
      }
      .data-table tbody tr:hover {
        background: var(--bg-secondary);
      }
      .table-img {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 8px;
        transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .data-table tbody tr:hover .table-img {
        transform: scale(1.08);
      }
      .product-name {
        font-weight: 600;
        max-width: 200px;
        color: var(--text-white);
      }
      .low-stock {
        color: var(--danger);
        font-weight: 700;
      }
      .status-badge {
        padding: 4px 11px;
        border-radius: 20px;
        font-size: 0.74rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .status-badge::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .status-active {
        background: var(--success-light);
        color: var(--success);
      }
      .status-active::before {
        background: var(--success);
      }
      .status-inactive {
        background: var(--bg-secondary);
        color: var(--text-muted);
      }
      .status-inactive::before {
        background: var(--text-muted);
      }
      .status-out_of_stock {
        background: rgba(239, 68, 68, 0.12);
        color: var(--danger);
      }
      .status-out_of_stock::before {
        background: var(--danger);
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .btn-edit,
      .btn-delete {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-edit {
        background: var(--accent-light);
        color: var(--accent);
      }
      .btn-edit:hover {
        background: var(--accent);
        color: white;
        transform: scale(1.1);
      }
      .btn-delete {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
      .btn-delete:hover {
        background: var(--danger);
        color: white;
        transform: scale(1.1);
      }
      .empty {
        text-align: center;
        color: var(--text-muted);
        padding: 40px;
      }

      /* ── Pagination ── */
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 20px;
        padding-top: 18px;
        border-top: 1px solid var(--border);
      }
      .pagination-info {
        font-size: 0.8rem;
        color: var(--text-muted);
        white-space: nowrap;
      }
      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .pg-btn {
        min-width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--bg-secondary);
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.82rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.18s;
        padding: 0 8px;
        font-family: inherit;
      }
      .pg-btn:hover:not(:disabled) {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--accent-light);
      }
      .pg-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .pg-btn.pg-active {
        border-color: var(--accent);
        background: var(--accent);
        color: white;
        font-weight: 700;
      }
      .pg-ellipsis {
        color: var(--text-muted);
        font-size: 0.9rem;
        padding: 0 4px;
        user-select: none;
        line-height: 34px;
      }
      .pagination-size {
        min-width: 130px;
      }

      /* ── Modal Overlay & Container ── */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 7, 20, 0.4);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 1000;
        padding-top: 60px;
        animation: overlayIn 0.22s ease both;
      }
      @keyframes overlayIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .modal {
        background: var(--bg-card);
        border-radius: 20px;
        width: 100%;
        max-width: 560px;
        max-height: 92vh;
        overflow-y: auto;
        border: 1px solid var(--border);
        box-shadow: 0 32px 80px rgba(0, 0, 0, 0.15);
        animation: modalIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        scrollbar-width: thin;
        scrollbar-color: var(--border) transparent;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
      }
      .modal::-webkit-scrollbar {
        width: 5px;
      }
      .modal::-webkit-scrollbar-track {
        background: transparent;
      }
      .modal::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 99px;
      }
      @keyframes modalIn {
        from {
          transform: scale(0.9) translateY(24px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }

      /* ── Modal Header ── */
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px 24px 20px;
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
        border-radius: 20px 20px 0 0;
      }
      .modal-title-group {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .modal-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        color: white;
        box-shadow: 0 4px 12px rgba(79, 110, 247, 0.2);
        flex-shrink: 0;
      }
      .modal-header h2 {
        font-size: 1.18rem;
        font-weight: 700;
        color: var(--text-white);
        margin: 0 0 3px;
      }
      .modal-subtitle {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin: 0;
      }
      .modal-close {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        width: 34px;
        height: 34px;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 1rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .modal-close:hover {
        background: var(--danger-light, rgba(239, 68, 68, 0.1));
        border-color: var(--danger);
        color: var(--danger);
        transform: rotate(90deg);
      }

      /* ── Modal Body ── */
      .modal-body {
        padding: 20px 24px 8px;
      }
      .form-section {
        margin-bottom: 4px;
      }
      .section-label {
        font-size: 0.73rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .section-label i {
        color: var(--accent);
        font-size: 0.78rem;
      }
      .form-divider {
        height: 1px;
        background: var(--border);
        margin: 18px 0;
      }
      .form-group {
        margin-bottom: 14px;
      }
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
        font-size: 0.82rem;
        color: var(--text-secondary);
      }
      .req {
        color: var(--danger);
        margin-left: 2px;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      /* ── Input Styles ── */
      .input-wrap {
        position: relative;
      }
      .input-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 0.82rem;
        pointer-events: none;
        z-index: 1;
      }
      .input-prefix {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 0.92rem;
        font-weight: 600;
        pointer-events: none;
        z-index: 1;
      }
      .form-control {
        width: 100%;
        padding: 10px 14px;
        border: 1.5px solid var(--border);
        border-radius: 10px;
        font-size: 0.9rem;
        outline: none;
        box-sizing: border-box;
        background: var(--bg-secondary);
        color: var(--text-white);
        transition:
          border-color 0.22s,
          box-shadow 0.22s,
          background 0.22s;
        font-family: inherit;
      }
      .form-control.has-icon {
        padding-left: 36px;
      }
      .form-control.has-prefix {
        padding-left: 28px;
      }
      .form-control:hover {
        border-color: var(--text-muted);
      }
      .form-control:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-light);
        background: var(--bg-card);
      }
      .form-control::placeholder {
        color: var(--text-muted);
        opacity: 0.6;
      }
      textarea.form-control {
        resize: vertical;
        min-height: 80px;
        line-height: 1.5;
      }

      /* ── Image Upload ── */
      .img-upload-area {
        border: 2px dashed var(--border);
        border-radius: 14px;
        height: 170px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        transition:
          border-color 0.25s,
          background 0.25s;
        background: var(--bg-secondary);
      }
      .img-upload-area:hover {
        border-color: var(--accent);
        background: var(--accent-light);
      }
      .img-upload-area.has-image {
        border-style: solid;
        border-color: var(--accent);
      }
      .img-preview {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .img-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.88rem;
        font-weight: 600;
        gap: 6px;
        opacity: 0;
        transition: opacity 0.22s;
      }
      .img-upload-area:hover .img-overlay {
        opacity: 1;
      }
      .img-placeholder {
        text-align: center;
      }
      .upload-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: var(--accent-light);
        border: 1.5px dashed var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        color: var(--accent);
        margin: 0 auto 12px;
      }
      .upload-text {
        color: var(--text-secondary);
        font-size: 0.88rem;
        font-weight: 600;
        margin: 0 0 4px;
      }
      .upload-sub {
        color: var(--text-muted);
        font-size: 0.75rem;
        margin: 0;
      }

      /* ── Crop Modal ── */
      .crop-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 7, 20, 0.75);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
        animation: overlayIn 0.2s ease both;
      }
      .crop-modal {
        background: var(--bg-card);
        border-radius: 18px;
        width: min(620px, 96vw);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border);
        box-shadow: 0 32px 80px rgba(0,0,0,0.3);
        animation: modalIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
        overflow: hidden;
      }
      .crop-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px;
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
        border-radius: 18px 18px 0 0;
      }
      .crop-modal-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-white);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .crop-modal-title i {
        color: var(--accent);
      }
      .crop-close {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        width: 30px;
        height: 30px;
        border-radius: 7px;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .crop-close:hover {
        background: rgba(239,68,68,0.1);
        border-color: var(--danger);
        color: var(--danger);
      }
      .crop-modal-body {
        flex: 1;
        overflow: auto;
        padding: 16px;
        background: #111;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 280px;
        max-height: calc(90vh - 120px);
      }
      .crop-modal-body image-cropper {
        max-height: calc(90vh - 160px);
        max-width: 100%;
      }
      .crop-modal-footer {
        display: flex;
        gap: 10px;
        padding: 14px 20px;
        justify-content: flex-end;
        border-top: 1px solid var(--border);
        background: var(--bg-secondary);
        border-radius: 0 0 18px 18px;
      }

      /* ── Featured Toggle ── */
      .featured-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-radius: 12px;
        background: var(--bg-secondary);
        border: 1.5px solid var(--border);
        margin-top: 14px;
      }
      .featured-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .featured-star {
        color: #f59e0b;
        font-size: 1rem;
      }
      .featured-title {
        display: block;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-white);
      }
      .featured-desc {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 1px;
      }
      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        flex-shrink: 0;
        cursor: pointer;
      }
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
      }
      .toggle-track {
        position: absolute;
        inset: 0;
        border-radius: 99px;
        background: var(--border);
        transition:
          background 0.25s,
          border-color 0.25s;
        display: flex;
        align-items: center;
      }
      .toggle-thumb {
        position: absolute;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: white;
        transition:
          transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
          background 0.25s;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      }
      .toggle-switch input:checked ~ .toggle-track {
        background: var(--accent);
      }
      .toggle-switch input:checked ~ .toggle-track .toggle-thumb {
        transform: translateX(20px);
      }

      /* ── Modal Footer ── */
      .modal-footer {
        display: flex;
        gap: 10px;
        padding: 16px 24px 24px;
        justify-content: flex-end;
        border-top: 1px solid var(--border);
        margin-top: 8px;
      }
      .btn-cancel {
        padding: 10px 18px;
        background: transparent;
        border: 1.5px solid var(--border);
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-muted);
        font-size: 0.88rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .btn-cancel:hover {
        background: var(--bg-secondary);
        border-color: var(--text-muted);
      }
      .btn-save {
        padding: 10px 22px;
        background: linear-gradient(135deg, var(--accent), var(--purple));
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.88rem;
        transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        align-items: center;
        gap: 7px;
        box-shadow: 0 4px 14px rgba(79, 110, 247, 0.2);
      }
      .btn-save:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(79, 110, 247, 0.35);
      }
      .btn-save:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        box-shadow: none;
      }

      @media (max-width: 768px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .page-header h1 {
          font-size: 1.4rem;
        }
        .btn-add {
          width: 100%;
          justify-content: center;
        }
        .search-input {
          width: 100%;
        }
        .toolbar-row {
          flex-direction: column;
          align-items: stretch;
        }
        .search-wrap {
          min-width: unset;
          width: 100%;
        }
        .filter-selects {
          flex-direction: column;
        }
        .filter-select-item {
          min-width: unset;
          width: 100%;
        }
        .form-row {
          grid-template-columns: 1fr;
        }
        .section-card {
          padding: 16px;
        }
        .pagination-bar {
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .pagination-info { order: 2; }
        .pagination-controls { order: 1; }
        .pagination-size { order: 3; }
      }
      @media (max-width: 480px) {
        .page-header h1 {
          font-size: 1.25rem;
        }
        .modal-overlay {
          align-items: flex-end;
          padding-top: 0;
        }
        .modal {
          border-radius: 24px 24px 0 0;
          max-height: 95vh;
          width: 100%;
          max-width: 100%;
          margin: 0;
        }
        .modal-header {
          padding: 18px 16px 14px;
          border-radius: 24px 24px 0 0;
        }
        .modal-body {
          padding: 16px 16px 8px;
        }
        .modal-footer {
          padding: 12px 16px 20px;
          flex-direction: column-reverse;
        }
        .btn-cancel,
        .btn-save {
          width: 100%;
          justify-content: center;
        }
      }

      @media (max-width: 370px) {
        .page-header h1 {
          font-size: 1.1rem;
        }
        .section-card {
          padding: 12px 10px;
        }
        .modal-body {
          padding: 12px 12px 8px;
        }
        .modal-header {
          padding: 16px 12px 12px;
        }
      }
    `,
  ],
})
export class ManageProductsComponent implements OnInit {
  animationState = 0;
  products: Product[] = [];
  loading = true;
  categories: Category[] = [];
  apiUrl = environment.apiUrl;

  private _selectedCategories: string[] = [];
  get selectedCategories() {
    return this._selectedCategories;
  }
  set selectedCategories(v: string[]) {
    this._selectedCategories = v ?? [];
    this.currentPage = 1;
  }

  private _selectedStatus = '';
  get selectedStatus() {
    return this._selectedStatus;
  }
  set selectedStatus(v: string) {
    this._selectedStatus = v ?? '';
    this.currentPage = 1;
  }

  readonly statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  readonly statusFilterOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  get categoryFilterOptions(): SelectOption[] {
    return this.categories.map((c) => ({ value: c._id, label: c.name }));
  }

  get categoryOptions(): SelectOption[] {
    return [
      { value: '', label: 'Select category' },
      ...this.categories.map((c) => ({ value: c._id, label: c.name })),
    ];
  }
  showModal = false;
  editingProduct: Product | null = null;
  saving = false;
  currentPage = 1;
  private _pageSize = 10;
  get pageSize() {
    return this._pageSize;
  }
  set pageSize(v: number) {
    this._pageSize = +v;
    this.currentPage = 1;
  }

  private _searchQuery = '';
  get searchQuery() {
    return this._searchQuery;
  }
  set searchQuery(s: string) {
    this._searchQuery = s;
    this.currentPage = 1;
  }

  formData: any = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    status: 'active',
    featured: false,
    downloadLink: '',
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  showCropModal = false;
  imageChangedEvent: Event | null = null;
  croppedBlob: Blob | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private confirmService: ConfirmService,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
    this.loadProducts();
    this.categoryService
      .getCategories()
      .subscribe({ next: (res) => (this.categories = res.categories || []) });
  }

  loadProducts() {
    this.productService.getProducts({ limit: 100, status: 'all' }).subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get filteredProducts(): Product[] {
    return this.products.filter((p) => {
      const q = this._searchQuery.toLowerCase().trim();
      const catName =
        typeof p.category === 'string' ? '' : ((p.category as any)?.name ?? '');
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q);
      const catId =
        typeof p.category === 'string' ? p.category : (p.category as any)?._id;
      const matchesCategory =
        this._selectedCategories.length === 0 ||
        this._selectedCategories.includes(catId);
      const matchesStatus =
        !this._selectedStatus || p.status === this._selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  get totalItems(): number {
    return this.filteredProducts.length;
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this._pageSize));
  }
  get showingStart(): number {
    return this.totalItems === 0
      ? 0
      : (this.currentPage - 1) * this._pageSize + 1;
  }
  get showingEnd(): number {
    return Math.min(this.currentPage * this._pageSize, this.totalItems);
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this._pageSize;
    return this.filteredProducts.slice(start, start + this._pageSize);
  }

  get pageNumbers(): (number | null)[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | null)[] = [1];
    if (cur > 3) pages.push(null);
    const start = Math.max(2, cur - 1);
    const end = Math.min(total - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  }

  readonly pageSizeOptions: SelectOption[] = [
    { value: 10, label: '10 / page' },
    { value: 25, label: '25 / page' },
    { value: 50, label: '50 / page' },
  ];

  tableAnimating = false;
  setPage(n: number) {
    if (n < 1 || n > this.totalPages) return;
    this.currentPage = n;
  }

  getCategoryName(product: Product): string {
    if (!product.category) return '';
    return typeof product.category === 'string'
      ? ''
      : (product.category as any).name;
  }

  openModal() {
    this.showModal = true;
    this.editingProduct = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.showCropModal = false;
    this.imageChangedEvent = null;
    this.croppedBlob = null;
    this.formData = {
      name: '',
      description: '',
      price: 0,
      category: '',
      status: 'active',
      featured: false,
      downloadLink: '',
    };
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.selectedFile = null;
    this.imagePreview = product.image ? `${this.apiUrl}${product.image}` : null;
    this.formData = {
      name: product.name,
      description: product.description,
      price: product.price,
      category:
        typeof product.category === 'string'
          ? product.category
          : (product.category as any)._id,
      status: product.status,
      featured: product.featured,
      downloadLink: product.downloadLink || '',
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.showCropModal = false;
    this.imageChangedEvent = null;
    this.croppedBlob = null;
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageChangedEvent = event;
    this.showCropModal = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob ?? null;
    if (event.objectUrl) {
      this.imagePreview = event.objectUrl;
    }
  }

  imageLoaded() { }
  cropperReady() { }
  loadImageFailed() {
    this.cancelCrop();
  }

  applyCrop() {
    if (this.croppedBlob) {
      const originalName = (this.imageChangedEvent as any)?.target?.files?.[0]?.name || 'image.webp';
      const safeName = originalName.replace(/\.[^.]+$/, '') + '.webp';
      this.selectedFile = new File([this.croppedBlob], safeName, { type: 'image/webp' });
      if (!this.imagePreview) {
        const reader = new FileReader();
        reader.onload = () => (this.imagePreview = reader.result as string);
        reader.readAsDataURL(this.croppedBlob!);
      }
    }
    this.showCropModal = false;
  }

  cancelCrop() {
    this.showCropModal = false;
    this.imageChangedEvent = null;
    this.croppedBlob = null;
  }

  saveProduct() {
    this.saving = true;
    const fd = new FormData();
    fd.append('name', this.formData.name);
    fd.append('description', this.formData.description);
    fd.append('price', String(this.formData.price));
    fd.append('category', this.formData.category);
    fd.append('status', this.formData.status);
    fd.append('featured', String(this.formData.featured));
    if (this.formData.downloadLink)
      fd.append('downloadLink', this.formData.downloadLink);
    if (this.selectedFile) fd.append('image', this.selectedFile);
    const obs = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct._id, fd)
      : this.productService.createProduct(fd);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadProducts();
        this.notification.success(
          this.editingProduct
            ? 'Product updated successfully'
            : 'Product created successfully',
        );
      },
      error: (err) => {
        this.saving = false;
        this.notification.error(err.error?.message || 'Failed to save product');
      },
    });
  }

  async deleteProduct(id: string) {
    const ok = await this.confirmService.confirm({
      title: 'Delete Product',
      description:
        'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'danger',
      okText: 'Delete',
    });
    if (!ok) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
        this.notification.success('Product deleted successfully');
      },
      error: () => {
        this.notification.error('Failed to delete product. Please try again.');
      },
    });
  }
}
