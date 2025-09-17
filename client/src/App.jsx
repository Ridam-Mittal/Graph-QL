import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_USERS = gql`
  query {
    getUsers {
      id
      name
      age
      isMarried
    }
  }
`;

const GET_USER_BY_ID = gql`
  query ($id: ID!) {
    getUserById(id: $id) {
      id
      name
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $age: Int!, $isMarried: Boolean!) {
    createUser(name: $name, age: $age, isMarried: $isMarried) {
      name
      age
      isMarried
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

function App() {
  const { data, error, loading } = useQuery(GET_USERS);
  const [chosenId, setChosenId] = useState("");
  const [newUser, setNewUser] = useState({ name: "", age: "", isMarried: false });

  const {
    data: userData,
    error: userError,
    loading: userLoading,
  } = useQuery(GET_USER_BY_ID, {
    variables: { id: chosenId },
    skip: !chosenId || Number(chosenId) < data.getUsers[0].id || Number(chosenId) > data.getUsers[data.getUsers.length-1].id,
  });

  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  if (loading || userLoading) return <p>Loading...</p>;
  if (error || userError) return <p>Error: {error?.message || userError?.message}</p>;

  const nextId =
    data.getUsers.length > 0
      ? String(Number(data.getUsers[data.getUsers.length - 1].id) + 1)
      : "1";

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f4f8", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#1e3a8a" }}>User Management</h1>
      
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* Users List */}
        <div
          style={{
            flex: "1 1 300px",
            maxHeight: "500px",
            overflowY: "auto",
            padding: "10px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
        >
          <h2 style={{ color: "#1e40af" }}>All Users</h2>
          {data.getUsers.map((user) => (
            <div key={user.id} style={{ marginBottom: "12px", padding: "10px", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
              <p><b>ID:</b> {user.id}</p>
              <p><b>Name:</b> {user.name}</p>
              <p><b>Age:</b> {user.age}</p>
              <p><b>Married:</b> {user.isMarried ? "Yes" : "No"}</p>
              <button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
                onClick={() => deleteUser({ variables: { id: user.id } })}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Create and Search Section */}
        <div style={{ flex: "1 1 300px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
          {/* Create User */}
          <h2 style={{ color: "#1e40af" }}>Create New User</h2>
          <p>Next ID (auto-calculated): <b>{nextId}</b></p>
          <input
            style={{ display: "block", marginBottom: "8px", width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            style={{ display: "block", marginBottom: "8px", width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            type="number"
            placeholder="Age"
            value={newUser.age}
            onChange={(e) => setNewUser({ ...newUser, age: Number(e.target.value) })}
          />
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={newUser.isMarried}
              onChange={(e) => setNewUser({ ...newUser, isMarried: e.target.checked })}
            />{" "}
            Married
          </label>
          <button
            style={{ padding: "8px 12px", cursor: "pointer", backgroundColor: "#1e40af", color: "#fff", border: "none", borderRadius: "4px" }}
            onClick={() => {
              createUser({
                variables: {
                  name: newUser.name,
                  age: newUser.age,
                  isMarried: newUser.isMarried,
                },
              })
              setNewUser({ name: "", age: "", isMarried: false })}
            }
          >
            Create
          </button>

          <hr style={{ margin: "20px 0" }} />

          {/* Search User by ID */}
          <h2 style={{ color: "#1e40af" }}>Search User by ID</h2>
          <input
            style={{ display: "block", marginBottom: "12px", width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            type="number"
            placeholder="Enter user ID"
            value={chosenId}
            min={data.getUsers[0].id}
            max={data.getUsers[data.getUsers.length - 1].id}
            onChange={(e) => setChosenId(e.target.value)} // remove the range check
          />
          {userData ? (
            <div style={{ padding: "6px", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "#f1f5f9" }}>
              <p><b>ID:</b> {userData.getUserById.id}</p>
              <p><b>Name:</b> {userData.getUserById.name}</p>
            </div>
          ): chosenId && (
            <div> No User found with this ID..</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
