import * as React from 'react';
import { DataGrid, renderActionsCell } from '@mui/x-data-grid';
import { Button } from '@material-ui/core';
import { getUsersData } from '../../../Redux/Actions/dataActions';
import { connect } from 'react-redux';
import { formatDistance, subDays } from 'date-fns'
import RemoveButton from './Buttons/RemoveButton';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'role', headerName: 'Role', width: 150 },
  { field: 'createdAt', headerName: 'Created At', width: 150 },
  { field: 'updatedAt', headerName: 'Updated At', width: 150 },
  { field: 'updateRole', headerName: 'Update', width: 90, renderCell: RemoveButton, value: "test" },
  { field: 'remove', headerName: 'Remove', width: 90, renderCell: RemoveButton },
  { field: 'sendPassword', headerName: 'Send Password Reset', width: 170, renderCell: RemoveButton },
];


function UserManagement({ getUsersData, users }) {
  
  const [rows, setRows] = React.useState([])

  React.useEffect(() => {
    let mappedUsers = []
    users.map(user => {
      const u = {  
        id: user.id, 
        email: user.email,
        role: user.role == 0 ? "Administrator" : "User", 
        createdAt: formatDistance(new Date(user.created_at), new Date(), { addSuffix: true }), 
        updatedAt: formatDistance(new Date(user.updated_at), new Date(), { addSuffix: true }), 
      }

      mappedUsers.push(u)
    })
    setRows(mappedUsers)
  }, [])


  return (
    <div style={{ height: '70vh', marginRight: '100px'}} className="users-table">
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        checkboxSelection={false}
        disableColumnSelector={true}
        disableSelectionOnClick={true}
        disableRowSelector={true}
        rowsPerPageOptions={[10]}
      />
      <Button onClick={() => getUsersData()}>
        Send Users Request
      </Button>
    </div>
  );
}

const mapStateToProps = (state) => ({
    users: state.data.usersData,
});

const mapActionsToProps = {
  getUsersData,
};

export default connect(mapStateToProps, mapActionsToProps)(UserManagement);

