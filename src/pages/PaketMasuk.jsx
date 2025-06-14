import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

export default function UserList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = localStorage.getItem("token");

  const fecthBarang = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/data-barang-masuk",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const barangs = Array.isArray(res.data.data) ? res.data.data : [];
      const barangsWithId = barangs.map((barang, index) => ({
        ...barang,
        id: index + 1,
        originalId: barang.id, // simpan ID asli dari database
      }));

      setRows(barangsWithId);
    } catch (err) {
      console.error("Gagal memuat data user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fecthBarang();
  }, []);

  const handleShowDetail = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/data-barang-all/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDetailData(res.data.data[0]); // sesuaikan dengan struktur respons dari API kamu
      setDetailModalOpen(true);
    } catch (err) {
      console.error("Gagal mengambil detail barang:", err);
      setSnackbar({
        open: true,
        message: "Gagal mengambil detail barang",
        severity: "error",
      });
    }
  };

  const handleUpdateStatusBarang = async (id) => {
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/api/update-status-barang/${id}`,
        { status: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fecthBarang();
      setDetailModalOpen(false);

      // Optional: tampilkan notifikasi
      setSnackbar({
        open: true,
        message: "Paket berhasil diproses ke pengiriman",
        severity: "success",
      });
    } catch (err) {
      console.error("Gagal memproses paket ke pengiriman:", err);
      setSnackbar({
        open: true,
        message: "Gagal memproses paket ke pengiriman",
        severity: "error",
      });
    }
  };

  const columns = [
    { field: "id", headerName: "No", width: 70 },
    { field: "kode_transaksi", headerName: "Kode Transaksi", width: 200 },
    { field: "nama_pengirim", headerName: "Nama Pengirim", width: 250 },
    { field: "nomor_hp", headerName: "Nomor HP", width: 250 },
    {
      field: "actions",
      type: "actions",
      headerName: "Aksi",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<InfoIcon />}
          label="Edit"
          onClick={() => handleShowDetail(params.row.originalId)}
        />,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Typography sx={{ fontSize: "1.5rem", fontWeight: "600" }}>
        Daftar Paket Masuk
      </Typography>

      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </div>

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Detail Paket
          </Typography>
          {detailData ? (
            <>
              <Typography>
                Kode Transaksi: {detailData.kode_transaksi}
                {/* console.log(detailData.id); */}
              </Typography>
              <Typography>Nama Pengirim: {detailData.nama_pengirim}</Typography>
              <Typography>Nomor HP: {detailData.nomor_hp}</Typography>
              <Typography>
                Alamat Pengiriman: {detailData.alamat_pengiriman}
              </Typography>
              <Typography>
                Tanggal Masuk:{" "}
                {new Date(detailData.created_at).toLocaleString()}
              </Typography>
            </>
          ) : (
            <Typography>Memuat data...</Typography>
          )}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={() => handleUpdateStatusBarang(detailData.id)}>
              Proses
            </Button>
            <Button onClick={() => setDetailModalOpen(false)}>Tutup</Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar Notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
