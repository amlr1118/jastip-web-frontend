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
import CheckIcon from "@mui/icons-material/Check";

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

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const token = localStorage.getItem("token");

  const fecthBarang = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/data-riwayat-barang-keluar",
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
      console.error("Gagal memuat data barang:", err);
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
        `http://localhost:8000/api/detail-riwayat-barang-keluar/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDetailData(res.data.data[0]); // sesuaikan dengan struktur respons dari API kamu
      setDetailModalOpen(true);
      console.log(detailData);
    } catch (err) {
      console.error("Gagal mengambil detail barang:", err);
      setSnackbar({
        open: true,
        message: "Gagal mengambil detail barang",
        severity: "error",
      });
    }
  };

  const ambilPaket = async () => {
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    try {
      await axios.put(
        `http://localhost:8000/api/ambil-paket/${deleteDialog.id}`,
        { status: 1, diambil: 1, tanggal_diambil: today },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: "Paket berhasil diambil",
        severity: "success",
      });
      fecthBarang();
    } catch (err) {
      console.error("Gagal mengambil paket:", err);
      setSnackbar({
        open: true,
        message: "Gagal mengambil paket",
        severity: "error",
      });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const columns = [
    { field: "id", headerName: "No", width: 50 },
    { field: "kode_trans", headerName: "Kode Transaksi", width: 200 },
    { field: "nama_pengirim", headerName: "Nama Penerima", width: 250 },
    { field: "nama_kapal", headerName: "Nama Kapal", width: 200 },
    { field: "estimasi_tiba", headerName: "Estimasi Tiba", width: 250 },
    {
      field: "status",
      headerName: "Status Paket",
      width: 180,
      renderCell: (params) => (
        <span>
          {params.value === 1 ? "Paket sudah diambil" : "Paket belum diambil"}
        </span>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Aksi",
      width: 120,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<InfoIcon />}
            label="Detail"
            onClick={() => handleShowDetail(params.row.originalId)}
          />,
        ];

        // Tampilkan tombol "AmbilPaket" hanya jika status === 0
        if (params.row.status === 0) {
          actions.push(
            <GridActionsCellItem
              icon={<CheckIcon />}
              label="AmbilPaket"
              onClick={() =>
                setDeleteDialog({ open: true, id: params.row.originalId })
              }
            />
          );
        }

        return actions;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Typography sx={{ fontSize: "1.5rem", fontWeight: "600" }}>
        Daftar Paket Terkirim
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
            Detail Barang
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
                Alamat Penerima: {detailData.alamat_pengiriman}
              </Typography>
              <Typography>Berat(Kg): {detailData.berat}</Typography>
              <Typography>Ongkir: {detailData.ongkir}</Typography>
              <Typography>Nama Kapal: {detailData.nama_kapal}</Typography>
              <Typography>Estimasi_tiba: {detailData.estimasi_tiba}</Typography>
              <Typography>
                Tanggal Pengiriman:{" "}
                {new Date(detailData.created_at).toLocaleString()}
              </Typography>
              <Typography>
                Tanggal diterima: {detailData.tanggal_diambil}
              </Typography>
            </>
          ) : (
            <Typography>Memuat data...</Typography>
          )}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={() => setDetailModalOpen(false)}>Tutup</Button>
          </Box>
        </Box>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Konfirmasi Penerima Paket</DialogTitle>
        <DialogContent>
          <DialogContentText>Yakin mengambil paket?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Tutup
          </Button>
          <Button color="error" onClick={ambilPaket}>
            Ambil Paket
          </Button>
        </DialogActions>
      </Dialog>

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
