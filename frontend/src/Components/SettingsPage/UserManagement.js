import * as React from 'react';
import { DataGrid, renderActionsCell } from '@mui/x-data-grid';
import { Button } from '@material-ui/core';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsersData } from '../../Redux/Actions/dataActions';
import { connect } from 'react-redux';


const removeButton = (params) => {
  return (
        <IconButton
            variant="contained"
            color="secondary"
            size="small"
            style={{ color: " #ff4a35 " }}
            onClick={() => {
                console.log(params)
            }}
        >
              <DeleteIcon />
        </IconButton>
  )
}

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'email', headerName: 'Email', width: 150 },
  { field: 'role', headerName: 'Role', width: 150 },
  { field: 'createdAt', headerName: 'Created At', width: 150 },
  { field: 'updatedAt', headerName: 'Updated At', width: 150 },
  { field: 'updateRole', headerName: 'Update User', width: 130, renderCell: removeButton },
  { field: 'remove', headerName: 'Remove User', width: 130, renderCell: removeButton },
  { field: 'sendPassword', headerName: 'Send Password Reset', width: 200, renderCell: removeButton },
];

const rows = [

];

function UserManagement({ getUsersData }) {
  return (
    <div style={{ height: 400, width: '100%' }} className="users-table">
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        checkboxSelection={false}
        disableColumnSelector={true}
        disableSelectionOnClick={true}
        disableRowSelector={true}
        rowsPerPageOptions={[5]}
      />
      <Button onClick={() => getUsersData()}>
        Send Users Request
      </Button>
    </div>
  );
}

const mapStateToProps = (state) => ({
});

const mapActionsToProps = {
  getUsersData
};

export default connect(mapStateToProps, mapActionsToProps)(UserManagement);

