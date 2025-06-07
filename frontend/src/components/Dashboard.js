import React, { useState, useEffect } from "react";
import { AppBar,Tabs,Tab,Box,Typography,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Alert,Toolbar,Container,Grid,Card,CardContent,useTheme,Button,IconButton,Dialog,DialogTitle,DialogContent,DialogActions,TextField, Select,  MenuItem,InputLabel,FormControl} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InventoryIcon from "@mui/icons-material/Inventory";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DashboardQuickStats from "./DashboardQuickStats";
import DashboardUsers from "./DashboardUsers";
import DashboardTransactions from "./DashboardTransactions";
import DashboardLockboxes from "./DashboardLockboxes";
import DashboardItems from "./DashboardItems";
import DashboardUnwantedTransactions from "./DashboardUnwantedTransactions";

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
    const [transactionForm, setTransactionForm] = useState({ lockboxID: "", sellerID: null, buyerID: null, itemID: null, startedSellingTime: "", finishedSellingTime: null });

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
        fetch(`${window.REACT_APP_API_URL}/api/transaction/getOpen`)
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
        fetchUsers();
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
        fetchUsers();
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

                <DashboardQuickStats stats={stats} />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper elevation={3} sx={{ borderRadius: 2 }}>
                    <TabPanel value={tab} index={0}>

                        <DashboardUsers
                            users={users}
                            userForm={userForm}
                            openAddUser={openAddUser}
                            openEditUser={openEditUser}
                            setOpenAddUser={setOpenAddUser}
                            setOpenEditUser={setOpenEditUser}
                            setUserForm={setUserForm}
                            handleAddUser={handleAddUser}
                            handleUpdateUser={handleUpdateUser}
                            handleEditUser={handleEditUser}
                            handleDeleteUser={handleDeleteUser}
                        />                      
                    </TabPanel>
                    <TabPanel value={tab} index={1}>

                        <DashboardTransactions
                            openAddTransaction={openAddTransaction}
                            openEditTransaction={openEditTransaction}
                            setOpenAddTransaction={setOpenAddTransaction}
                            setOpenEditTransaction={setOpenEditTransaction}
                            transactionForm={transactionForm}
                            setTransactionForm={setTransactionForm}
                            handleAddTransaction={handleAddTransaction}
                            handleUpdateTransaction={handleUpdateTransaction}
                            handleEditTransaction={handleEditTransaction}
                            handleOpenAddTransaction={handleOpenAddTransaction}
                            transactions={transactions}
                            lockboxes={lockboxes}
                            users={users}
                            items={items}
                        />               
                       
                    </TabPanel>



                    <TabPanel value={tab} index={2}>
                        <DashboardLockboxes lockboxes={lockboxes} />
                    </TabPanel>


                    <TabPanel value={tab} index={3}>

                        <DashboardItems
                            openAddItem={openAddItem}
                            openEditItem={openEditItem}
                            setOpenAddItem={setOpenAddItem}
                            setOpenEditItem={setOpenEditItem}
                            editItem={editItem}
                            itemForm={itemForm}
                            setItemForm={setItemForm}
                            handleAddItem={handleAddItem}
                            handleUpdateItem={handleUpdateItem}
                            handleEditItem={handleEditItem}
                            handleDeleteItem={handleDeleteItem}
                            handleOpenAddItem={handleOpenAddItem}
                            items={items}
                        />

                    </TabPanel>
                    <TabPanel value={tab} index={4}>
                        <DashboardUnwantedTransactions unwantedTransactions={unwantedTransactions} />
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
}