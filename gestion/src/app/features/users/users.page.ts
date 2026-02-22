import { ChangeDetectionStrategy, Component, OnInit, computed } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { AgGridAngular } from "ag-grid-angular";
import { ColDef, GridOptions } from "ag-grid-community";
import { UsersStore } from "./users.store";
import { UserDto } from "../../core/api/generated/models";

@Component({
  selector: "app-users-page",
  standalone: true,
  imports: [MatCardModule, MatButtonModule, AgGridAngular],
  templateUrl: "./users.page.html",
  styleUrl: "./users.page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPage implements OnInit {
  protected readonly users = this.store.users;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly total = this.store.total;
  protected readonly rowData = computed(() => this.users());

  protected readonly columnDefs: ColDef<UserDto>[] = [
    { field: "id", headerName: "ID", maxWidth: 90, filter: "agNumberColumnFilter", editable: false, sortable: true },
    { field: "username", headerName: "Username", filter: "agTextColumnFilter", editable: true, sortable: true },
    { field: "fullname", headerName: "Full Name", filter: "agTextColumnFilter", editable: true, sortable: true },
    { field: "role_id", headerName: "Role", filter: "agNumberColumnFilter", editable: true, sortable: true }
  ];

  protected readonly gridOptions: GridOptions<UserDto> = {
    pagination: true,
    paginationPageSize: 25,
    defaultColDef: {
      resizable: true,
      flex: 1,
      minWidth: 140,
      filter: true,
      editable: true
    },
    suppressRowClickSelection: false,
    rowSelection: "single",
    enableCellTextSelection: true,
    ensureDomOrder: true,
    onCellValueChanged: (event) => {
      if (!event.data?.id || event.colDef.field == null) return;
      const field = event.colDef.field as keyof UserDto;
      const patch = { [field]: event.newValue } as Partial<UserDto>;
      void this.store.updateCell(event.data.id, patch);
    }
  };

  constructor(private readonly store: UsersStore) {}

  ngOnInit(): void {
    void this.store.load();
  }

  protected refresh(): void {
    void this.store.load();
  }
}
