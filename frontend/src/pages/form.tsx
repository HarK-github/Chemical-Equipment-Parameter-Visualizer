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

    // Determine the correct route based on method
    const apiRoute = method === "register" ? "/api/user/register/" : "/api/token/";

    try {
      const res = await api.post(apiRoute, data);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }

      setAction("Success");
      
    } catch (error) {
      // Backend responded but with error status
      if (error.response) {
        if (error.response.status === 401) {
          setAction("Invalid username or password.");
        } else if (error.response.status === 400) {
          setAction("Invalid input data.");
        } else if (error.response.status >= 500) {
          setAction("Server error. Please try again later.");
        } else {
          setAction("Request failed. Please try again.");
        }

        // No response (server down)
      } else if (error.request) {
        setAction("Cannot reach server. Please check your connection.");

        // Unknown error
      } else {
        setAction("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Form
        className="w-full max-w-sm flex flex-col gap-4 p-6 rounded-2xl shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold text-center">{title}</h2>

        <Input
          isRequired
          label="Username"
          name="username"
          placeholder={
            title === "Login" ? "Enter your new username" : undefined
          }
          type="text"
        />

        <Input
          isRequired
          label="Password"
          name="password"
          placeholder={
            title === "Register" ? "Enter your new password" : undefined
          }
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
