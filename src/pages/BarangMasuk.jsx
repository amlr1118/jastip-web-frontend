import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from "@mui/x-data-grid";
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

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [userForm, setUserForm] = useState({ 
    id: null, name: "", email: "", password: "", });
  const [errors, setErrors] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersWithId = res.data.map((user, index) => ({
        ...user,
        id: index + 1,
        originalId: user.id, // simpan ID asli dari database
      }));

      setRows(usersWithId);
    } catch (err) {
      console.error("Gagal memuat data user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setUserForm({ id: null, name: "", email: "", password: "", });
    setErrors({});
    setIsEdit(false);
  };

  const validate = () => {
    const err = {};
    if (!userForm.name.trim()) err.name = "Nama wajib diisi";
    if (!userForm.email.trim()) {
      err.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      err.email = "Format email tidak valid";
    }
    if (!userForm.password.trim()) err.password = "Password wajib diisi";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:8000/api/users/${userForm.originalId}`,
          userForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: "User berhasil diupdate", severity: "success" });
      } else {
        await axios.post("http://localhost:8000/api/register", userForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: "User berhasil ditambahkan", severity: "success" });
      }

      fetchUsers();
      handleModalClose();
    } catch (err) {
      console.error("Gagal menyimpan user:", err);
      setSnackbar({ open: true, message: "Gagal menyimpan user", severity: "error" });
    }
  };

  const handleEdit = (params) => {
    setIsEdit(true);
    setUserForm({
      id: params.id,
      originalId: params.row.originalId,
      name: params.row.name,
      email: params.row.email,
   
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/users/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: "User berhasil dihapus", severity: "success" });
      fetchUsers();
    } catch (err) {
      console.error("Gagal menghapus user:", err);
      setSnackbar({ open: true, message: "Gagal menghapus user", severity: "error" });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const columns = [
    { field: "id", headerName: "No", width: 70 },
    { field: "name", headerName: "Username", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "actions",
      type: "actions",
      headerName: "Aksi",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleEdit(params)} />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Hapus"
          onClick={() => setDeleteDialog({ open: true, id: params.row.originalId })}
        />,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Typography sx={{ fontSize: "1.5rem", fontWeight: "600" }}>
        Daftar Barang Masuk
      </Typography>

      <Button variant="contained" onClick={() => setModalOpen(true)} sx={{ width: "200px", mb: 2 }}>
        Tambah User
      </Button>

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

      {/* Modal Tambah/Edit User */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            {isEdit ? "Edit User" : "Tambah User"}
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Nama"
            name="name"
            value={userForm.name}
            onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={userForm.email}
            onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            value={userForm.password}
            type="password"
            onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
            error={!!errors.password}
            helperText={errors.password}
          />

          <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
            <Button variant="outlined" onClick={handleModalClose}>Batal</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEdit ? "Update" : "Simpan"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus user ini?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Batal</Button>
          <Button color="error" onClick={handleDelete}>Hapus</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
