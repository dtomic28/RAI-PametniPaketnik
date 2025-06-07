import { Box, Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DashboardUsers({
  users,
  userForm,
  openAddUser,
  openEditUser,
  setOpenAddUser,
  setOpenEditUser,
  setUserForm,
  handleAddUser,
  handleUpdateUser,
  handleEditUser,
  handleDeleteUser,
}) {
  return (
    <>
      <Dialog open={openAddUser || openEditUser} onClose={() => { setOpenAddUser(false); setOpenEditUser(false); }}>
        <DialogTitle>{openAddUser ? "Add User" : "Edit User"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            value={userForm.username}
            onChange={e => setUserForm({ ...userForm, username: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            value={userForm.email}
            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={userForm.password}
            onChange={e => setUserForm({ ...userForm, password: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddUser(false); setOpenEditUser(false); }}>Cancel</Button>
          <Button
            onClick={openAddUser ? handleAddUser : handleUpdateUser}
            variant="contained"
          >
            {openAddUser ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setUserForm({ username: "", email: "", password: "" });
            setOpenAddUser(true)
          }}
        >
          Add User
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Transactions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u, i) => (
              <TableRow key={i} >
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.numberOfTransactions}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(u)} >
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteUser(u._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}