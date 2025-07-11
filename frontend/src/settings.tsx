const API_URL = () => typeof window !== 'undefined' ? ((window as any)._env_ || {}).VITE_API_URL || '' : '';

const WS_URL = import.meta.env.VITE_WS_URL ||
    (typeof window !== 'undefined' ? ((window as any)._env_ || {}).VITE_WS_URL : '');

export {
    API_URL,
    WS_URL,
}