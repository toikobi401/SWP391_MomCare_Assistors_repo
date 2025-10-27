import { useEffect, useState } from "react";

export const UserPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users.recordset);
      })
  }, []);

  return (
    <div>
      <h1>Danh sách Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.UserID}>
            <b>{user.Username}</b> - {user.Email} - {user.Phone}
          </li>
        ))}
      </ul>
    </div>
  );
}