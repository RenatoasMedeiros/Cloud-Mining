import { Component, createContext } from "react";
import { AuthController } from "./AuthController";
import { User } from "../types/user";

interface AuthContext extends Omit<InstanceType<typeof AuthController>, keyof Component> {
    user: User | null;
    token: string | null;
}

export const { Consumer, Provider } = createContext<AuthContext | null>(null);

export const AuthConsumer = Consumer;

export const AuthProvider = Provider;

export type { AuthContext }