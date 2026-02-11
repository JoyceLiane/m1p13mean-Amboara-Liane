// src/app/components/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, DashboardData } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  filteredUsers: any[] = [];
  loading = false;
  error: string | null = null;

  searchTerm = '';
  filterRole = 'all';
  filterStatus = 'all';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  selectedUser: any = null;
  showDeleteConfirm = false;
  userToDelete: any = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}


 ngOnInit(): void {
  console.log('ngOnInit appelé');
  this.loadDashboard();
}

loadDashboard(): void {
  console.log(' loadDashboard appelé');
  this.loading = true;
  this.error = null;

  this.adminService.getDashboard().subscribe({
    next: (data) => {
      console.log(' Data reçue:', data);
      console.log(' data.users:', data.users);
      console.log(' data.stats:', data.stats);
      
      this.dashboardData = data;
      console.log(' dashboardData assigné:', this.dashboardData);
      
      this.filteredUsers = data.users || [];
      console.log(' filteredUsers:', this.filteredUsers);
      console.log(' Nombre users:', this.filteredUsers.length);
      
      this.applyFilters();
      console.log(' Après applyFilters, filteredUsers:', this.filteredUsers.length);
      
      this.loading = false;
      console.log(' loading = false');
    },
    error: (err) => {
      console.error(' Error complet:', err);
      console.error(' Error status:', err.status);
      console.error(' Error message:', err.message);
      this.error = 'Erreur lors du chargement du dashboard';
      this.loading = false;
    }
  });
}
  applyFilters(): void {
    if (!this.dashboardData?.users) {
      this.filteredUsers = [];
      this.totalPages = 1;
      return;
    }

    let users = [...this.dashboardData.users];

    // Filtre recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      users = users.filter(u =>
        (u.prenom?.toLowerCase() || '').includes(term) ||
        (u.nom?.toLowerCase() || '').includes(term) ||
        (u.email?.toLowerCase() || '').includes(term)
      );
    }

    // Filtre rôle
    if (this.filterRole !== 'all') {
      users = users.filter(u => u.role_id?.nom === this.filterRole);
    }

    // Filtre statut
    if (this.filterStatus !== 'all') {
      users = users.filter(u => u.statut_id?.nom === this.filterStatus);
    }

    this.filteredUsers = users;
    this.totalPages = Math.ceil(users.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  //  CORRECTION: Getter roles avec vérification
  get roles(): string[] {
    if (!this.dashboardData?.stats?.byRole) {
      return [];
    }
    return Object.keys(this.dashboardData.stats.byRole);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  viewUser(user: any): void {
    this.selectedUser = user;
  }

  closeUserView(): void {
    this.selectedUser = null;
  }

  confirmDelete(user: any): void {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.userToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteUser(): void {
    if (!this.userToDelete?._id) return;

    this.adminService.deleteUser(this.userToDelete._id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.userToDelete = null;
        this.loadDashboard();
      },
      error: (err) => {
        console.error(' Delete error:', err);
        this.error = 'Erreur lors de la suppression';
      }
    });
  }

 toggleUserStatus(user: any): void {
  if (!user._id || !user.statut_id) return;

  const currentStatusNom = user.statut_id.nom;
  
  // IDs réels de ta base de données
  const STATUS_IDS = {
    'actif': '698b4e654563d7fc6600ccd6',
    'inactif': '698b4e654563d7fc6600ccd7'
  };
  
  // Détermine le nouveau statut
  const newStatusNom = currentStatusNom === 'actif' ? 'inactif' : 'actif';
  const newStatusId = STATUS_IDS[newStatusNom];
  
  console.log('🔄 Changement de statut:', {
    user: user.email,
    ancienStatut: currentStatusNom,
    nouveauStatut: newStatusNom,
    nouveauStatusId: newStatusId
  });
  
  this.adminService.updateUserStatus(user._id, newStatusId).subscribe({
    next: () => {
      console.log(' Statut changé avec succès');
      this.loadDashboard();
    },
    error: (err) => {
      console.error(' Status error:', err);
      this.error = 'Erreur lors du changement de statut';
    }
  });
}
  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-unknown';
    return status.toLowerCase() === 'actif' ? 'status-active' : 'status-inactive';
  }

  getRoleClass(role: string | undefined): string {
    if (!role) return 'role-default';
    
    const roleMap: { [key: string]: string } = {
      'admin': 'role-admin',
      'client': 'role-client',
      'boutique': 'role-boutique',
    };
    
    return roleMap[role.toLowerCase()] || 'role-default';
  }
}