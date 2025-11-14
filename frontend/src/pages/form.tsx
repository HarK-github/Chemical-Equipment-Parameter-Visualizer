import { useState } from "react";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useNavigate } from "react-router-dom";
import { Link } from "@heroui/link";

import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export default function AuthForm({ route, method }) {
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const title = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await api.post(route, data);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }

      setAction("Success");
    } catch {
      setAction("Error: Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Form
        className="w-full max-w-sm flex flex-col gap-4 p-6 rounded-2xl shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold text-center">{title}</h2>

        <Input
          isRequired
          label="Username"
          name="username"
          placeholder="Enter your username"
          type="text"
        />

        <Input
          isRequired
          label="Password"
          name="password"
          placeholder="Enter your password"
          type="password"
        />

        <Button
          className="w-full"
          color="primary"
          isDisabled={loading}
          type="submit"
        >
          {loading ? "Processing..." : title}
        </Button>

        {action && (
          <p className="text-center text-sm text-gray-500">{action}</p>
        )}
        {title === "Login" && (
          <Link className="text-sm underline" href="/register">
            New user? Register
          </Link>
        )}
        {title === "Register" && (
          <Link className="text-sm underline" href="/login">
            Already have an account? Login
          </Link>
        )}
      </Form>
    </div>
  );
}
