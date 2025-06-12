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
  const [barangForm, setBarangForm] = useState({
    kode_trans: "",
    berat: "",
    ongkir: "",
    nama_kapal: "",
    estimasi_tiba: "",
  });
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("token");

  const fecthBarang = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/pengiriman_paket",
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

  const handleModalClose = () => {
    setDetailModalOpen(false);
    setBarangForm({
      kode_trans: "",
      berat: "",
      ongkir: "",
      nama_kapal: "",
      estimasi_tiba: "",
    });
    setErrors({});
  };

  const validate = () => {
    const err = {};
    if (!barangForm.kode_trans.trim())
      err.kode_trans = "Kode transaksi wajib diisi";

    if (!barangForm.berat.trim()) err.berat = "Berat barang wajib diisi";

    if (!barangForm.ongkir.trim()) err.ongkir = "Ongkir wajib diisi";

    if (!barangForm.nama_kapal.trim())
      err.nama_kapal = "Nama kapal wajib diisi";

    if (!barangForm.estimasi_tiba.trim())
      err.estimasi_tiba = "Estimasi tiba barang wajib diisi";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleShowDetail = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/data-barang-all/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDetailData(res.data.data[0]); // sesuaikan dengan struktur respons dari API kamu
      setBarangForm({
        kode_trans: detailData.kode_transaksi,
        berat: "",
        ongkir: "",
        nama_kapal: "",
        estimasi_tiba: "",
      });
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

  const handleUpdateStatusPengiriman = async (id) => {
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/api/update-status-pengiriman/${id}`,
        { dikirim: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Optional: tampilkan notifikasi
      // setSnackbar({
      //   open: true,
      //   message: "Paket berhasil diproses ke pengiriman",
      //   severity: "success",
      // });
    } catch (err) {
      console.error("Gagal memproses paket ke pengiriman:", err);
      setSnackbar({
        open: true,
        message: "Gagal memproses paket ke pengiriman",
        severity: "error",
      });
    }
  };

  const handleTransaksiBarangKeluar = async () => {
    if (!validate()) return;
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/simpan-barang-keluar`,
        barangForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      handleUpdateStatusPengiriman(detailData.id);
      fecthBarang();
      setDetailModalOpen(false);

      // Optional: tampilkan notifikasi
      setSnackbar({
        open: true,
        message: "Transaksi pengiriman paket berhasil",
        severity: "success",
      });
    } catch (err) {
      console.error("Gagal memproses pengiriman paket:", err);
      setSnackbar({
        open: true,
        message: "Gagal memproses pengiriman paket",
        severity: "error",
      });
    }
  };

  const columns = [
    { field: "id", headerName: "No", width: 70 },
    { field: "kode_transaksi", headerName: "Kode Transaksi", width: 200 },
    { field: "nama_pengirim", headerName: "Nama Penerima", width: 250 },
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
        Daftar Pengiriman Paket
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

      <Modal open={detailModalOpen} onClose={handleModalClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            Transaksi Pengiriman Paket
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Kode Transaksi"
            name="kode_trans"
            value={barangForm.kode_trans}
            onChange={(e) =>
              setBarangForm((prev) => ({ ...prev, kode_trans: e.target.value }))
            }
            error={!!errors.kode_trans}
            helperText={errors.kode_trans}
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Berat Barang(Kg)"
            name="berat"
            type="number"
            value={barangForm.berat}
            onChange={(e) =>
              setBarangForm((prev) => ({ ...prev, berat: e.target.value }))
            }
            error={!!errors.berat}
            helperText={errors.berat}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Ongkos Kirim"
            name="ongkir"
            value={barangForm.password}
            onChange={(e) =>
              setBarangForm((prev) => ({ ...prev, ongkir: e.target.value }))
            }
            error={!!errors.ongkir}
            helperText={errors.ongkir}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Nama Kapal"
            name="nama_kapal"
            value={barangForm.nama_kapal}
            onChange={(e) =>
              setBarangForm((prev) => ({ ...prev, nama_kapal: e.target.value }))
            }
            error={!!errors.nama_kapal}
            helperText={errors.nama_kapal}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Estimasi Tiba"
            type="date"
            name="estimasi_tiba"
            value={barangForm.estimasi_tiba}
            onChange={(e) =>
              setBarangForm((prev) => ({
                ...prev,
                estimasi_tiba: e.target.value,
              }))
            }
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
            <Button variant="outlined" onClick={handleModalClose}>
              Batal
            </Button>
            <Button variant="contained" onClick={handleTransaksiBarangKeluar}>
              Proses
            </Button>
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
