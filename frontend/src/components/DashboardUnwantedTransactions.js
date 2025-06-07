import React from "react";
import { Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function DashboardUnwantedTransactions({ unwantedTransactions }) {
  return (
    <>
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
              <TableRow key={tr._id || i}>
                <TableCell>{tr._id}</TableCell>
                <TableCell>{tr.lockboxID?.boxID}</TableCell>
                <TableCell>
                  {tr.startedSellingTime
                    ? new Date(tr.startedSellingTime).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}