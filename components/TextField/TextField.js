import React from "react";
import { ErrorMessage } from "@hookform/error-message";
import { InputAdornment, Typography, styled } from "@mui/material";
import { TextField as MuiTextField, TextFieldProps } from "@mui/material";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import styles from "./TextField.module.css";

const CustomizedTextField = styled(MuiTextField)`
    & .MuiOutlinedInput-root {
        border-radius: 8px;
        background: ${({ readOnly }) => (readOnly ? "#f8f2fb" : "#f0e4f2")};
    }
    & .MuiOutlinedInput-input::placeholder {
        color: #767676;
        font-size: 13px;
        font-weight: 500;
        opacity: 1;
    }
    & .MuiOutlinedInput-input {
        padding: 12px;
    }
`;

export const TextField = React.forwardRef(
    (
        {
            placeholder,
            type = "text",
            icon: Icon,
            className,
            readOnly = false,
            ...rest
        },
        ref
    ) => {
        return (
            <div className={`${styles.inputWrapper} ${className}`}>
                {Icon && <Icon className={styles.icon} />}
                <input
                    type={type}
                    placeholder={placeholder}
                    className={styles.input}
                    ref={ref}
                    readOnly={readOnly}
                    {...rest}
                />
            </div>
        );
    }
);

TextField.displayName = "TextField";

export function TextFieldForm({
    name,
    className,
    type = "text",
    variant = "outlined",
    placeholder,
    icon: Icon,
    multiline = false,
    rows = 3,
    ...rest
}) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <div className={clsx(className, styles.wrapper)}>
            <CustomizedTextField
                {...register(name, {
                    valueAsNumber: type === "number",
                })}
                placeholder={placeholder}
                variant={variant}
                type={type}
                {...rest}
                readOnly={rest.inputProps?.readOnly}
                multiline={multiline}
                rows={multiline ? rows : undefined}
                slotProps={{
                    input: {
                        startAdornment: Icon ? (
                            <InputAdornment position="start">
                                <Icon />
                            </InputAdornment>
                        ) : null,
                    },
                }}
            />
            <ErrorMessage
                name={name}
                errors={errors}
                render={({ message }) => (
                    <Typography variant="caption" color="error.main">
                        {message}
                    </Typography>
                )}
            />
        </div>
    );
}
