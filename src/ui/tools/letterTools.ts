export function increment(c: string): string {
    const arr = c.split("");

    if (!isLetters(arr)) {
        throw new Error('Letters Only');
    }

    return next(c);
}

function isLetters(arr: string[]): boolean {
    for (const char of arr) {
        if (char.toLowerCase() === char.toUpperCase()) {
            return false;
        }
    }
    return true;
}

function next(c: string): string {
    const u = c.toUpperCase();
    if (same(u, 'Z')) {
        let txt = '';
        let i = u.length;
        while (i--) {
            txt += 'A';
        }
        return txt + 'A';
    } else {
        let p = "";
        let q = "";
        if (u.length > 1) {
            p = u.substring(0, u.length - 1);
            q = String.fromCharCode(p.slice(-1).charCodeAt(0));
        }
        const l = u.slice(-1).charCodeAt(0);
        const z = nextLetter(l);
        if (z === 'A') {
            return p.slice(0, -1) + nextLetter(q.slice(-1).charCodeAt(0)) + z;
        } else {
            return p + z;
        }
    }
}

function nextLetter(l: number): string {
    if (l < 90) {
        return String.fromCharCode(l + 1);
    } else {
        return 'A';
    }
}

function same(str: string, char: string): boolean {
    let i = str.length;
    while (i--) {
        if (str[i] !== char) {
            return false;
        }
    }
    return true;
}

export const letters = {
    increment
};