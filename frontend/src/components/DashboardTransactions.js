import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Button, Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

export default function DashboardTransactions({
  openAddTransaction,
  openEditTransaction,
  setOpenAddTransaction,
  setOpenEditTransaction,
  transactionForm,
  setTransactionForm,
  handleAddTransaction,
  handleUpdateTransaction,
  handleEditTransaction,
  handleOpenAddTransaction,
  transactions,
  lockboxes,
  users,
  items
}) {
  return (
    <>
      {/* Transaction dialog box */}
      <Dialog open={openAddTransaction || openEditTransaction} onClose={() => { setOpenAddTransaction(false); setOpenEditTransaction(false); }}>
        <DialogTitle>{openAddTransaction ? "Add Transaction" : "Edit Transaction"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ my: 1 }} variant="outlined">
            <InputLabel id="lockbox-label">Lockbox</InputLabel>
            <Select
              labelId="lockbox-label"
              id="lockbox"
              value={transactionForm.lockboxID}
              label="Lockbox"
              onChange={e => setTransactionForm({ ...transactionForm, lockboxID: e.target.value })}
            >
              <MenuItem value=""><em>Select Lockbox</em></MenuItem>
              {lockboxes.map(box => (
                <MenuItem key={box._id} value={box._id}>{box.boxID}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ my: 1 }} variant="outlined">
            <InputLabel id="seller-label" shrink>Seller</InputLabel>
            <Select
              labelId="seller-label"
              value={transactionForm.sellerID}
              label="Seller"
              onChange={e => setTransactionForm({ ...transactionForm, sellerID: e.target.value })}
              displayEmpty
            >
              <MenuItem value=""><em>Select Seller</em></MenuItem>
              {users.map(user => (
                <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel id="buyer-label" shrink>Buyer</InputLabel>
            <Select
              labelId="buyer-label"
              value={transactionForm.buyerID}
              label="Buyer"
              onChange={e => setTransactionForm({ ...transactionForm, buyerID: e.target.value })}
              displayEmpty
            >
              <MenuItem value=""><em>Select Buyer</em></MenuItem>
              {users.map(user => (
                <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel id="item-label" shrink>Item</InputLabel>
            <Select
              labelId="item-label"
              value={transactionForm.itemID}
              label="Item"
              onChange={e => setTransactionForm({ ...transactionForm, itemID: e.target.value })}
              displayEmpty
            >
              <MenuItem value=""><em>Select Item</em></MenuItem>
              {items.map(item => (
                <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Started Selling Time"
            type="datetime-local"
            value={transactionForm.startedSellingTime}
            onChange={e => setTransactionForm({ ...transactionForm, startedSellingTime: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Finished Selling Time"
            type="datetime-local"
            value={transactionForm.finishedSellingTime}
            onChange={e => setTransactionForm({ ...transactionForm, finishedSellingTime: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddTransaction(false); setOpenEditTransaction(false); }}>Cancel</Button>
          <Button
            onClick={openAddTransaction ? handleAddTransaction : handleUpdateTransaction}
            variant="contained"
          >
            {openAddTransaction ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddTransaction}
        >
          Add Transaction
        </Button>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Lockbox</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Finished</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tr, i) => (
              <TableRow key={tr._id || i} >
                <TableCell>{tr._id}</TableCell>
                <TableCell>{tr.lockboxID?.boxID}</TableCell>
                <TableCell>{tr.sellerID?.username || "-"}</TableCell>
                <TableCell>{tr.buyerID?.username || "-"}</TableCell>
                <TableCell>{tr.itemID?.name || "-"}</TableCell>
                <TableCell>
                  {tr.startedSellingTime
                    ? new Date(tr.startedSellingTime).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {tr.finishedSellingTime
                    ? new Date(tr.finishedSellingTime).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditTransaction(tr)}>
                    <EditIcon />
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