import React from "react";
import { Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function DashboardLockboxes({ lockboxes }) {
  return (
    <>
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
                <TableCell>
                  {box.lastOpenedTime
                    ? new Date(box.lastOpenedTime).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>{box.storedItem?.name || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}