import { style } from "@angular/animations";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Chart, registerables } from 'chart.js'
import { MatDialog } from '@angular/material/dialog';
import { AddFinancialDialogComponent } from './add-financial-dialog.component';
import { FinancialService } from '../../service/financial.service';
import { FinancialSummaryService } from '../../service/financial-summary.service';
import { PropertyService } from '../../service/property.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '../../service/alert.service';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

Chart.register(...registerables)

@Component({
  selector: 'app-statistic-page',
  standalone: false,

  templateUrl: './statistic-page.component.html',
  styleUrl: './statistic-page.component.css'
})
export class StatisticPageComponent{
   showFilterDialog = false;
  selectedCategory = 'all';
  categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4'];

  filterType: 'year' | 'month' | 'date' = 'year';
  filterYear: number | null = null;
  filterMonth: number | null = null;
  filterDate: Date | null = null;
  filterDay: number | null = null;
  availableDays: number[] = [];
  summaryData: any = null;
  selectedPropertyId: number | null = null;
  properties: any[] = [];

  @ViewChild('myChartCanvas', { static: false }) myChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas', { static: false }) pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private dialog: MatDialog,
    private financialService: FinancialService,
    private financialSummaryService: FinancialSummaryService,
    private propertyService: PropertyService,
    private snackBar: MatSnackBar,
    private alertService: AlertService,
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.user$.subscribe(user => {
      this.userRole = user && user.role_id === 2 ? 'pemilik' : (user && user.role_id === 3 ? 'penjaga' : '');
      this.userEmail = user?.email || '';
      this.userDetail = user;
    });
  }

  openFilterDialog(): void {
    this.showFilterDialog = true;
  }

  closeFilterDialog(): void {
    this.showFilterDialog = false;
  }

  renderCharts(labels: string[], income: number[], outcome: number[], pieData: any) {
    // Line chart
    if (this.myChartCanvas) {
      if (!this.chart) {
        this.chart = new Chart(this.myChartCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Income',
                data: income,
                fill: false,
                borderColor: '#4caf50',
                backgroundColor: '#4caf50',
                tension: 0.1
              },
              {
                label: 'Expense',
                data: outcome,
                fill: false,
                borderColor: '#f44336',
                backgroundColor: '#f44336',
                tension: 0.1
              }
            ]
          },
          options: { aspectRatio: 1 }
        });
      } else {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = income;
        this.chart.data.datasets[0].borderColor = '#4caf50';
        this.chart.data.datasets[0].backgroundColor = '#4caf50';
        this.chart.data.datasets[1].data = outcome;
        this.chart.data.datasets[1].borderColor = '#f44336';
        this.chart.data.datasets[1].backgroundColor = '#f44336';
        this.chart.update();
      }
    }
    // Bar chart
    if (this.barChartCanvas) {
      if (!this.barChart) {
        this.barChart = new Chart(this.barChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Income',
                data: income,
                backgroundColor: '#4caf50',
                borderColor: '#4caf50',
                borderWidth: 1
              },
              {
                label: 'Expense',
                data: outcome,
                backgroundColor: '#f44336',
                borderColor: '#f44336',
                borderWidth: 1
              }
            ]
          },
          options: {
            aspectRatio: 1.5,
            scales: {
              x: { beginAtZero: true },
              y: { beginAtZero: true }
            }
          }
        });
      } else {
        this.barChart.data.labels = labels;
        this.barChart.data.datasets[0].data = income;
        this.barChart.data.datasets[0].backgroundColor = '#4caf50';
        this.barChart.data.datasets[0].borderColor = '#4caf50';
        this.barChart.data.datasets[1].data = outcome;
        this.barChart.data.datasets[1].backgroundColor = '#f44336';
        this.barChart.data.datasets[1].borderColor = '#f44336';
        this.barChart.update();
      }
    }
    // Pie chart
    if (this.pieChartCanvas) {
      if (!this.pieChart) {
        this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
          type: 'pie',
          data: {
            labels: pieData.labels,
            datasets: [{
              data: pieData.datasets[0].data,
              backgroundColor: ['#4caf50', '#f44336'],
            }]
          },
          options: { aspectRatio: 1 }
        });
      } else {
        this.pieChart.data = {
          labels: pieData.labels,
          datasets: [{
            data: pieData.datasets[0].data,
            backgroundColor: ['#4caf50', '#f44336'],
          }]
        };
        this.pieChart.update();
      }
    }
  }

  applyFilters(): void {
    if (!this.selectedPropertyId) {
      alert('Pilih properti terlebih dahulu!');
      return;
    }
    this.financialService.getFinancialByProperty(this.selectedPropertyId).subscribe((res: any) => {
      if (res && res.data && Array.isArray(res.data)) {
        let filteredData = res.data;
        // Untuk penjaga, filter hanya data yang dia create
        if (this.userRole === 'penjaga') {
          filteredData = filteredData.filter((item: any) => item.user_create === this.userEmail);
        }
        if (this.filterType === 'year' && this.filterYear) {
          filteredData = filteredData.filter((item: any) => {
            const year = new Date(item.date).getFullYear();
            return year === this.filterYear;
          });
        } else if (this.filterType === 'month' && this.filterYear && this.filterMonth) {
          const filterMonthNum = Number(this.filterMonth);
          filteredData = filteredData.filter((item: any) => {
            const dateObj = new Date(item.date);
            return dateObj.getFullYear() === this.filterYear && (dateObj.getMonth() + 1) === filterMonthNum;
          });
        } else if (this.filterType === 'date' && this.filterYear && this.filterMonth && this.filterDay) {
          const filterMonthNum = Number(this.filterMonth);
          const filterDayNum = Number(this.filterDay);
          filteredData = filteredData.filter((item: any) => {
            const dateObj = new Date(item.date);
            return dateObj.getFullYear() === this.filterYear && (dateObj.getMonth() + 1) === filterMonthNum && dateObj.getDate() === filterDayNum;
          });
        }
        // Urutkan data berdasarkan tanggal ascending
        filteredData = filteredData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (filteredData.length > 0) {
          this.chartVisible = true;
          const labels = filteredData.map((item: any) => item.date);
          const income = filteredData.map((item: any) => item.income);
          const outcome = filteredData.map((item: any) => item.expense);
          // Pie chart data: total income & total expense
          let totalIncome = 0;
          let totalExpense = 0;
          filteredData.forEach((item: any) => {
            totalIncome += item.income || 0;
            totalExpense += item.expense || 0;
          });
          const pieData = {
            labels: ['Income', 'Expense'],
            datasets: [{
              data: [totalIncome, totalExpense],
              backgroundColor: ['#4caf50', '#f44336'],
            }]
          };
          setTimeout(() => {
            this.renderCharts(labels, income, outcome, pieData);
          });
        } else {
          this.chartVisible = false;
          setTimeout(() => {
            this.renderCharts([], [], [], { labels: ['Income', 'Expense'], datasets: [{ data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }] });
          });
        }
        // Update tableData dari filteredData
        this.tableData = filteredData.map((item: any) => ({
          Tanggal: item.date,
          Pemasukan: item.income,
          Pengeluaran: item.expense,
          Properti: item.property_name || this.getPropertyName(item.property_id),
          Unit: item.unit_name || this.getUnitName(item.unit_id),
          Deskripsi: item.description || item.deskripsi || '',
          id: item.id,
          property_id: item.property_id,
          unit_id: item.unit_id
        }));
        this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
      }
    });
    this.closeFilterDialog();
  }

  public config: any = {
    type: 'line',

    data: {
      labels: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'november', 'december'],
      datasets: [
        {
          label: 'Income',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Expense',
          data: [15, 24, 19, 9, 27, 33, 24],
          fill: false,
          borderColor: '',
          tension: 0.1
        }
      ]

    },options:{
      aspectRatio: 1
    }

  };
  chart: any;
  chartVisible: boolean = false;
  pieChart: any;
  barChart: any;

  tableData: any[] = [];
  tableColumns: string[] = ['Bulan', 'Pemasukan', 'Pengeluaran'];

  isLoading: boolean = false;
  showCharts: boolean = true;
  userRole: string = '';
  userEmail: string = '';
  userDetail: any;

  ngOnInit(){
    this.filterType = 'month';
    const now = new Date();
    this.filterYear = now.getFullYear();
    this.filterMonth = now.getMonth() + 1;
    this.detectUserRoleAndLoadData();
  }

  private detectUserRoleAndLoadData() {
    // Gunakan userDetail dari subscription
    // Untuk penjaga, ambil property_id dari userDetail
    if (this.userRole === 'penjaga') {
      this.showCharts = false;
      const penjagaPropertyIds = Array.isArray(this.userDetail?.property_id) ? this.userDetail.property_id : [];
      this.fetchPenjagaFinancials(penjagaPropertyIds);
    } else {
      this.showCharts = true;
      this.fetchOwnerProperties();
    }
  }

  private fetchOwnerProperties() {
    this.propertyService.getOwnerProperties().subscribe((res: any) => {
      this.properties = res.data || res;
      const allPropertyIds = this.properties.map(p => p.id);
      if (allPropertyIds.length === 0) {
        this.handleNoProperties();
        return;
      }
      this.isLoading = true;
      this.loadAllPropertiesFinancials(allPropertyIds);
    });
  }

  private handleNoProperties() {
    this.tableData = [];
    this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
    setTimeout(() => {
      this.renderCharts([], [], [], { labels: ['Income', 'Expense'], datasets: [{ data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }] });
      this.isLoading = false;
    });
  }

  private loadAllPropertiesFinancials(allPropertyIds: number[]) {
    let allFinancials: any[] = [];
    let loaded = 0;
    allPropertyIds.forEach((propertyId, idx) => {
      this.financialService.getFinancialByProperty(propertyId).subscribe((res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          let filtered = res.data;
          if (this.filterType === 'year' && this.filterYear) {
            filtered = filtered.filter((item: any) => {
              const year = new Date(item.date).getFullYear();
              return year === this.filterYear;
            });
          } else if (this.filterType === 'month' && this.filterYear && this.filterMonth) {
            filtered = filtered.filter((item: any) => {
              const dateObj = new Date(item.date);
              return dateObj.getFullYear() === this.filterYear && (dateObj.getMonth() + 1) === this.filterMonth;
            });
          } else if (this.filterType === 'date' && this.filterYear && this.filterMonth && this.filterDay) {
            filtered = filtered.filter((item: any) => {
              const dateObj = new Date(item.date);
              return dateObj.getFullYear() === this.filterYear && (dateObj.getMonth() + 1) === this.filterMonth && dateObj.getDate() === this.filterDay;
            });
          } else {
            // Default: tahun dan bulan berjalan
            const now = new Date();
            filtered = filtered.filter((item: any) => {
              const dateObj = new Date(item.date);
              return dateObj.getFullYear() === now.getFullYear() && (dateObj.getMonth() + 1) === (now.getMonth() + 1);
            });
          }
          allFinancials = allFinancials.concat(filtered.map((item: any) => ({ ...item, property_id: propertyId })));
        }
        loaded++;
        if (loaded === allPropertyIds.length) {
          this.updateChartsAndTable(allFinancials);
        }
      }, () => {
        loaded++;
        if (loaded === allPropertyIds.length) {
          this.handleNoProperties();
        }
      });
    });
  }

  private updateChartsAndTable(allFinancials: any[]) {
    allFinancials = allFinancials.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = allFinancials.map((item: any) => item.date);
    const income = allFinancials.map((item: any) => item.income);
    const outcome = allFinancials.map((item: any) => item.expense);
    let totalIncome = 0;
    let totalExpense = 0;
    allFinancials.forEach((item: any) => {
      totalIncome += item.income || 0;
      totalExpense += item.expense || 0;
    });
    const pieData = {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [totalIncome, totalExpense],
        backgroundColor: ['#4caf50', '#f44336'],
      }]
    };
    setTimeout(() => {
      this.renderCharts(labels, income, outcome, pieData);
      this.tableData = allFinancials.map((item: any) => ({
        Tanggal: item.date,
        Pemasukan: item.income,
        Pengeluaran: item.expense,
        Properti: item.property_name || this.getPropertyName(item.property_id),
        Unit: item.unit_name || this.getUnitName(item.unit_id),
        Deskripsi: item.description || item.deskripsi || '',
        id: item.id,
        property_id: item.property_id,
        unit_id: item.unit_id
      }));
      this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
      this.isLoading = false;
    });
  }

  private fetchPenjagaFinancials(propertyIds: number[]) {
    if (!propertyIds.length) {
      this.handleNoProperties();
      return;
    }
    this.isLoading = true;
    let allFinancials: any[] = [];
    let loaded = 0;
    let propertyDetails: any[] = [];
    propertyIds.forEach((propertyId) => {
      // Fetch property detail for dropdown
      this.propertyService.getPropertyById(propertyId).subscribe((propRes: any) => {
        if (propRes && propRes.data) {
          propertyDetails.push(propRes.data);
        }
        // After all property details are fetched, assign to properties
        if (propertyDetails.length === propertyIds.length) {
          this.properties = propertyDetails;
        }
      });
      // Fetch financials
      this.financialService.getFinancialByProperty(propertyId).subscribe((res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          // Filter hanya data yang dibuat oleh penjaga (user_create === userEmail)
          const filtered = res.data.filter((item: any) => {
            const dateObj = new Date(item.date);
            return dateObj.getFullYear() === this.filterYear && (dateObj.getMonth() + 1) === this.filterMonth && item.user_create === this.userEmail;
          });
          allFinancials = allFinancials.concat(filtered.map((item: any) => ({ ...item, property_id: propertyId })));
        }
        loaded++;
        if (loaded === propertyIds.length) {
          this.updateTableForPenjaga(allFinancials);
        }
      }, () => {
        loaded++;
        if (loaded === propertyIds.length) {
          this.handleNoProperties();
        }
      });
    });
  }

  private updateTableForPenjaga(allFinancials: any[]) {
    allFinancials = allFinancials.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.tableData = allFinancials.map((item: any) => ({
      Tanggal: item.date,
      Pemasukan: item.income,
      Pengeluaran: item.expense,
      Properti: item.property_name || this.getPropertyName(item.property_id),
      Unit: item.unit_name || this.getUnitName(item.unit_id),
      Deskripsi: item.description || item.deskripsi || '',
      id: item.id,
      property_id: item.property_id,
      unit_id: item.unit_id
    }));
    this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
    this.isLoading = false;
  }

  ngDoCheck() {
    // Update availableDays jika filterType 'date'
    if (this.filterType === 'date' && this.filterYear && this.filterMonth) {
      const daysInMonth = new Date(this.filterYear, this.filterMonth, 0).getDate();
      this.availableDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      // Reset filterDay jika di luar range
      if (this.filterDay && (this.filterDay < 1 || this.filterDay > daysInMonth)) {
        this.filterDay = null;
      }
    } else {
      this.availableDays = [];
      this.filterDay = null;
    }
  }

  loadFinancialStatistic(propertyId: number) {
    this.isLoading = true;
    this.tableData = [];
    this.financialService.getFinancialByProperty(propertyId).subscribe((res: any) => {
      let labels: string[] = [];
      let income: number[] = [];
      let outcome: number[] = [];
      let filteredData = res && res.data && Array.isArray(res.data) ? res.data : [];
      // Untuk penjaga, filter hanya data yang dia create
      if (this.userRole === 'penjaga') {
        filteredData = filteredData.filter((item: any) => item.user_create === this.userEmail);
      }
      if (filteredData.length > 0) {
        if (this.filterType === 'year' && this.filterYear) {
          filteredData = filteredData.filter((item: any) => {
            const year = new Date(item.date).getFullYear();
            return year === this.filterYear;
          });
        } else if (this.filterType === 'month' && this.filterYear && this.filterMonth) {
          const filterMonthNum = Number(this.filterMonth);
          filteredData = filteredData.filter((item: any) => {
            const dateObj = new Date(item.date);
            return dateObj.getFullYear() === this.filterYear && (dateObj.getMonth() + 1) === filterMonthNum;
          });
        } else if (this.filterType === 'date' && this.filterYear && this.filterMonth && this.filterDay) {
          const filterMonthNum = Number(this.filterMonth);
          const filterDayNum = Number(this.filterDay);
          filteredData = filteredData.filter((item: any) => {
            const dateObj = new Date(item.date);
            return dateObj.getFullYear() === this.filterYear && (dateObj.getMonth() + 1) === filterMonthNum && dateObj.getDate() === filterDayNum;
          });
        } else {
          // Default: tahun dan bulan berjalan
          const now = new Date();
          filteredData = filteredData.filter((item: any) => {
            const dateObj = new Date(item.date);
            return dateObj.getFullYear() === now.getFullYear() && (dateObj.getMonth() + 1) === (now.getMonth() + 1);
          });
        }
        // Urutkan data berdasarkan tanggal ascending
        filteredData = filteredData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (filteredData.length > 0) {
          labels = filteredData.map((item: any) => item.date);
          income = filteredData.map((item: any) => item.income);
          outcome = filteredData.map((item: any) => item.expense);
          // Pie chart data: total income & total expense
          let totalIncome = 0;
          let totalExpense = 0;
          filteredData.forEach((item: any) => {
            totalIncome += item.income || 0;
            totalExpense += item.expense || 0;
          });
          const pieData = {
            labels: ['Income', 'Expense'],
            datasets: [{
              data: [totalIncome, totalExpense],
              backgroundColor: ['#4caf50', '#f44336'],
            }]
          };
          this.chartVisible = true;
          setTimeout(() => {
            this.renderCharts(labels, income, outcome, pieData);
          });
        } else {
          this.chartVisible = false;
          setTimeout(() => {
            this.renderCharts([], [], [], { labels: ['Income', 'Expense'], datasets: [{ data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }] });
          });
        }
        // Update tableData and tableColumns
        this.tableData = filteredData.map((item: any) => ({
          Tanggal: item.date,
          Pemasukan: item.income,
          Pengeluaran: item.expense,
          Properti: item.property_name || this.getPropertyName(item.property_id),
          Unit: item.unit_name || this.getUnitName(item.unit_id),
          Deskripsi: item.description || item.deskripsi || '',
          id: item.id,
          property_id: item.property_id,
          unit_id: item.unit_id
        }));
        this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
      } else {
        this.chartVisible = false;
        setTimeout(() => {
          this.renderCharts([], [], [], { labels: ['Income', 'Expense'], datasets: [{ data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }] });
          this.tableData = [];
          this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
        });
      }
      this.isLoading = false;
    }, () => {
      this.chartVisible = false;
      setTimeout(() => {
        this.renderCharts([], [], [], { labels: ['Income', 'Expense'], datasets: [{ data: [0, 0], backgroundColor: ['#4caf50', '#f44336'] }] });
        this.tableData = [];
        this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
        this.isLoading = false;
      });
    });
  }

  onPropertyChange(propertyId: number) {
    this.selectedPropertyId = propertyId;
    // Kosongkan data financial dan chart sebelum load baru
    this.tableData = [];
    this.tableColumns = ['Tanggal', 'Properti', 'Unit', 'Pemasukan', 'Pengeluaran', 'Deskripsi'];
    this.chartVisible = false;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
    this.loadFinancialStatistic(propertyId);
  }

  openAddFinancialDialog(): void {
    const dialogRef = this.dialog.open(AddFinancialDialogComponent, {
      width: '400px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.financialService.addFinancialReport({
          property_id: result.property_id,
          unit_id: result.unit_id,
          income: result.income,
          expense: result.expense,
          description: result.description,
          date: result.date
        }).subscribe({
          next: (res) => {
            this.alertService.success((res as any)?.message || 'Laporan keuangan berhasil ditambahkan!');
          },
          error: (err) => {
            this.alertService.error((err?.error as any)?.message || 'Gagal menambah laporan keuangan.');
          }
        });
      }
    });
  }

  openAddIncomeDialog(): void {
    this.router.navigate(['/add-financial'], { queryParams: { type: 'income' } });
  }

  openAddExpenseDialog(): void {
    this.router.navigate(['/add-financial'], { queryParams: { type: 'expense' } });
  }

  onEditReport(row: any) {
    // Auto mapping fields
    const mapped = {
      id: row.id,
      property_id: row.property_id || this.selectedPropertyId,
      unit_id: row.unit_id,
      income: row.Pemasukan ?? row.income ?? 0,
      expense: row.Pengeluaran ?? row.expense ?? 0,
      date: row.Tanggal ?? row.date ?? '',
      description: row.Deskripsi ?? row.description ?? '',
      type: (row.Pemasukan ?? row.income ?? 0) !== 0 ? 'income' : ((row.Pengeluaran ?? row.expense ?? 0) !== 0 ? 'expense' : '')
    };
    const dialogRef = this.dialog.open(AddFinancialDialogComponent, {
      width: '400px',
      data: {
        mode: 'edit',
        ...mapped
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.ngOnInit();
    });
  }

  onDeleteReport(row: any) {
    if (confirm('Yakin ingin menghapus laporan ini?')) {
      // Panggil API DELETE /financial/{id}
      this.financialService.deleteFinancialReport(row.id).subscribe({
        next: (res) => {
          this.alertService.success((res as any)?.message || 'Laporan keuangan berhasil dihapus!');
          // Jika user belum melakukan filter data (default: semua properti, bulan/tahun berjalan)
          const now = new Date();
          const isDefaultFilter =
            this.filterType === 'month' &&
            this.filterYear === now.getFullYear() &&
            this.filterMonth === (now.getMonth() + 1) &&
            !this.selectedPropertyId;
          if (isDefaultFilter) {
            // Jalankan logic seperti ngOnInit untuk reload semua data
            this.ngOnInit();
          } else {
            this.applyFilters(); // Refresh data sesuai filter
          }
        },
        error: (err) => {
          this.alertService.error((err?.error as any)?.message || 'Gagal hapus laporan keuangan.');
        }
      });
    }
  }

  downloadTableAsPDF() {
    this.isLoading = true;
    const doc = new jsPDF();
    const columns = this.tableColumns;
    const rows = this.tableData.map(row => columns.map(col => row[col]));
    // Judul
    doc.text('Laporan Keuangan', 14, 16);
    // Info filter
    let filterInfo = '';
    if (this.filterType === 'year' && this.filterYear) {
      filterInfo = `Tahun: ${this.filterYear}`;
    } else if (this.filterType === 'month' && this.filterYear && this.filterMonth) {
      filterInfo = `Tahun: ${this.filterYear}, Bulan: ${this.filterMonth}`;
    } else if (this.filterType === 'date' && this.filterYear && this.filterMonth && this.filterDay) {
      filterInfo = `Tanggal: ${this.filterDay}-${this.filterMonth}-${this.filterYear}`;
    }
    if (this.selectedPropertyId) {
      const propName = this.getPropertyName(this.selectedPropertyId);
      filterInfo += filterInfo ? ` | Properti: ${propName}` : `Properti: ${propName}`;
    }
    if (filterInfo) {
      doc.setFontSize(10);
      doc.text(filterInfo, 14, 22);
    }
    // Tabel
    let tableStartY = filterInfo ? 28 : 22;
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: tableStartY,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [63,81,181] }
    });
    // Chart di bawah tabel
    const lastAutoTable = (doc as any).lastAutoTable;
    let chartY = lastAutoTable && lastAutoTable.finalY ? lastAutoTable.finalY + 10 : tableStartY + 80;
    const chartCanvas = this.myChartCanvas?.nativeElement;
    if (chartCanvas) {
      const chartImg = chartCanvas.toDataURL('image/png', 1.0);
      doc.addImage(chartImg, 'PNG', 14, chartY, 180, 120); // Increased height from 60 to 120
      chartY += 125;
    }
    const pieCanvas = this.pieChartCanvas?.nativeElement;
    if (pieCanvas) {
      const pieImg = pieCanvas.toDataURL('image/png', 1.0);
      doc.addImage(pieImg, 'PNG', 14, chartY, 80, 80); // Undo centering, back to left
    }
    doc.save('laporan-keuangan.pdf');
    this.isLoading = false;
  }

  // Tambahkan helper untuk ambil nama properti dan unit
  getPropertyName(propertyId: number): string {
    const prop = this.properties.find(p => p.id === propertyId);
    const name = prop ? prop.property_name : ''
    return name;
  }
  getUnitName(unitId: number): string {
    for (const prop of this.properties) {
      if (prop.units) {
        const unit = prop.units.find((u: any) => u.id === unitId);
        if (unit) return unit.unit_name;
      }
    }
    return '';
  }
}
