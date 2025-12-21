const SET_COOKIE_HEADER = 'set-cookie';

type HeadersWithGetSetCookie = Headers & {
    getSetCookie?: () => string[];
};

export function appendSetCookieHeaders(source: Headers, target: Headers): void {
    const extended = source as HeadersWithGetSetCookie;
    const cookies = typeof extended.getSetCookie === 'function' ? extended.getSetCookie() : null;

    if (cookies?.length) {
        for (const cookie of cookies) {
            target.append(SET_COOKIE_HEADER, cookie);
        }
        return;
    }

    const setCookie = source.get(SET_COOKIE_HEADER);
    if (setCookie) {
        target.set(SET_COOKIE_HEADER, setCookie);
    }
}
