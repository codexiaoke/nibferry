'use client';

import { createContext } from 'react';

export const ConversationScrollRequest = createContext<() => void>(() => {});
