import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import usePurchaseOrders from '../hooks/usePurchaseOrders';
import { CircularProgress, Box, Typography } from '@mui/material';

const PurchaseOrdersPage = () => {
  const { purchaseOrders, loading } = usePurchaseOrders();

  const columns = [
    { field: 'Orden de Compra', headerName: 'Orden de Compra', width: 150 },
    { field: 'Proveedor', headerName: 'Proveedor', width: 200 },
    {
      field: 'Fecha envio',
      headerName: 'Fecha envio',
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    { field: 'Importe total', headerName: 'Importe total', type: 'number', width: 150 },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando órdenes de compra...</Typography>
      </Box>
    );
  }

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={purchaseOrders}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.id}
        disableSelectionOnClick
      />
    </div>
  );
};

export default PurchaseOrdersPage;
