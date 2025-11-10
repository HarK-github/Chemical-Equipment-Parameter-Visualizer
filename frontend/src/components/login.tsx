import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import React from "react";

export default function LoginForm() {
  const [action, setAction] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto gap-8 py-12 px-4 text-center">
      {/* --- Header / App Description --- */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-bold">
          Chemical Equipment Parameter Visualizer
        </h1>
        <p className="text-default-500 max-w-md text-sm">
          Upload, analyze, and visualize chemical equipment data with ease.
          Our hybrid web + desktop tool automatically processes your CSV files,
          computes key metrics (flowrate, pressure, temperature), and delivers
          clear visual insights — all powered by intelligent data analytics.
        </p>
      </div>

      {/* --- Feature Highlights --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-default-600 text-sm">
        <div>
          <h3 className="font-semibold mb-1">📊 Automated CSV Analysis</h3>
          <p>
            Upload your equipment datasets and get instant summaries — no
            manual calculations or scripting needed.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">🌡️ Smart Data Visualization</h3>
          <p>
            Explore trends for Flowrate, Pressure, and Temperature with
            interactive charts.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">🧠 AI-Powered Insights</h3>
          <p>
            Identify key patterns, averages, and distributions automatically for
            quick technical review.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">📄 PDF Reports</h3>
          <p>
            Generate and export polished reports for documentation or
            presentation in one click.
          </p>
        </div>
      </div>

      {/* --- Login Section --- */}
      <div className="w-full max-w-sm mt-6">
        <h2 className="text-xl font-semibold mb-2">Login to Your Dashboard</h2>
        <p className="text-default-500 text-sm mb-4">
          Access your saved datasets, charts, and reports.
        </p>

        <Form
          className="w-full flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setAction("Login submitted");
          }}
          onReset={() => setAction("Form reset")}
        >
          <Input
            isRequired
            errorMessage="Please enter a valid username"
            label="Username"
            labelPlacement="outside"
            name="username"
            placeholder="Enter your username"
            type="text"
          />

          <Input
            isRequired
            errorMessage="Please enter your password"
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your password"
            type="password"
          />

          <div className="flex gap-2 mt-2">
            <Button color="primary" type="submit" fullWidth>
              Login
            </Button>
            <Button type="reset" variant="flat" fullWidth>
              Reset
            </Button>
          </div>

          {action && (
            <div className="text-small text-default-500 text-center">
              <code>{action}</code>
            </div>
          )}
        </Form>

        <p className="text-xs text-center text-default-400 mt-3">
          Don’t have access yet?{" "}
          <a href="#" className="text-primary hover:underline">
            Contact admin
          </a>
        </p>
      </div>
    </div>
  );
}
