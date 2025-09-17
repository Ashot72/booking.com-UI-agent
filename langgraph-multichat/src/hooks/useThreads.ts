import { useState, useCallback, useEffect } from "react";
import { useQueryState } from "nuqs";
import { Client, Thread } from "@langchain/langgraph-sdk"
import { getThreadSearchMetadata } from "@/utils/util";

export function useThreads() {
    const [apiUrl] = useQueryState("apiUrl")
    const [assistantId] = useQueryState("assistantId")

    const [threads, setThreads] = useState<Thread[]>([])
    const [threadLoading, setThreadsLoading] = useState(false)

    const getThreads = useCallback(async (): Promise<Thread[]> => {
        if (!apiUrl || !assistantId) return []

        //for development as apiKey is undefined
        const client = new Client({ apiUrl, apiKey: undefined })

        const threads = await client.threads.search({
            metadata: {
                ...getThreadSearchMetadata(assistantId)
            },
            limit: 100
        })

        return threads
    }, [apiUrl, assistantId])

    useEffect(() => {
        const load = async () => {
            setThreadsLoading(true)
            try {
                const result = await getThreads()
                setThreads(result)
            } finally {
                setThreadsLoading(false)
            }
        }

        if (apiUrl && assistantId) load()
    }, [apiUrl, assistantId, getThreads])

    return {
        threads,
        setThreads,
        threadLoading,
        setThreadsLoading,
        getThreads
    }
}