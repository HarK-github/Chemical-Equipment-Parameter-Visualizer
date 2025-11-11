import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import React from "react";

export default function DocsPage() {
  const [action, setAction] = React.useState(null);

  return (
    <DefaultLayout >
      <div className="flex justify-center align-middle">
      <Form className="w-full max-w-xs flex flex-col gap-4">
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
          errorMessage="Please enter a valid email"
          label="Email"
          labelPlacement="outside"
          name="email"
          placeholder="Enter your email"
          type="email"
        />
        <div className="flex gap-2">
          <Button color="primary" type="submit">
            Submit
          </Button>
          <Button type="reset" variant="flat">
            Reset
          </Button>
        </div>
        {action && (
          <div className="text-small text-default-500">
            Action: <code>{action}</code>
          </div>
        )}
      </Form>
      </div>
    </DefaultLayout>
  );
}
