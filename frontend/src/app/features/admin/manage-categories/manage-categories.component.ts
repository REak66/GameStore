import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { SpinComponent } from '../../../shared/components/spin/spin.component';
import { NotificationService } from '../../../shared/services/notification.service';
import {
  SelectComponent,
  SelectOption,
} from '../../../shared/components/select/select.component';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SpinComponent,
    SelectComponent,
  ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(12px)' }),
            stagger('35ms', [
              animate(
                '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                style({ opacity: 1, transform: 'translateY(0)' }),
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
        <h1>Manage Categories</h1>
        <button class="btn-add" (click)="openModal()">+ Add Category</button>
      </div>

      <div class="section-card">
        <app-spin
          [spinning]="loading"
          [hasContent]="true"
          tip="Loading categories..."
        >
          <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody [@listAnimation]="pagedCategories.length">
              <tr *ngFor="let cat of pagedCategories">
                <td class="cat-name">{{ cat.name }}</td>
                <td>{{ cat.description || '—' }}</td>
                <td>
                  <span
                    class="status-badge"
                    [class.active]="cat.isActive"
                    [class.inactive]="!cat.isActive"
                  >
                    {{ cat.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="btn-edit" (click)="editCategory(cat)">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn-delete" (click)="deleteCategory(cat._id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0 && !loading">
                <td colspan="4" class="empty">No categories yet</td>
              </tr>
            </tbody>
          </table>
          </div>

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
          <div class="modal-header">
            <h2>{{ editing ? 'Edit Category' : 'Add Category' }}</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Name *</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea
                [(ngModel)]="formData.description"
                class="form-control"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button class="btn-save" (click)="save()" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
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
      .section-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid var(--border);
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
      .table-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 480px;
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
        color: var(--text-secondary);
      }
      .data-table tbody tr {
        transition: background 0.18s;
      }
      .data-table tbody tr:hover {
        background: var(--bg-secondary);
      }
      .cat-name {
        font-weight: 600;
        color: var(--text-white);
      }
      .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
      }
      .status-badge.active {
        background: var(--success-light);
        color: var(--success);
      }
      .status-badge.inactive {
        background: var(--bg-secondary);
        color: var(--text-muted);
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

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: overlayIn 0.2s ease both;
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
        max-width: 460px;
        border: 1px solid var(--border);
        animation: modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transition:
          background-color 0.4s ease,
          border-color 0.4s ease;
      }
      @keyframes modalIn {
        from {
          transform: scale(0.88) translateY(20px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 24px 0;
      }
      .modal-header h2 {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-white);
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-muted);
        transition:
          color 0.2s,
          transform 0.2s;
      }
      .modal-close:hover {
        color: var(--text-white);
        transform: rotate(90deg);
      }
      .modal-body {
        padding: 20px 24px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .form-control {
        width: 100%;
        padding: 10px 14px;
        border: 1.5px solid var(--border);
        border-radius: 8px;
        font-size: 0.95rem;
        outline: none;
        box-sizing: border-box;
        background: var(--bg-secondary);
        color: var(--text-white);
        transition:
          border-color 0.25s,
          box-shadow 0.25s,
          background 0.25s;
      }
      .form-control:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-light);
        background: var(--bg-card);
      }
      .modal-footer {
        display: flex;
        gap: 12px;
        padding: 0 24px 24px;
        justify-content: flex-end;
      }
      .btn-cancel {
        padding: 10px 20px;
        background: transparent;
        border: 1.5px solid var(--border);
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-muted);
        transition: all 0.2s;
      }
      .btn-cancel:hover {
        background: var(--bg-secondary);
      }
      .btn-save {
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
      .btn-save:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(79, 110, 247, 0.35);
      }
      .btn-save:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
          text-align: center;
          justify-content: center;
        }
        .section-card {
          padding: 16px 12px;
        }
        .data-table th,
        .data-table td {
          padding: 10px 12px;
        }
        .pagination-bar {
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .pagination-info { order: 2; }
        .pagination-controls { order: 1; }
        .pagination-size { order: 3; }
        .modal-overlay {
          align-items: flex-end;
          padding-top: 0;
        }
        .modal {
          border-radius: 24px 24px 0 0;
          max-height: 92vh;
          width: 100%;
          max-width: 100%;
          margin: 0;
        }
        .modal-footer {
          flex-direction: column-reverse;
        }
        .btn-cancel,
        .btn-save {
          width: 100%;
          justify-content: center;
        }
      }
      @media (max-width: 480px) {
        .page-header h1 {
          font-size: 1.25rem;
        }
        .section-card {
          padding: 14px;
        }
      }

      @media (max-width: 370px) {
        .page-header h1 {
          font-size: 1.1rem;
        }
        .section-card {
          padding: 10px 6px;
        }
        .data-table th,
        .data-table td {
          padding: 8px 10px;
          font-size: 0.8rem;
        }
        .btn-edit,
        .btn-delete {
          width: 32px;
          height: 32px;
        }
      }
    `,
  ],
})
export class ManageCategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  showModal = false;
  editing: Category | null = null;
  saving = false;
  formData = { name: '', description: '' };

  currentPage = 1;
  private _pageSize = 10;
  get pageSize() {
    return this._pageSize;
  }
  set pageSize(v: number) {
    this._pageSize = +v;
    this.currentPage = 1;
  }

  get totalItems(): number {
    return this.categories.length;
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

  get pagedCategories(): Category[] {
    const start = (this.currentPage - 1) * this._pageSize;
    return this.categories.slice(start, start + this._pageSize);
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

  constructor(
    private categoryService: CategoryService,
    private confirmService: ConfirmService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.categories || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openModal() {
    this.showModal = true;
    this.editing = null;
    this.formData = { name: '', description: '' };
  }
  editCategory(cat: Category) {
    this.editing = cat;
    this.formData = { name: cat.name, description: cat.description || '' };
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }

  save() {
    this.saving = true;
    const isEdit = !!this.editing;
    const obs = this.editing
      ? this.categoryService.updateCategory(this.editing._id, this.formData)
      : this.categoryService.createCategory(this.formData);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.load();
        this.notificationService.success(
          isEdit
            ? 'Category updated successfully'
            : 'Category created successfully',
        );
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.error(
          err.error?.message ||
          (isEdit
            ? 'Failed to update category'
            : 'Failed to create category'),
        );
      },
    });
  }

  async deleteCategory(id: string) {
    const ok = await this.confirmService.confirm({
      title: 'Delete Category',
      description: 'Are you sure you want to delete this category?',
      type: 'danger',
      okText: 'Delete',
    });
    if (!ok) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.notificationService.success('Category deleted');
        this.load();
      },
      error: (err) => {
        this.notificationService.error(
          err.error?.message || 'Failed to delete category',
        );
      },
    });
  }
}
