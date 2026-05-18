import { useEffect, useState } from "react";
import axios from "axios";
import { apiPath } from "../config/api";
import SeoHead from "../components/SeoHead";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(apiPath("/api/auth/users"))
      .then((res) => setUsers(res.data))
      .catch(() => setError("Unable to load users right now."));
  }, []);

  return (
    <div className="page">
      <SeoHead title="User Management | Gulkaar" description="Admin user management dashboard." keywords="admin,users,management" />
      <div className="page-header">
        <h1>User Management</h1>
        <p>Total users: {users.length}</p>
      </div>
      {error && <div className="error-msg">{error}</div>}
      <div style={{ overflowX: "auto" }}>
        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
