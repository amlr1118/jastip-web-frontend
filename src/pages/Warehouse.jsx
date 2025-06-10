import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Typography } from "@mui/material";

const rows = [
  { id: 1, gudang: "Hello", lokasi: "World" },
  { id: 2, gudang: "DataGridPro", lokasi: "is Awesome" },
  { id: 3, gudang: "MUI", lokasi: "is Amazing" },
];

const columns = [
  { field: "gudang", headerName: "Warehouse Name", width: 300 },
  { field: "lokasi", headerName: "Location", width: 150 },
];

export default function Warehouse() {
  return (
    <div className="flex flex-col gap-2">
      <Typography sx={{ fontSize: "1.5rem", fontWeight: "600" }}>
        Warehouse
      </Typography>
      <div style={{ height: 300, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </div>
    </div>
  );
}
