import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const boxIds = [352, 358, 359, 529, 530, 537, 538, 539, 540, 541, 542];

function Log() {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("Completed Transactions");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL?.trim() || "";

  const fetchTransactions = async (url, label) => {
    setTitle(label);
    setError("");
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setTransactions([]);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTransactions(
      `${apiUrl}/api/transaction/getCompleted`,
      "Completed Transactions"
    );
  }, []);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Paketnik Transactions
          </Typography>
          <Button
            color="inherit"
            onClick={() =>
              fetchTransactions(
                `${apiUrl}/api/transaction/getUnwanted`,
                "Unwanted Transactions"
              )
            }
          >
            Unwanted
          </Button>
          <Button
            color="inherit"
            onClick={() =>
              fetchTransactions(
                `${apiUrl}/api/transaction/getCompleted`,
                "Completed Transactions"
              )
            }
          >
            Completed
          </Button>
          <Button
            color="inherit"
            onClick={() =>
              fetchTransactions(
                `${apiUrl}/api/transaction/getOpen`,
                "Open Transactions"
              )
            }
          >
            Open
          </Button>
          <Box sx={{ display: { xs: "none", sm: "block" }, ml: 2 }}>
            {boxIds.map((id) => (
              <Button
                key={id}
                color="inherit"
                onClick={() =>
                  fetchTransactions(
                    `${apiUrl}/api/transaction/getByBoxID/${id}`,
                    `Box ${id}`
                  )
                }
                sx={{ mx: 0.5 }}
              >
                Box {id}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Lockbox</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Finished</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row._id}</TableCell>
                  <TableCell>{row.lockboxID}</TableCell>
                  <TableCell>{row.sellerID?.username || "-"}</TableCell>
                  <TableCell>{row.buyerID?.username || "-"}</TableCell>
                  <TableCell>{row.itemID?.name || "-"}</TableCell>
                  <TableCell>
                    {row.startedSellingTime
                      ? new Date(row.startedSellingTime).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {row.finishedSellingTime
                      ? new Date(row.finishedSellingTime).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default Log;
