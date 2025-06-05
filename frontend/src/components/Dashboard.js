import React, { useState, useEffect } from "react";
import { AppBar,Tabs,Tab,Box,Typography,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Alert,Toolbar,Container,Grid,Card,CardContent,useTheme,Button,IconButton,Dialog,DialogTitle,DialogContent,DialogActions,TextField, Select,  MenuItem,InputLabel,FormControl} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InventoryIcon from "@mui/icons-material/Inventory";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index} style={{ width: "100%" }}>
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

export default function Dashboard() {
    const [tab, setTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [lockboxes, setLockboxes] = useState([]);
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const theme = useTheme();
    const [openAddUser, setOpenAddUser] = useState(false);
    const [openEditUser, setOpenEditUser] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [userForm, setUserForm] = useState({ username: "", email: "" });

    const [openAddTransaction, setOpenAddTransaction] = useState(false);
    const [openEditTransaction, setOpenEditTransaction] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const [transactionForm, setTransactionForm] = useState({ lockboxID: "", sellerID: "", buyerID: "", itemID: "", startedSellingTime: "", finishedSellingTime: "" });

    const [openAddItem, setOpenAddItem] = useState(false);
    const [openEditItem, setOpenEditItem] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [itemForm, setItemForm] = useState({ name: "", description: "", price: "", weight: "", isSelling: true, image: null });

    const [unwantedTransactions, setUnwantedTransactions] = useState([]);


    function handleEditUser(user) {
        setEditUser(user);
        setUserForm({ username: user.username, email: user.email, password: user.password });
        setOpenEditUser(true);
    }

    function handleEditTransaction(transaction) {
        setEditTransaction(transaction);
        setTransactionForm({
            lockboxID: transaction.lockboxID?._id || transaction.lockboxID || "",
            sellerID: transaction.sellerID?._id || transaction.sellerID || "",
            buyerID: transaction.buyerID?._id || transaction.buyerID || "",
            itemID: transaction.itemID?._id || transaction.itemID || "",
            startedSellingTime: transaction.startedSellingTime ? transaction.startedSellingTime.slice(0, 16) : "",
            finishedSellingTime: transaction.finishedSellingTime ? transaction.finishedSellingTime.slice(0, 16) : ""
        });
        setOpenEditTransaction(true);
    }

    function handleOpenAddTransaction() {
        setTransactionForm({
            lockboxID: "",
            sellerID: "",
            buyerID: "",
            itemID: "",
            startedSellingTime: "",
            finishedSellingTime: ""
        });
        setOpenAddTransaction(true);
    }

    function handleOpenAddItem() {
        setItemForm({
            name: "",
            description: "",
            price: "",
            weight: "",
            isSelling: true,
            image: null,
        });
        setOpenAddItem(true);
    }

    function handleEditItem(item) {
        setEditItem(item);
        setItemForm({
            name: item.name,
            description: item.description,
            price: item.price,
            weight: item.weight,
            isSelling: item.isSelling,
            image: null,
        });
        setOpenEditItem(true);
    }




    function fetchUsers() {
        fetch(`${window.REACT_APP_API_URL}/api/user/all`)
            .then((res) => res.json())
            .then(setUsers)
            .catch(() => setError("Failed to fetch users"));
    }

    function fetchTransactions() {
        fetch(`${window.REACT_APP_API_URL}/api/transaction/getCompleted`)
            .then((res) => res.json())
            .then(setTransactions)
            .catch(() => setError("Failed to fetch transactions"));
    }

    function fetchLockboxes() {
        fetch(`${window.REACT_APP_API_URL}/api/lockbox/all`)
            .then((res) => res.json())
            .then((data) => setLockboxes(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to fetch lockboxes"));
    }

    function fetchItems() {
        fetch(`${window.REACT_APP_API_URL}/api/item/getSellingItems`)
            .then((res) => res.json())
            .then(setItems)
            .catch(() => setError("Failed to fetch items"));
    }

    function fetchUnwantedTransactions() {
        fetch(`${window.REACT_APP_API_URL}/api/transaction/getUnwanted`)
            .then((res) => res.json())
            .then(setUnwantedTransactions)
            .catch(() => setError("Failed to fetch unwanted lockboxes"));
    }

    async function handleAddTransaction() {
        await fetch(`${window.REACT_APP_API_URL}/api/transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transactionForm),
        });
        setOpenAddTransaction(false);
        fetchTransactions();
        fetchLockboxes();
        fetchItems();
    }

    async function handleUpdateTransaction() {
        await fetch(`${window.REACT_APP_API_URL}/api/transaction/${editTransaction._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transactionForm),
        });
        setOpenEditTransaction(false);
        fetchTransactions();
        fetchLockboxes();
        fetchItems();
        fetchUnwantedTransactions();
    }

    async function handleAddItem() {
        const formData = new FormData();
        formData.append("name", itemForm.name);
        formData.append("description", itemForm.description);
        formData.append("price", itemForm.price);
        formData.append("weight", itemForm.weight);
        formData.append("isSelling", itemForm.isSelling);
        if (itemForm.image) formData.append("image", itemForm.image);

        await fetch(`${window.REACT_APP_API_URL}/api/item`, {
            method: "POST",
            body: formData,
        });
        setOpenAddItem(false);
        fetchItems();
    }

    async function handleUpdateItem() {
        const formData = new FormData();
        formData.append("name", itemForm.name);
        formData.append("description", itemForm.description);
        formData.append("price", itemForm.price);
        formData.append("weight", itemForm.weight);
        formData.append("isSelling", itemForm.isSelling);
        if (itemForm.image) formData.append("image", itemForm.image);

        await fetch(`${window.REACT_APP_API_URL}/api/item/${editItem._id}`, {
            method: "PUT",
            body: formData,
        });
        setOpenEditItem(false);
        fetchItems();
    }

    async function handleDeleteItem(id) {
        await fetch(`${window.REACT_APP_API_URL}/api/item/${id}`, {
            method: "DELETE",
        });
        fetchItems();
    }

    useEffect(() => {
        fetchUsers();
        fetchTransactions();
        fetchLockboxes();
        fetchItems();
        fetchUnwantedTransactions();
    }, []);

    async function handleAddUser() {
        await fetch(`${window.REACT_APP_API_URL}/api/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userForm),
        });
        setOpenAddUser(false);
        fetchUsers();
    }

    async function handleUpdateUser() {
        await fetch(`${window.REACT_APP_API_URL}/api/user/${editUser._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userForm),
        });
        setOpenEditUser(false);
        fetchUsers();
    }

    async function handleDeleteUser(id) {
        await fetch(`${window.REACT_APP_API_URL}/api/user/${id}`, {
            method: "DELETE",
        });
        fetchUsers();
    }

    // Quick stats
    const stats = [
        {
            label: "Users",
            value: users.length,
            icon: <PeopleIcon color="primary" fontSize="large" />,
        },
        {
            label: "Open Transactions",
            value: transactions.length,
            icon: <ListAltIcon color="primary" fontSize="large" />,
        },
        {
            label: "Lockboxes",
            value: lockboxes.length,
            icon: <LockIcon color="primary" fontSize="large" />,
        },
        {
            label: "Unsold Items",
            value: items.length,
            icon: <InventoryIcon color="primary" fontSize="large" />,
        },
        {
            label: "Unwanted Transactions",
            value: unwantedTransactions.length,
            icon: <LockIcon color="error" fontSize="large" />,
        }

    ];

    return (
        <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: theme.palette.background[100], py: 4 }}>
            <Container maxWidth="lg">
                <AppBar position="static" color="primary" sx={{ borderRadius: 2, mb: 3 }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Admin Dashboard
                        </Typography>
                    </Toolbar>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        centered
                        textColor="inherit"
                        indicatorColor="secondary"
                    >
                        <Tab icon={<PeopleIcon />} label="Users" />
                        <Tab icon={<ListAltIcon />} label="Transactions" />
                        <Tab icon={<LockIcon />} label="Lockboxes" />
                        <Tab icon={<InventoryIcon />} label="Items" />
                        <Tab icon={<LockIcon color="error" />} label="Unwanted Transactions" onClick={fetchUnwantedTransactions} />
                    </Tabs>
                </AppBar>

                {/* Quick stats cards */}
                <Grid
                    container
                    spacing={3}
                    sx={{ mb: 3 }}
                    justifyContent="center"
                    alignItems="stretch"
                >
                    {stats.map((stat) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={3}
                            key={stat.label}
                            sx={{ display: "flex", justifyContent: "center" }}
                        >
                            <Card
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    p: 3,
                                    minWidth: 200,
                                    minHeight: 140,
                                    boxShadow: 3,
                                }}
                            >
                                <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                                <Typography variant="h5" align="center">
                                    {stat.value}
                                </Typography>
                                <Typography color="text.secondary" align="center">
                                    {stat.label}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper elevation={3} sx={{ borderRadius: 2 }}>
                    <TabPanel value={tab} index={0}>

                        {/* User dialog box*/}
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
                                }
                                } >
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
                    </TabPanel>
                    <TabPanel value={tab} index={1}>

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
                    </TabPanel>



                    <TabPanel value={tab} index={2}>
                        <Typography variant="h6" gutterBottom>
                            Lockboxes
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Box ID</TableCell>
                                        <TableCell>Last Opened By</TableCell>
                                        <TableCell>Last Opened Time</TableCell>
                                        <TableCell>Stored Item</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lockboxes.map((box, i) => (
                                        <TableRow key={box.boxID || i}>
                                            <TableCell>{box.boxID || "-"}</TableCell>
                                            <TableCell>{box.lastOpenedPerson?.username || "-"}</TableCell>
                                            <TableCell>{box.lastOpenedTime ? new Date(box.lastOpenedTime).toLocaleString() : "-"}</TableCell>
                                            <TableCell>{box.storedItem?.name || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>


                    <TabPanel value={tab} index={3}>

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
                    </TabPanel>
                    <TabPanel value={tab} index={4}>
                        <Typography variant="h6" gutterBottom>
                            Unwanted Transactions
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Lockbox</TableCell>
                                        <TableCell>Last activity</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {unwantedTransactions.map((tr, i) => (
                                        <TableRow key={tr._id || i} >
                                            <TableCell>{tr._id}</TableCell>
                                            <TableCell>{tr.lockboxID?.boxID}</TableCell>
                                            <TableCell>{tr.startedSellingTime ? new Date(tr.startedSellingTime).toLocaleString() : "-"}</TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
}