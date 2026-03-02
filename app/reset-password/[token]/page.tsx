"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { updatePassword } from "@/app/services/auth.service";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();

  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = { token, password };
      await updatePassword(payload);
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <Typography variant="h5" mb={2}>
        Set Your Password
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type="password"
          label="New Password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <Typography color="error" mt={1}>
            {error}
          </Typography>
        )}

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Set Password
        </Button>
      </form>
    </div>
  );
}
