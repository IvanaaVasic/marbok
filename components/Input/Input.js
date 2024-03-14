import React from "react";
import styles from "./Input.module.css";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";

function Input({
  label,
  required,
  inputType,
  placeholder,
  registerField,
  minLength,
  expression,
  errorMsg,
  className,
  value,
  onChange,
}) {
  const methods = useFormContext();
  const {
    register,
    formState: { errors },
    setValue,
  } = methods;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValue(name, value);
  };

  return (
    <>
      <label className={styles.label}>{label}</label>
      <input
        type={inputType}
        placeholder={placeholder}
        className={clsx(styles.fields, className)}
        {...register(registerField, {
          required,
          minLength: minLength,
          pattern: expression,
        })}
        value={value}
        onChange={(e) => {
          handleInputChange(e);
          if (errors[registerField]) {
            methods.clearErrors(registerField);
          }
        }}
      />
      {errors?.[registerField]?.type === "required" && (
        <p className={styles.error}>Ovo polje je obavezno</p>
      )}
      {errors?.[registerField]?.type === "minLength" && (
        <p className={styles.error}>
          {`${label} ne sme biti manji od ${minLength} karaktera`}
        </p>
      )}
      {errors?.[registerField]?.type === "pattern" && (
        <p
          className={styles.error}
        >{`Molimo Vas unesite ispravnu ${errorMsg}`}</p>
      )}
    </>
  );
}

export default Input;
