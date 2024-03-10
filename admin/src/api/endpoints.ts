const GATEWAY = import.meta.env.VITE_API_ENDPOINT as string;
const BACKEND_API = `${GATEWAY}/backend`;

export const apiAddWord = () => `${BACKEND_API}/add-word`;

export const apiUnknownWords = (): string => `${BACKEND_API}/list`;
export const apiApproveWords = () => `${BACKEND_API}/approve-words`;
export const apiRejectWords = () => `${BACKEND_API}/reject-words`;
