import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import {
  RemoveUIMessage,
  UIMessage,
  uiMessageReducer,
} from '@langchain/langgraph-sdk/react-ui/server';
import { Booking } from '../booking/types';

// Supervisor state schema that includes all fields needed by all agents
export const SupervisorAnnotation = Annotation.Root({
  messages: MessagesAnnotation.spec.messages,
  ui: Annotation<
    UIMessage[],
    UIMessage | RemoveUIMessage | (UIMessage | RemoveUIMessage)[]
  >({ default: () => [], reducer: uiMessageReducer }),
  timestamp: Annotation<number>,
  next: Annotation<'jobNotification' | 'search' | 'chat' | 'booking'>,

  // Booking-specific fields (optional, will be undefined for other agents)
  trips: Annotation<Booking[]>(),
  activeTripIndex: Annotation<number | undefined>(),
  isNewTripRequest: Annotation<boolean | undefined>(),
});

export type SupervisorState = typeof SupervisorAnnotation.State;
export type SupervisorUpdate = typeof SupervisorAnnotation.Update;
