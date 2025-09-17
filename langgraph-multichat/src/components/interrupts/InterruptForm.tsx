import React, { useState, useEffect, useMemo } from "react";
import { firstToUpper } from "@/utils/util";

export function InterruptForm({
    args,
    readOnly,
    onEditChange
}: {
    args: Record<string, any>;
    readOnly: boolean;
    onEditChange?: (key: string | string[], text: string | string[], hasChanged: boolean) => void
}) {
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [initialValues, setInitialValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const newInitialValues: Record<string, string> = {};
        for (const [k, v] of Object.entries(args)) {
            if (k === "id") continue;
            newInitialValues[k] =
                typeof v === "string" || typeof v === "number" ? v.toString() : JSON.stringify(v, null);
        }
        setInitialValues(newInitialValues);
        setFormValues(newInitialValues);
    }, [args]);

    const handleChange = (key: string, value: string) => {
        const hasChanged = value !== initialValues[key]
        setFormValues((prev) => ({ ...prev, [key]: value }));

        if (onEditChange) {
            onEditChange(key, value, hasChanged)
        }
    };

    const handleReset = () => {
        setFormValues(initialValues);

        if (onEditChange) {
            const keys = Object.keys(initialValues)
            const values = keys.map((key) => initialValues[key])
            onEditChange(keys, values, false)
        }
    };

    const isChanged = useMemo(() => {
        return Object.keys(initialValues).some((key) => formValues[key] !== initialValues[key]);
    }, [formValues, initialValues]);

    return (
        <div className="p-4">
            {Object.entries(formValues).map(([k, value]) => {
                const isMultiline = value.length > 40;

                return (
                    <div key={k} className="row align-items-center mb-3">
                        <div className="col-md-3 align-self-start">
                            <label htmlFor={k} className="col-form-label">
                                {firstToUpper(k)}
                            </label>
                        </div>
                        <div className="col-md-9">
                            {isMultiline ? (
                                <textarea
                                    id={k}
                                    className={`form-control ${readOnly ? "border-0" : ""}`}
                                    readOnly={readOnly}
                                    rows={Math.ceil(value.length / 70)}
                                    value={value}
                                    onChange={(e) => handleChange(k, e.target.value)}
                                    style={{
                                        resize: readOnly ? "none" : "vertical",
                                        borderColor: readOnly ? "transparent" : undefined,
                                    }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id={k}
                                    className={`form-control ${readOnly ? "border-0" : ""}`}
                                    readOnly={readOnly}
                                    value={value}
                                    onChange={(e) => handleChange(k, e.target.value)}
                                    style={{
                                        borderColor: readOnly ? "transparent" : undefined,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );
            })}

            {!readOnly && (
                <div className="text-end mt-4">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ textTransform: "none" }}
                        onClick={handleReset}
                        disabled={!isChanged}
                    >
                        <i className="fas fa-undo-alt me-2"></i> Reset
                    </button>
                </div>
            )}
        </div>
    );
}
