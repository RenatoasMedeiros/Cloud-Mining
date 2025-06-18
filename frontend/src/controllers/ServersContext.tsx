import { Component, createContext } from "react";
import { ServersController } from "./ServersController";

interface ServersContext extends Omit<InstanceType<typeof ServersController>, keyof Component> { }

export const { Consumer, Provider } = createContext<ServersContext | null>(null);

export const ServersConsumer = Consumer;

export const ServersProvider = Provider;

export type { ServersContext }