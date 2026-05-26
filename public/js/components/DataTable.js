class DataTable {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      pageSize: 20,
      sortable: true,
      ...options,
    };
    this.currentPage = 1;
    this.sortField = null;
    this.sortDir = 'asc';
    this.data = [];
    this.total = 0;
  }

  render(data, total) {
    this.data = data;
    this.total = total;
    this.container.innerHTML = this._buildTable();
    this._attachEvents();
  }

  _buildTable() {
    const cols = this.options.columns || [];
    const start = (this.currentPage - 1) * this.options.pageSize;
    const end = Math.min(start + this.options.pageSize, this.total);
    const totalPages = Math.ceil(this.total / this.options.pageSize);

    let html = '<div class="table-toolbar">';
    if (this.options.toolbar) html += this.options.toolbar;
    if (this.options.searchable !== false) {
      html += '<div class="search-box"><svg data-lucide="search" style="width:16px;height:16px;position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--color-text-tertiary)"></svg><input type="text" id="searchInput" placeholder="Search..." value=""></div>';
    }
    html += '</div>';
    html += '<table class="data-table"><thead><tr>';
    for (const col of cols) {
      const sortCls = this.options.sortable && col.sortable !== false ? 'sortable' : '';
      const dir = this.sortField === col.field && this.sortDir === 'asc' ? ' ▲' : this.sortField === col.field ? ' ▼' : '';
      html += '<th class="' + sortCls + '" data-field="' + col.field + '">' + col.label + dir + '</th>';
    }
    html += '<th class="text-right">Actions</th></tr></thead><tbody>';

    if (this.data.length === 0) {
      html += '<tr><td colspan="' + (cols.length + 1) + '"><div class="empty-state"><svg data-lucide="search" style="width:32px;height:32px"></svg><p>No data found</p></div></td></tr>';
    } else {
      for (const row of this.data) {
        html += '<tr>';
        for (const col of cols) {
          const val = col.render ? col.render(row) : escapeHtml(String(row[col.field] ?? ''));
          html += '<td>' + val + '</td>';
        }
        html += '<td class="cell-actions" style="justify-content:flex-end">' + this._renderActions(row) + '</td>';
        html += '</tr>';
      }
    }
    html += '</tbody></table>';
    html += '<div class="table-pagination"><span>Showing ' + (start + 1) + '-' + end + ' of ' + this.total + '</span>' +
      '<div class="pagination-buttons">' +
      '<button class="btn btn-sm btn-outline" data-page="prev" ' + (this.currentPage <= 1 ? 'disabled' : '') + '>Prev</button>' +
      '<button class="btn btn-sm btn-outline" data-page="next" ' + (this.currentPage >= totalPages ? 'disabled' : '') + '>Next</button>' +
      '</div></div>';
    return html;
  }

  _renderActions(row) {
    if (!this.options.actions) return '';
    return this.options.actions(row);
  }

  _attachEvents() {
    this.container.querySelectorAll('th.sortable').forEach(el => {
      el.addEventListener('click', () => {
        const field = el.dataset.field;
        if (this.sortField === field) {
          this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortField = field;
          this.sortDir = 'asc';
        }
        if (this.options.onSort) this.options.onSort(this.sortField, this.sortDir);
      });
    });

    this.container.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.page === 'prev' && this.currentPage > 1) {
          this.currentPage--;
        } else if (el.dataset.page === 'next') {
          this.currentPage++;
        }
        if (this.options.onPageChange) this.options.onPageChange(this.currentPage);
      });
    });

    const searchInput = this.container.querySelector('#searchInput');
    if (searchInput && this.options.onSearch) {
      searchInput.addEventListener('input', debounce((e) => {
        this.options.onSearch(e.target.value);
      }, 300));
    }
  }
}
