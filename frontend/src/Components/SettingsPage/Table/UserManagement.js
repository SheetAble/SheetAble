import { Button } from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import { formatDistance } from "date-fns";
import * as React from "react";
import { connect } from "react-redux";
import { getUsersData } from "../../../Redux/Actions/dataActions";
import { createUser } from "../../../Redux/Actions/userActions";
import Modal from "../../Sidebar/Modal/Modal";
import CreateAccountContent from "../CreateAccountContent";
import RemoveButton from "./Buttons/RemoveButton";
import SendPasswordResetButton from "./Buttons/SendPasswordResetButton";
import UpdateButton from "./Buttons/UpdateButton";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "role", headerName: "Role", width: 150 },
  { field: "createdAt", headerName: "Created At", width: 150 },
  { field: "updatedAt", headerName: "Updated At", width: 150 },
  {
    field: "updateRole",
    headerName: "Update",
    width: 140,
    renderCell: UpdateButton,
  },
  {
    field: "sendPassword",
    headerName: "Reset Password",
    width: 140,
    renderCell: SendPasswordResetButton,
  },
  {
    field: "remove",
    headerName: "Remove",
    width: 140,
    renderCell: RemoveButton,
  },
];

function UserManagement({ getUsersData, users, createUser }) {
  React.useEffect(() => {
    // Get new users data on load
    getUsersData();
  }, []);

  const [rows, setRows] = React.useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = React.useState(false);

  React.useEffect(() => {
    let mappedUsers = [];
    users.map((user) => {
      const u = {
        id: user.id,
        email: user.email,
        role: user.role === 0 ? "Administrator" : "User",
        createdAt: formatDistance(new Date(user.created_at), new Date(), {
          addSuffix: true,
        }),
        updatedAt: formatDistance(new Date(user.updated_at), new Date(), {
          addSuffix: true,
        }),
      };

      return mappedUsers.push(u);
    });
    setRows(mappedUsers);
  }, []);

  return (
    <div
      style={{ height: "70vh", marginRight: "100px" }}
      className="users-table"
    >
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
      <Button
        onClick={() => setShowCreateUserModal(true)}
        style={{ marginTop: 10 }}
      >
        Add New User
      </Button>
      <Modal
        title="Create New Account"
        onClose={() => setShowCreateUserModal(false)}
        show={showCreateUserModal}
      >
        <CreateAccountContent
          createUser={createUser}
          onClose={() => setShowCreateUserModal(false)}
          getUsersData={getUsersData}
        />
      </Modal>
    </div>
  );
}

const mapStateToProps = (state) => ({
  users: state.data.usersData,
});

const mapActionsToProps = {
  getUsersData,
  createUser,
};

export default connect(mapStateToProps, mapActionsToProps)(UserManagement);
