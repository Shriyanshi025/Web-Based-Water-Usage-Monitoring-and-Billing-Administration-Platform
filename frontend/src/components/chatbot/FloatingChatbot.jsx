import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Fab,
    Paper,
    Typography,
    IconButton,
    TextField,
    List,
    ListItem,
    Avatar,
    CircularProgress,
    Zoom,
    Tooltip,
    useTheme,
    useMediaQuery
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import BotIcon from "@mui/icons-material/SmartToy";
import UserIcon from "@mui/icons-material/Person";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import api from "../../services/api";

// Clean and safe Markdown Renderer with visual Table support
function MarkdownMessage({ content }) {
    if (!content) return null;

    const renderFormattedText = (text) => {
        if (!text) return "";
        const parts = [];
        let lastIdx = 0;
        const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIdx) {
                parts.push(text.substring(lastIdx, match.index));
            }
            if (match[2]) {
                parts.push(<strong key={match.index} style={{ fontWeight: 650 }}>{match[2]}</strong>);
            } else if (match[3]) {
                parts.push(<em key={match.index}>{match[3]}</em>);
            }
            lastIdx = regex.lastIndex;
        }

        if (lastIdx < text.length) {
            parts.push(text.substring(lastIdx));
        }

        return parts.length > 0 ? parts : text;
    };

    // Parse content into structured blocks (headers, bullets, tables, paragraphs)
    const cleanContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = cleanContent.split("\n");
    const blocks = [];
    let currentTable = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Robust Table line detection
        const isTableLine = (trimmed.startsWith("|") || (trimmed.includes("|") && /^\|.*\|$/.test(trimmed))) && trimmed.length > 2;
        if (isTableLine) {
            const isDelimiter = /^\|?(\s*:?-+:?\s*\|?)+$/.test(trimmed);
            // Split line by '|' and remove empty edge segments
            let rawCols = trimmed.split("|");
            if (trimmed.startsWith("|")) rawCols = rawCols.slice(1);
            if (trimmed.endsWith("|")) rawCols = rawCols.slice(0, -1);
            const cols = rawCols.map(c => c.trim());

            if (!currentTable) {
                currentTable = { type: "table", headers: cols, rows: [] };
            } else if (isDelimiter) {
                // Skip delimiter row (e.g. |---|---|)
            } else {
                currentTable.rows.push(cols);
            }
            continue;
        } else {
            if (currentTable) {
                blocks.push(currentTable);
                currentTable = null;
            }
        }

        if (!trimmed) {
            blocks.push({ type: "empty" });
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            blocks.push({ type: "bullet", text: trimmed.substring(2) });
        } else if (trimmed.startsWith("### ") || (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.includes("\n") && trimmed.length < 60)) {
            const headerText = trimmed.replace(/^###\s*/, "").replace(/^\*\*/, "").replace(/\*\*$/, "");
            blocks.push({ type: "header", text: headerText });
        } else {
            blocks.push({ type: "paragraph", text: line });
        }
    }

    if (currentTable) {
        blocks.push(currentTable);
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {blocks.map((block, idx) => {
                if (block.type === "empty") {
                    return <Box key={idx} sx={{ height: 6 }} />;
                }

                if (block.type === "header") {
                    return (
                        <Typography
                            key={idx}
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                mt: idx > 0 ? 0.75 : 0,
                                mb: 0.25,
                                color: "inherit",
                                fontSize: "0.875rem"
                            }}
                        >
                            {block.text}
                        </Typography>
                    );
                }

                if (block.type === "bullet") {
                    return (
                        <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1, pl: 0.5 }}>
                            <Typography component="span" sx={{ fontSize: "0.85rem", lineHeight: 1.4, color: "primary.main" }}>
                                •
                            </Typography>
                            <Typography variant="body2" component="span" sx={{ fontSize: "0.85rem", lineHeight: 1.4 }}>
                                {renderFormattedText(block.text)}
                            </Typography>
                        </Box>
                    );
                }

                if (block.type === "table") {
                    return (
                        <Box
                            key={idx}
                            sx={{
                                width: "100%",
                                maxWidth: "100%",
                                overflowX: "auto",
                                my: 0.75,
                                borderRadius: 1.5,
                                border: "1px solid rgba(140, 160, 190, 0.25)",
                                background: "rgba(240, 245, 250, 0.05)",
                                "::-webkit-scrollbar": { height: 5 },
                                "::-webkit-scrollbar-thumb": { background: "rgba(140, 160, 190, 0.3)", borderRadius: 3 }
                            }}
                        >
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ background: "rgba(140, 160, 190, 0.15)", borderBottom: "1px solid rgba(140, 160, 190, 0.3)" }}>
                                        {block.headers.map((h, hIdx) => (
                                            <th key={hIdx} style={{ padding: "6px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>
                                                {renderFormattedText(h)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {block.rows.map((row, rIdx) => (
                                        <tr
                                            key={rIdx}
                                            style={{
                                                borderBottom: rIdx < block.rows.length - 1 ? "1px solid rgba(140, 160, 190, 0.15)" : "none",
                                                background: rIdx % 2 === 1 ? "rgba(140, 160, 190, 0.06)" : "transparent"
                                            }}
                                        >
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                                                    {renderFormattedText(cell)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    );
                }

                return (
                    <Typography key={idx} variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.45 }}>
                        {renderFormattedText(block.text)}
                    </Typography>
                );
            })}
        </Box>
    );
}

export default function FloatingChatbot() {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const isDashboardPath = location.pathname.startsWith("/main-admin") ||
                            location.pathname.startsWith("/community-admin") ||
                            location.pathname.startsWith("/resident") ||
                            location.pathname.startsWith("/chatbot");
    const isPublicPage = !isDashboardPath;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

    const [open, setOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversationId] = useState(() => Math.random().toString(36).substring(7));
    
    // Voice Speech-To-Text State
    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError] = useState("");
    const recognitionRef = useRef(null);

    // Voice Text-To-Speech State
    const [speakingMessageId, setSpeakingMessageId] = useState(null);

    const messagesEndRef = useRef(null);
    const panelRef = useRef(null);
    const fabRef = useRef(null);

    const [customDimensions, setCustomDimensions] = useState({ width: 440, height: 480 });

    // Wide Landscape Dimensions
    const getPanelDimensions = () => {
        if (isMobile) {
            const w = typeof window !== "undefined" ? Math.min(window.innerWidth - 24, 380) : 340;
            const h = typeof window !== "undefined" ? Math.min(window.innerHeight - 100, 480) : 460;
            return { width: w, height: h };
        }

        if (isExpanded) {
            // Maximized/Expanded: Width (760px / 0.81) unchanged, Height EXACTLY matches normal height (480px)
            const maxW = typeof window !== "undefined" ? Math.min(760, window.innerWidth * 0.81) : 760;
            return { width: maxW, height: 480 };
        }

        if (isTablet) {
            return { width: 480, height: 480 };
        }

        return customDimensions;
    };

    const { width: panelWidth, height: panelHeight } = getPanelDimensions();

    // 8-Way Pointer Resize Handler
    const handleResizeStart = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = panelRef.current.getBoundingClientRect();
        const initialLeft = rect.left;
        const initialTop = rect.top;
        const initialWidth = rect.width;
        const initialHeight = rect.height;

        setPos({ x: initialLeft, y: initialTop });

        const startX = e.clientX;
        const startY = e.clientY;

        const isCorner = (direction.includes("left") || direction.includes("right")) &&
                         (direction.includes("top") || direction.includes("bottom"));

        const startRatio = initialWidth / initialHeight;

        const handlePointerMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialLeft;
            let newTop = initialTop;

            if (isCorner) {
                if (direction.includes("left")) {
                    newWidth = initialWidth - dx;
                } else {
                    newWidth = initialWidth + dx;
                }

                // Limits
                const minW = 340;
                const maxW = typeof window !== "undefined" ? window.innerWidth - 48 : 800;
                const minH = 320;
                const maxH = typeof window !== "undefined" ? window.innerHeight - 100 : 700;

                if (newWidth < minW) newWidth = minW;
                if (newWidth > maxW) newWidth = maxW;

                newHeight = newWidth / startRatio;

                if (newHeight < minH) {
                    newHeight = minH;
                    newWidth = newHeight * startRatio;
                }
                if (newHeight > maxH) {
                    newHeight = maxH;
                    newWidth = newHeight * startRatio;
                }

                if (direction.includes("left")) {
                    newLeft = initialLeft + (initialWidth - newWidth);
                }
                if (direction.includes("top")) {
                    newTop = initialTop + (initialHeight - newHeight);
                }

                setCustomDimensions({ width: newWidth, height: newHeight });
                setPos({ x: newLeft, y: newTop });
            } else {
                if (direction === "left") {
                    newWidth = initialWidth - dx;
                    newLeft = initialLeft + dx;
                } else if (direction === "right") {
                    newWidth = initialWidth + dx;
                }

                if (direction === "top") {
                    newHeight = initialHeight - dy;
                    newTop = initialTop + dy;
                } else if (direction === "bottom") {
                    newHeight = initialHeight + dy;
                }

                const minW = 340;
                const maxW = typeof window !== "undefined" ? window.innerWidth - 48 : 800;
                const minH = 320;
                const maxH = typeof window !== "undefined" ? window.innerHeight - 100 : 700;

                if (newWidth >= minW && newWidth <= maxW) {
                    setCustomDimensions((prev) => ({ ...prev, width: newWidth }));
                    if (direction === "left") {
                        setPos((prev) => ({ ...prev, x: newLeft }));
                    }
                }
                if (newHeight >= minH && newHeight <= maxH) {
                    setCustomDimensions((prev) => ({ ...prev, height: newHeight }));
                    if (direction === "top") {
                        setPos((prev) => ({ ...prev, y: newTop }));
                    }
                }
            }
        };

        const handlePointerUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    };

    // True Free 2D Dragging State (x = left, y = top in pixels)
    const [pos, setPos] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });
    const wasDraggingRef = useRef(false);

    // Reset position on close
    useEffect(() => {
        if (!open) {
            setPos(null);
        }
    }, [open]);

    // Role-aware welcome message
    const getWelcomeMessage = useCallback(() => {
        if (!isAuthenticated || !user) {
            return "Hi! I'm **HydroSync AI**. I can help you understand the platform, features, and water management solutions.";
        }
        switch (user.role) {
            case "USER":
                return `Hi **${user.fullName}**! I can help you check your water usage, latest bills, payment history, and alerts. Ask me anything about your household water account!`;
            case "COMMUNITY_ADMIN":
                return `Welcome Administrator **${user.fullName}**! I can help you analyze your community's water consumption, resident counts, block breakdowns, and unpaid bills.`;
            case "MAIN_ADMIN":
                return "Welcome System Admin! I can assist you with platform-wide communities, global water consumption, billing, and administrative metrics.";
            default:
                return "Hi! How can I assist you with HydroSync today?";
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        setMessages([
            {
                id: "welcome",
                text: getWelcomeMessage(),
                sender: "bot",
                timestamp: new Date()
            }
        ]);
    }, [getWelcomeMessage]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);

    useEffect(() => {
        return () => {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!open) return;
            if (wasDraggingRef.current) {
                wasDraggingRef.current = false;
                return;
            }
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target) &&
                fabRef.current &&
                !fabRef.current.contains(event.target)
            ) {
                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    setSpeakingMessageId(null);
                }
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleClickOutside);
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [open]);

    // Truly Free 2D Dragging Handler (Anywhere on X and Y)
    const handlePointerDownHeader = (e) => {
        if (e.button !== 0 || isMobile) return;
        if (e.target.closest("button") || e.target.closest("input") || e.target.closest("a")) return;

        e.preventDefault();
        setIsDragging(true);
        wasDraggingRef.current = false;

        const currentRect = panelRef.current
            ? panelRef.current.getBoundingClientRect()
            : {
                  left: window.innerWidth - panelWidth - 24,
                  top: window.innerHeight - panelHeight - 90
              };

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialLeft: currentRect.left,
            initialTop: currentRect.top
        };

        const handlePointerMove = (moveEvent) => {
            const dx = moveEvent.clientX - dragRef.current.startX;
            const dy = moveEvent.clientY - dragRef.current.startY;

            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                wasDraggingRef.current = true;
            }

            const newX = dragRef.current.initialLeft + dx;
            const newY = dragRef.current.initialTop + dy;

            setPos({ x: newX, y: newY });
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
    };

    const handleToggle = () => {
        if (open && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
        }
        setOpen(!open);
    };

    // Voice Speech-To-Text
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setMicError("Speech recognition is not supported in this browser.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                setIsListening(true);
                setMicError("");
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setMessage(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                if (event.error === "not-allowed") {
                    setMicError("Microphone access denied. Please check permissions.");
                } else {
                    setMicError("Voice input unavailable. Please type your message.");
                }
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error("Microphone start failed:", err);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    // Text-To-Speech
    const handleSpeak = (msgId, text) => {
        if (!("speechSynthesis" in window)) return;

        if (speakingMessageId === msgId) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }

        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#_`~-]/g, " ").replace(/\n+/g, ". ");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);

        setSpeakingMessageId(msgId);
        window.speechSynthesis.speak(utterance);
    };

    // Send Message
    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!message.trim() || loading) return;

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
        }
        if (isListening) stopListening();

        const userText = message.trim();
        setMessage("");

        const userMsgId = Date.now().toString();
        setMessages((prev) => [
            ...prev,
            { id: userMsgId, text: userText, sender: "user", timestamp: new Date() }
        ]);

        setLoading(true);

        try {
            const res = await api.post("/v1/chatbot/chat", {
                message: userText,
                conversationId: conversationId
            });

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: res.data.answer || "I received your request.",
                    sender: "bot",
                    timestamp: new Date()
                }
            ]);
        } catch (err) {
            console.error("Chatbot request failed:", err);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: "I'm temporarily unable to generate an AI response. Please try again shortly.",
                    sender: "bot",
                    timestamp: new Date(),
                    error: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Movable & Expandable Landscape Chat Panel */}
            <Zoom in={open}>
                <Paper
                    ref={panelRef}
                    elevation={12}
                    sx={{
                        position: "fixed",
                        left: pos ? `${pos.x}px` : "auto",
                        top: pos ? `${pos.y}px` : "auto",
                        right: pos ? "auto" : 24,
                        bottom: pos ? "auto" : 90,
                        width: panelWidth,
                        height: panelHeight,
                        maxHeight: "calc(100vh - 40px)",
                        maxWidth: "calc(100vw - 20px)",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid rgba(224, 224, 224, 0.8)",
                        background: "rgba(255, 255, 255, 0.98)",
                        backdropFilter: "blur(8px)",
                        pointerEvents: "auto",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                        userSelect: isDragging ? "none" : "auto",
                        transition: isDragging ? "none" : "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                >
                    {/* 8-Way Resize Handles (Only on desktop and when not maximized) */}
                    {!isMobile && !isExpanded && (
                        <>
                            {/* Left edge */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "left")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "left")}
                                sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", cursor: "ew-resize", zIndex: 99999 }}
                            />
                            {/* Right edge */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "right")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "right")}
                                sx={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "6px", cursor: "ew-resize", zIndex: 99999 }}
                            />
                            {/* Top edge */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "top")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "top")}
                                sx={{ position: "absolute", left: 0, right: 0, top: 0, height: "6px", cursor: "ns-resize", zIndex: 99999 }}
                            />
                            {/* Bottom edge */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "bottom")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "bottom")}
                                sx={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "6px", cursor: "ns-resize", zIndex: 99999 }}
                            />
                            {/* Top-Left corner */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "top-left")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "top-left")}
                                sx={{ position: "absolute", left: 0, top: 0, width: "12px", height: "12px", cursor: "nwse-resize", zIndex: 100000 }}
                            />
                            {/* Top-Right corner */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "top-right")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "top-right")}
                                sx={{ position: "absolute", right: 0, top: 0, width: "12px", height: "12px", cursor: "nesw-resize", zIndex: 100000 }}
                            />
                            {/* Bottom-Left corner */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "bottom-left")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "bottom-left")}
                                sx={{ position: "absolute", left: 0, bottom: 0, width: "12px", height: "12px", cursor: "nesw-resize", zIndex: 100000 }}
                            />
                            {/* Bottom-Right corner */}
                            <Box
                                onPointerDown={(e) => handleResizeStart(e, "bottom-right")}
                                onDoubleClick={(e) => handleResizeDoubleClick(e, "bottom-right")}
                                sx={{ position: "absolute", right: 0, bottom: 0, width: "12px", height: "12px", cursor: "nwse-resize", zIndex: 100000 }}
                            />
                        </>
                    )}

                    {/* Draggable Header */}
                    <Box
                        onPointerDown={handlePointerDownHeader}
                        sx={{
                            p: 1.5,
                            px: 2,
                            backgroundImage: "url('/top-nav-bar.webp')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: "1px solid",
                            borderColor: "rgba(0, 0, 0, 0.4)",
                            cursor: isMobile ? "default" : isDragging ? "grabbing" : "grab",
                            touchAction: "none",
                            userSelect: "none"
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <DragIndicatorIcon sx={{ opacity: 0.6, fontSize: 18 }} />
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 34, height: 34 }}>
                                <BotIcon sx={{ color: "white", fontSize: 20 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                    HydroSync AI
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.7rem" }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4caf50" }} />
                                    {isAuthenticated ? (user?.role === "COMMUNITY_ADMIN" ? "Community Assistant" : user?.role === "MAIN_ADMIN" ? "System Assistant" : "Resident Assistant") : "Public Assistant"}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {!isMobile && (
                                <Tooltip title={isExpanded ? "Restore compact size" : "Expand to wide view"}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsExpanded(!isExpanded);
                                        }}
                                        sx={{ color: "white", p: 0.5 }}
                                    >
                                        {isExpanded ? <CloseFullscreenIcon sx={{ fontSize: 18 }} /> : <OpenInFullIcon sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                </Tooltip>
                            )}

                            <Tooltip title="Close chatbot">
                                <IconButton size="small" onClick={handleToggle} sx={{ color: "white", p: 0.5 }}>
                                    <CloseIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Messages Area (Scrolls internally) */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            p: 2,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            bgcolor: "#f8f9fa"
                        }}
                    >
                        <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {messages.map((msg) => (
                                <ListItem
                                    key={msg.id}
                                    sx={{
                                        p: 0,
                                        display: "flex",
                                        justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                                            alignItems: "flex-start",
                                            gap: 1,
                                            maxWidth: isExpanded ? "82%" : "88%"
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                bgcolor: msg.sender === "user" 
                                                    ? (isPublicPage ? "#0ea5e9" : theme.palette.secondary.main) 
                                                    : (isPublicPage ? "#0369A1" : theme.palette.primary.main),
                                                fontSize: "0.8rem"
                                            }}
                                        >
                                            {msg.sender === "user" ? <UserIcon sx={{ fontSize: 16 }} /> : <BotIcon sx={{ fontSize: 16 }} />}
                                        </Avatar>
                                        <Box>
                                            <Paper
                                                elevation={1}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: msg.sender === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                                                    bgcolor: msg.sender === "user" 
                                                        ? (isPublicPage ? "#0369A1" : theme.palette.primary.main) 
                                                        : "white",
                                                    color: msg.sender === "user" ? "white" : "text.primary",
                                                    border: msg.sender === "user" ? "none" : "1px solid rgba(224, 224, 224, 0.5)"
                                                }}
                                            >
                                                <MarkdownMessage content={msg.text} />
                                            </Paper>

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                                                    mt: 0.25,
                                                    gap: 0.5
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                                                    {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                </Typography>

                                                {msg.sender === "bot" && (
                                                    <Tooltip title={speakingMessageId === msg.id ? "Stop Speaking" : "Read Aloud"}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleSpeak(msg.id, msg.text)}
                                                            sx={{
                                                                p: 0.25,
                                                                color: speakingMessageId === msg.id ? "error.main" : "text.secondary",
                                                                "&:hover": { color: isPublicPage ? "#0369A1" : theme.palette.primary.main }
                                                            }}
                                                        >
                                                            {speakingMessageId === msg.id ? <StopIcon sx={{ fontSize: 14 }} /> : <VolumeUpIcon sx={{ fontSize: 14 }} />}
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))}

                            {loading && (
                                <ListItem sx={{ p: 0, display: "flex", justifyContent: "flex-start" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: isPublicPage ? "#0369A1" : theme.palette.primary.main }}>
                                            <BotIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: "4px 16px 16px 16px",
                                                bgcolor: "white",
                                                border: "1px solid rgba(224, 224, 224, 0.5)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1
                                            }}
                                        >
                                            <CircularProgress size={16} thickness={5} />
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                HydroSync is analyzing request...
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </ListItem>
                            )}
                            <div ref={messagesEndRef} />
                        </List>
                    </Box>

                    {/* Mic Error Notice */}
                    {micError && (
                        <Box sx={{ px: 2, py: 0.5, bgcolor: "#ffebee", borderTop: "1px solid #ffcdd2" }}>
                            <Typography variant="caption" color="error">
                                {micError}
                            </Typography>
                        </Box>
                    )}

                    {/* Input Field Form (Fixed at bottom of panel) */}
                    <Box
                        component="form"
                        onSubmit={handleSend}
                        sx={{
                            p: 1.5,
                            bgcolor: "white",
                            borderTop: "1px solid rgba(224, 224, 224, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        <Tooltip title={isListening ? "Stop Recording" : "Voice Input (Speak)"}>
                            <IconButton
                                onClick={isListening ? stopListening : startListening}
                                color={isListening ? "error" : "default"}
                                sx={{
                                    bgcolor: isListening ? "#ffebee" : "transparent",
                                    animation: isListening ? "pulse 1.5s infinite" : "none",
                                    "@keyframes pulse": {
                                        "0%": { boxShadow: "0 0 0 0 rgba(244, 67, 54, 0.4)" },
                                        "70%": { boxShadow: "0 0 0 8px rgba(244, 67, 54, 0)" },
                                        "100%": { boxShadow: "0 0 0 0 rgba(244, 67, 54, 0)" }
                                    }
                                }}
                            >
                                {isListening ? <MicOffIcon color="error" /> : <MicIcon />}
                            </IconButton>
                        </Tooltip>

                        <TextField
                            fullWidth
                            size="small"
                            placeholder={isListening ? "Listening... speak now" : "Ask HydroSync AI..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                            autoComplete="off"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
                        />                          <IconButton
                            type="submit"
                            color="primary"
                            disabled={!message.trim() || loading}
                            sx={{
                                bgcolor: isPublicPage ? "#0369A1" : theme.palette.primary.main,
                                color: "white",
                                "&:hover": { bgcolor: isPublicPage ? "#075985" : theme.palette.primary.dark },
                                "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.3)" },
                                ...(isDashboardPath ? {
                                    background: "#46CBFC !important",
                                    backgroundImage: "none !important",
                                    color: "#0a1d37 !important",
                                    "&:hover": {
                                        background: "#0ea5e9 !important",
                                    }
                                } : {})
                            }}
                        >
                            <SendIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </Paper>
            </Zoom>

            {/* Floating Launcher FAB Button */}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    zIndex: 9999,
                    pointerEvents: "none"
                }}
            >
                <Fab
                    ref={fabRef}
                    color="primary"
                    onClick={handleToggle}
                    sx={{
                        boxShadow: 4,
                        transition: "transform 0.2s",
                        pointerEvents: "auto",
                        "&:hover": { transform: "scale(1.08)" },
                        ...(isDashboardPath ? {
                            background: "#46CBFC !important",
                            backgroundImage: "none !important",
                            color: "#0a1d37 !important",
                            "&:hover": {
                                background: "#0ea5e9 !important",
                            }
                        } : {
                            background: "#0369A1 !important",
                            backgroundImage: "none !important",
                            color: "#ffffff !important",
                            "&:hover": {
                                background: "#075985 !important",
                            }
                        })
                    }}
                >
                    {open ? <CloseIcon /> : <ChatIcon />}
                </Fab>
            </Box>
        </>
    );
}
