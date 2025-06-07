import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function DashboardItems({
  openAddItem,
  openEditItem,
  setOpenAddItem,
  setOpenEditItem,
  editItem,
  itemForm,
  setItemForm,
  handleAddItem,
  handleUpdateItem,
  handleEditItem,
  handleDeleteItem,
  handleOpenAddItem,
  items
}) {
  return (
    <>
      <Dialog open={openAddItem || openEditItem} onClose={() => { setOpenAddItem(false); setOpenEditItem(false); }}>
        <DialogTitle>{openAddItem ? "Add Item" : "Edit Item"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={itemForm.name}
            onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={itemForm.description}
            onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            type="number"
            value={itemForm.price}
            onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Weight"
            type="number"
            value={itemForm.weight}
            onChange={e => setItemForm({ ...itemForm, weight: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="isSelling-label">Is Selling</InputLabel>
            <Select
              labelId="isSelling-label"
              value={itemForm.isSelling}
              label="Is Selling"
              onChange={e => setItemForm({ ...itemForm, isSelling: e.target.value === "true" })}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            {itemForm.image ? "Change Image" : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => setItemForm({ ...itemForm, image: e.target.files[0] })}
            />
          </Button>
          {openEditItem && editItem?.imageLink && (
            <Box mt={2}>
              <Typography variant="caption">Current image:</Typography>
              <img src={`${window.REACT_APP_API_URL}/${editItem.imageLink}`} alt="item" style={{ maxWidth: 100, display: "block" }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddItem(false); setOpenEditItem(false); }}>Cancel</Button>
          <Button
            onClick={openAddItem ? handleAddItem : handleUpdateItem}
            variant="contained"
          >
            {openAddItem ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Items
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddItem}
        >
          Add Item
        </Button>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Is Selling</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={item._id || i} >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.weight || "-"}</TableCell>
                <TableCell>{item.isSelling ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteItem(item._id)}>
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
