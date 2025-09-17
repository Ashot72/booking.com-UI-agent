import { useScroll } from "@/providers/Scroll";
import { useEffect, useRef, RefObject } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
    RefObject<T | null>,
    RefObject<HTMLDivElement | null>
] {
    const containerRef = useRef<T | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);
    const { shouldScroll } = useScroll();

    useEffect(() => {
        const container = containerRef.current;
        const end = endRef.current;

        if (container && end && shouldScroll) {
            const observer = new MutationObserver(() => {
                end.scrollIntoView({ behavior: "smooth" });
            });

            observer.observe(container, {
                childList: true,
                subtree: true,
            });

            return () => observer.disconnect();
        }
    }, [shouldScroll]);

    return [containerRef, endRef];
}