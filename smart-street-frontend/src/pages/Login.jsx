import api from "../api.jsx";

export default function Login() {
  const login = async () => {
    await api.post("/auth/login", { phone: "9999999999" });
    window.location.href = "/dashboard";
  };

  return (
    <div className="container">
      <h2>Smart Street</h2>
      <p>Vendor Login</p>
      <button onClick={login}>Login</button>
    </div>
  );
}
