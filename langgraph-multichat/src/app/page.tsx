"use client";

import { toast, Toaster } from 'sonner';
import { useQueryState } from 'nuqs';
import Settings from "@/components/Settings";
import { StreamProvider } from "@/providers/Stream";
import { Thread } from "@/components/index";
import ThreadList from "@/components/ThreadHistory";
import PromptInput from "@/components/PromptInput";
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';
import { constructOpenInStudioURL } from '@/utils/util';
import { ArtifactProvider } from '@/components/artifact';
import RightPanel from '@/components/RightPanel';

export default function Home() {
  const [apiUrl, setApiUrl] = useQueryState("apiUrl")
  const [assistantId, setAssistantId] = useQueryState("assistantId")
  const [threadId, setThreadId] = useQueryState("threadId")

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const handleClearQuery = () => {
    setApiUrl(null);
    setAssistantId(null);
    setThreadId(null)
  };

  const handleOpenInStudio = () => {
    if (!apiUrl) {
      toast.error("Error", {
        description: "Please set the LangGraph deployment URL in settings.",
        duration: 5000,
        richColors: true,
        closeButton: true,
      });
      return;
    }

    const studioUrl = constructOpenInStudioURL(apiUrl, threadId ?? undefined);
    window.open(studioUrl, "_blank");
  };

  return (
    <section className="overflow-x-hidden">
      <div className="py-5">
        <div className="row d-flex justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-6">
            <Toaster />
            {(!apiUrl || !assistantId) ? (
              <Settings />
            ) : (
              <div className="card">
                <StreamProvider>
                  <ArtifactProvider>
                  <div className="card-header d-flex justify-content-between align-items-center p-3">
                    <h5 className="mb-0">
                      <ThreadList />
                    </h5>
                    <div><b>{assistantId.replace(/[_-]/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}</b></div>
                    <div className="d-flex">
                      <button
                        style={{ textTransform: "none", marginRight: "4px" }}
                        type="button"
                        className="btn btn-primary btn-sm fs-7"
                        onClick={handleOpenInStudio}
                      >
                        <i className="fas fa-cube me-2"></i> Studio
                      </button>

                      <button
                        style={{ textTransform: "none" }}
                        type="button"
                        className="btn btn-primary btn-sm fs-7"
                        onClick={handleClearQuery}
                      >
                        <i className="fas fa-comments me-2"></i> Let's Chat App
                      </button>
                    </div>
                  </div>
                  <div
                    ref={messagesContainerRef}
                    className="card-body overflow-y-scroll"
                    style={{ position: "relative", height: "600px" }}
                  >
                    <div className="divider d-flex align-items-center mb-4">
                      <div
                        className="text-center mx-3 mb-0"
                        style={{ color: "#a2aab7" }}
                      >
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        })}
                      </div>
                    </div>
                    <Thread />
                    <div ref={messagesEndRef} />
                  </div>
                  <PromptInput />

                  <RightPanel />
                  </ArtifactProvider>
                </StreamProvider>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
