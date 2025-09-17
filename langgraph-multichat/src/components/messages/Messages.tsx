import { useScroll } from "@/providers/Scroll";
import React, { ReactNode, useState } from "react";

interface BaseMessageTextProps {
    createdAt: string
    isLoading?: boolean
    onAction: (content?: string) => void;
}

export interface AIMessageTextProps
    extends BaseMessageTextProps {
    content: string;
}

export interface AIMessageComponentProps
    extends BaseMessageTextProps {
    children: ReactNode;
}

export function AIMessageComponent(props: AIMessageComponentProps) {
    return (
        <div className="d-flex flex-row justify-content-end mb-4 pt-1">
            <div className="w-100">
                <div className="small p-2 me-3 mb-1 text-white rounded-3">{props.children}</div>
                <p className="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">
                    {props.createdAt}
                </p>
                {/*
                {!props.isLoading && 
                <div className="row align-items-center">
                    <i
                        className="fas fa-sync-alt ms-4"
                        style={{
                            cursor: "pointer",
                            color: "rgba(0, 0, 0, 0.45)",
                            position: "relative",
                        }}
                        title="Re-run"
                        onClick={() => props.onAction()}
                    ></i>                
                </div>              
                }
                */}
            </div>
            <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp"
                alt="avatar bot"
                style={{ width: "45px", height: "100%" }}
            />
        </div>
    );
}

export function AIMessageText(props: AIMessageTextProps) {
    return (
        <div className="d-flex flex-row justify-content-end mb-4 pt-1">
            <div style={{ position: "relative" }}>
                {props.content &&
                    <>
                        <p
                            className="small p-2 pe-4 me-3 mb-1 text-white rounded-3 bg-primary"
                            style={{ position: "relative", paddingRight: "30px" }}
                            dangerouslySetInnerHTML={{
                                __html: props.content.replace(/\n/g, "<br />"),
                            }}
                        />
                        {!props.isLoading &&
                            <>
                                <i
                                    className="fas fa-sync-alt text-white"
                                    style={{
                                        position: "absolute",
                                        top: "11px",
                                        right: "20px",
                                        cursor: "pointer",
                                    }}
                                    title="Re-run"
                                    onClick={() => props.onAction()}
                                ></i>
                                <p className="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">
                                    {props.createdAt}
                                </p>
                            </>
                        }
                    </>
                }
            </div>

            <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp"
                alt="avatar bot"
                style={{ width: "45px", height: "100%" }}
            />
        </div>
    );
}

export function HumanMessageText(props: AIMessageTextProps) {
    const { setShouldScroll } = useScroll();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(props.content);

    const handleEditClick = () => {
        setShouldScroll(false)
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setShouldScroll(true)
        setEditedContent(props.content); // Revert changes
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setIsEditing(false);
            setShouldScroll(true)
            if (props.content !== editedContent && editedContent.trim() !== "") {
                props.onAction(editedContent)
            }
        }
    };

    const handleSubmitEdit = () => {
        setIsEditing(false);
        if (props.content !== editedContent && editedContent.trim() !== "") {
            setShouldScroll(true)
            props.onAction(editedContent)
        }
    };

    return (
        <div className="d-flex flex-row justify-content-start">
            <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
                alt="avatar user"
                style={{ width: "45px", height: "100%" }}
            />
            <div>
                <p className="small p-2 ms-3 mb-1 rounded-3 bg-body-tertiary d-inline-flex align-items-center gap-2">
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="form-control form-control-sm"
                                style={{ width: "700px" }}
                            />
                            <i
                                className="fas fa-times ms-1 text-danger"
                                style={{ fontSize: "0.8rem", cursor: "pointer" }}
                                title="Cancel"
                                onClick={handleCancelEdit}
                            ></i>
                            <i
                                className="fas fa-check ms-1 text-success"
                                style={{ fontSize: "0.8rem", cursor: "pointer" }}
                                title="Submit"
                                onClick={handleSubmitEdit}
                            ></i>
                        </>
                    ) : (
                        <>
                            <span>{editedContent}</span>
                            <i
                                className="fas fa-edit ms-2"
                                style={{
                                    fontSize: "0.8rem",
                                    opacity: 0.6,
                                    cursor: "pointer",
                                }}
                                title="Edit"
                                onClick={handleEditClick}
                            ></i>
                        </>
                    )}
                </p>
                <p className="small ms-3 mb-3 rounded-3 text-muted">
                    {props.createdAt}
                </p>
            </div>
        </div>
    );
}