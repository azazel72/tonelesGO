import { ChangeDetectionStrategy, Component, OnInit, computed } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { AgGridAngular } from "ag-grid-angular";
import { ColDef, GridOptions } from "ag-grid-community";
import { UserDto } from "../../core/api/generated/models";
import { UsersStore } from "../users/users.store";

@Component({
  selector: "app-main-table-page",
  standalone: true,
  imports: [MatCardModule, MatButtonModule, AgGridAngular],
  templateUrl: "./main-table.page.html",
  styleUrl: "./main-table.page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainTablePage implements OnInit {
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly total = this.store.total;
  protected readonly rowData = computed(() => this.store.users());

  protected readonly columnDefs: ColDef<UserDto>[] = [
    { field: "id", headerName: "ID", maxWidth: 90, sortable: true, filter: "agNumberColumnFilter", editable: false },
    { field: "username", headerName: "Usuario", sortable: true, filter: "agTextColumnFilter", editable: true },
    { field: "fullname", headerName: "Nombre", sortable: true, filter: "agTextColumnFilter", editable: true },
    { field: "role_id", headerName: "Rol", sortable: true, filter: "agNumberColumnFilter", editable: true }
  ];

  protected readonly gridOptions: GridOptions<UserDto> = {
    pagination: true,
    paginationPageSize: 50,
    defaultColDef: {
      editable: true,
      filter: true,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 140
    },
    rowSelection: "single",
    enableCellTextSelection: true,
    ensureDomOrder: true,
    onCellValueChanged: (event) => {
      if (!event.data?.id || !event.colDef.field) return;
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

