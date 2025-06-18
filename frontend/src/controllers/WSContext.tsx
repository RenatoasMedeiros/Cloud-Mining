import { Component, createContext } from "react";
import { WSController } from "./WSController";

interface WSContext extends Omit<InstanceType<typeof WSController>, keyof Component> {
    messages: string[];
    isConnected: boolean;
}

export const { Consumer, Provider } = createContext<WSContext | null>(null);

export const WSConsumer = Consumer;

export const WSProvider = Provider;

export type { WSContext }