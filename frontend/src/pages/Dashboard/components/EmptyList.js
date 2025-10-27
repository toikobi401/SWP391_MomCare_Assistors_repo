import React from "react";
import { LuUserRoundX } from "react-icons/lu";

const EmptyList = () => {
  return (
    <tr>
      <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
        <LuUserRoundX style={{ fontSize: "3rem", color: "red" }} />
        <br />
        Không tìm thấy người dùng tương ứng
      </td>
    </tr>
  );
};

export default EmptyList;
