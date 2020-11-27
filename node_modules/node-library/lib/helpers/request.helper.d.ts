interface IRequest {
    id: string;
    user: {
        isConfirmed: boolean;
        isAuthenticated: boolean;
        email: string;
        id: string;
    };
    header: {
        ip: string;
        token: {
            type: string;
            value: string;
            expiryTime: number;
            isExpired: boolean;
            secondsToExpiry: number;
        };
    };
    raw: {
        body: object;
        query: object;
        params: object;
    };
    location: {
        latitude: number;
        longitude: number;
        raw: object;
    };
    hasToken: boolean;
}
export default class Request implements IRequest {
    id: string;
    user: {
        email: string;
        id: string;
        isAuthenticated: boolean;
        isConfirmed: boolean;
    };
    header: {
        ip: string;
        token: {
            type: string;
            value: string;
            expiryTime: number;
            isExpired: boolean;
            secondsToExpiry: number;
        };
    };
    raw: {
        body: object;
        query: object;
        params: object;
    };
    location: {
        latitude: number;
        longitude: number;
        raw: object;
    };
    hasToken: boolean;
    constructor();
    getId(): string;
    setIP(ip: string): string;
    getIP(): string;
    setEmail(email: string): string;
    getEmail(): string;
    setUserId(id: string): string;
    getUserId(): string;
    setToken(tokenP: {
        type: string;
        value: string;
        expiryTime: number;
    }): {
        type: string;
        value: string;
        expiryTime: number;
        isExpired: boolean;
        secondsToExpiry: number;
    };
    getToken(): {
        type: string;
        value: string;
        expiryTime: number;
        isExpired: boolean;
        secondsToExpiry: number;
    };
    getTokenValue(): string;
    getTokenType(): string;
    isTokenExpired(): boolean;
    isUserAuthenticated(): boolean;
    isUserConfirmed(): boolean;
    setConfirmed(isConfirmed: boolean): boolean;
    setLocation(location: {
        latitude: number;
        longitude: number;
        raw: object;
    }): void;
    getLocation(): {
        latitude: number;
        longitude: number;
        raw: object;
    };
    setRaw(raw: {
        body: object;
        query: object;
        params: object;
    }): {
        body: object;
        query: object;
        params: object;
    };
    getRaw(): {
        body: object;
        query: object;
        params: object;
    };
}
export {};
