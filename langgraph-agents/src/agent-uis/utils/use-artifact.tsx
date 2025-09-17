import { useMemo } from 'react';
import type { Message } from '@langchain/langgraph-sdk';
import { UIMessage, useStreamContext } from '@langchain/langgraph-sdk/react-ui';

export function useArtifact<TContext = Record<string, unknown>>() {
  type Component = (props: {
    children: React.ReactNode;
    title?: React.ReactNode;
  }) => React.ReactNode;

  type Context = TContext | undefined;

  type Bag = {
    open: boolean;
    setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;

    context: Context;
    setContext: (value: Context | ((prev: Context) => Context)) => void;
  };

  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { artifact: [Component, Bag] } }
  >();

  const noop = useMemo(
    () =>
      [
        () => null,
        {
          open: true,
          setOpen: () => void 0,

          context: {} as TContext,
          setContext: () => void 0,
        },
      ] as [Component, Bag],
    []
  );

  return thread.meta?.artifact ?? noop;
}
