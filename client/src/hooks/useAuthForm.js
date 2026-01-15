
import { useState } from "react";

export function useAuthForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setError("");
    setLoading(false);
  };

  const handleError = (err) => {
    setError(
      err?.response?.data?.message || err?.message || "An error occurred"
    );
  };

  return {
    values,
    error,
    loading,
    setError,
    setLoading,
    onChange,
    resetForm,
    handleError,
  };
}
