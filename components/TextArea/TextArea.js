import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import styles from "../Input/Input.module.css";

function Textarea({
  label,
  required,
  placeholder,
  registerField,
  minLength,
  errorMsg,
  defaultValue,
}) {
  const methods = useFormContext();
  const {
    register,
    setValue,
    formState: { errors },
  } = methods;

  const [value, setValueState] = useState(defaultValue || "");

  useEffect(() => {
    setValue(registerField, defaultValue || "", { shouldValidate: true });
  }, [defaultValue, registerField, setValue]);

  const handleChange = (event) => {
    const { value } = event.target;
    setValue(registerField, value, { shouldValidate: true });
    setValueState(value);
  };

  return (
    <>
      <label className={styles.label}>{label}</label>
      <textarea
        rows={6}
        placeholder={placeholder}
        className={`${styles.fields} ${styles.textarea}`}
        {...register(registerField, {
          required,
        })}
        defaultValue={value}
        onChange={handleChange}
      />
      {errors?.[registerField]?.type === "required" && (
        <p className={styles.error}>This field is required</p>
      )}
      {errors?.[registerField]?.type === "minLength" && (
        <p className={styles.error}>
          {`${label} cannot be less than ${minLength} characters`}
        </p>
      )}
      {errors?.[registerField]?.type === "pattern" && (
        <p className={styles.error}>{`Please enter a valid ${errorMsg}`}</p>
      )}
    </>
  );
}

export default Textarea;
