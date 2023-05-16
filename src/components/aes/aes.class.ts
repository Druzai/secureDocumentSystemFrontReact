import {BLOCK_LENGTH, N_B, R_CON, RS_BOX, S_BOX} from './aes.constants';
import {Buffer} from "buffer";

export class AES {
    private readonly key: number[];

    private readonly Nk;
    private readonly Nr;

    constructor(key: number[] | string) {
        if (!key) {
            throw new Error('AES requires key!');
        }
        if (typeof key === 'string') {
            key = this.base64ToArray(key);
        }
        switch (key.length) {
            case 16:
                this.Nk = 4;
                this.Nr = 10;
                break;
            case 24:
                this.Nk = 6;
                this.Nr = 12;
                break;
            case 32:
                this.Nk = 8;
                this.Nr = 14;
                break;
            default:
                throw new Error('AES supports only 16, 24 and 32 bytes keys!');
        }

        this.key = new Array(N_B * (this.Nr + 1) * 4);

        this.expandKey(key);
    }

    public encrypt(text: number[] | string): string {
        if (typeof text === 'string') {
            const arrayBuffer = new Buffer(text, 'utf16le');
            text = [];
            for (let i = 0; i < arrayBuffer.length; i++) {
                text.push(arrayBuffer[i]);
            }
        }
        let result: number[] = [];
        for (let i = 0; i < text.length; i += BLOCK_LENGTH) {
            result.push(...this.encryptBlock(text.slice(i, i + BLOCK_LENGTH)))
        }
        return this.arrayToBase64(result);
    }

    private encryptBlock(block: number[]): number[] {
        let state = this.createState(block);

        this.addRoundKey(state, 0);

        for (let r = 1; r < this.Nr; r++) {
            this.subBytes(state);
            this.shiftRows(state);
            this.mixColumns(state);
            this.addRoundKey(state, r);
        }

        this.subBytes(state);
        this.shiftRows(state);
        this.addRoundKey(state, this.Nr);

        return this.stateToResult(state);
    }

    public decrypt(encryptedText: string): string {
        let text: number[] = this.base64ToArray(encryptedText, true);

        let result: number[] = [];
        for (let i = 0; i < text.length; i += BLOCK_LENGTH) {
            result.push(...this.decryptBlock(text.slice(i, i + BLOCK_LENGTH)))
        }
        while (result[result.length - 1] === 0) {
            result.pop();
        }
        return new Buffer(result).toString('utf16le').trim();
    }

    private decryptBlock(block: number[]): number[] {
        let state = this.createState(block);

        this.addRoundKey(state, this.Nr);

        for (let r = this.Nr - 1; r >= 1; r--) {
            this.shiftRows(state, true);
            this.subBytes(state, true);
            this.addRoundKey(state, r);
            this.mixColumns(state, true);
        }

        this.shiftRows(state, true);
        this.subBytes(state, true);
        this.addRoundKey(state, 0);

        return this.stateToResult(state);
    }

    // Cypher functions
    private expandKey(key: number[]) {
        let tmp = new Array(4);
        let i = 0;
        let constant = new Array(4);

        while (i < this.Nk) {
            this.key[i * 4] = key[i * 4];
            this.key[i * 4 + 1] = key[i * 4 + 1];
            this.key[i * 4 + 2] = key[i * 4 + 2];
            this.key[i * 4 + 3] = key[i * 4 + 3];
            i++;
        }

        i = this.Nk;

        while (i < N_B * (this.Nr + 1)) {
            tmp[0] = this.key[(i - 1) * 4];
            tmp[1] = this.key[(i - 1) * 4 + 1];
            tmp[2] = this.key[(i - 1) * 4 + 2];
            tmp[3] = this.key[(i - 1) * 4 + 3];

            if (i % this.Nk === 0) {
                AES.rotWord(tmp);
                AES.subWord(tmp);
                constant = AES.roundConstant(i / this.Nk);
                tmp[0] = tmp[0] ^ constant[0];
                tmp[1] = tmp[1] ^ constant[1];
                tmp[2] = tmp[2] ^ constant[2];
                tmp[3] = tmp[3] ^ constant[3];
            } else if (this.Nk > 6 && i % this.Nk === 4) {
                AES.subWord(tmp);
            }

            this.key[i * 4] = this.key[(i - this.Nk) * 4] ^ tmp[0];
            this.key[i * 4 + 1] = this.key[(i - this.Nk) * 4 + 1] ^ tmp[1];
            this.key[i * 4 + 2] = this.key[(i - this.Nk) * 4 + 2] ^ tmp[2];
            this.key[i * 4 + 3] = this.key[(i - this.Nk) * 4 + 3] ^ tmp[3];
            i++;
        }
    }

    private createState(block: number[]): number[] {
        let state = new Array(4 * N_B);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < N_B; j++) {
                state[N_B * i + j] = block[i + 4 * j];
            }
        }

        return state;
    }

    private stateToResult(state: number[]): number[] {
        let result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < N_B; j++) {
                result[i + 4 * j] = state[N_B * i + j];
            }
        }
        return result;
    }

    private addRoundKey(state: number[], round: number) {
        for (let c = 0; c < N_B; c++) {
            state[c] ^= this.key[4 * N_B * round + 4 * c];
            state[N_B + c] ^= this.key[4 * N_B * round + 4 * c + 1];
            state[N_B * 2 + c] ^= this.key[4 * N_B * round + 4 * c + 2];
            state[N_B * 3 + c] ^= this.key[4 * N_B * round + 4 * c + 3];
        }
    }

    private mixColumns(state: number[], inverse: boolean = false) {
        const a: number[] = inverse ? [0x0e, 0x09, 0x0d, 0x0b] : [0x02, 0x01, 0x01, 0x03];
        const col: number[] = new Array(4);
        let result: number[] = new Array(4);

        for (let j = 0; j < N_B; j++) {
            for (let i = 0; i < 4; i++) {
                col[i] = state[N_B * i + j];
            }

            result[0] = AES.mult(a[0], col[0]) ^ AES.mult(a[3], col[1]) ^ AES.mult(a[2], col[2]) ^ AES.mult(a[1], col[3]);
            result[1] = AES.mult(a[1], col[0]) ^ AES.mult(a[0], col[1]) ^ AES.mult(a[3], col[2]) ^ AES.mult(a[2], col[3]);
            result[2] = AES.mult(a[2], col[0]) ^ AES.mult(a[1], col[1]) ^ AES.mult(a[0], col[2]) ^ AES.mult(a[3], col[3]);
            result[3] = AES.mult(a[3], col[0]) ^ AES.mult(a[2], col[1]) ^ AES.mult(a[1], col[2]) ^ AES.mult(a[0], col[3]);

            for (let i = 0; i < 4; i++) {
                state[N_B * i + j] = result[i];
            }
        }
    }

    private shiftRows(state: number[], inverse: boolean = false) {
        for (let i = 1; i < 4; i++) { // skipping row 0
            let s = 0;
            while (s < i) {
                const tmp = inverse ? state[N_B * i + N_B - 1] : state[N_B * i];

                if (inverse) {
                    for (let k = N_B - 1; k > 0; k--) {
                        state[N_B * i + k] = state[N_B * i + k - 1];
                    }

                    state[N_B * i] = tmp;
                } else {
                    for (let k = 1; k < N_B; k++) {
                        state[N_B * i + k - 1] = state[N_B * i + k];
                    }

                    state[N_B * i + N_B - 1] = tmp;
                }
                s++;
            }
        }
    }

    private subBytes(state: number[], inverse: boolean = false) {
        const AES_BOX = inverse ? RS_BOX : S_BOX;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < N_B; j++) {
                const row = (state[N_B * i + j] & 0xf0) >> 4;
                const col = state[N_B * i + j] & 0x0f;
                state[N_B * i + j] = AES_BOX[16 * row + col];
            }
        }
    }

    // Help functions
    private static xTime(b: number) {
        if ((b & 0x80) === 0) {
            return b << 1;
        }
        return (b << 1) ^ 0x11b;
    }

    private static mult(a: number, b: number) {
        let sum = 0;
        while (a !== 0) {
            if ((a & 1) !== 0) {
                sum ^= b; // add b if lowest bits of a and b are 1
            }

            b = this.xTime(b); // bit shift b
            a >>= 1;
        }
        return sum;
    }

    private static subWord(w: number[]) {
        for (let i = 0; i < 4; i++) {
            w[i] = S_BOX[16 * ((w[i] & 0xf0) >> 4) + (w[i] & 0x0f)];
        }
    }

    private static rotWord(w: number[]) {
        let tmp = w[0];
        for (let i = 0; i < 3; i++) {
            w[i] = w[i + 1];
        }
        w[3] = tmp;
    }

    private static roundConstant(i: number) {
        if (i === 1) {
            R_CON[0] = 0x01;
        } else if (i > 1) {
            R_CON[0] = 0x02;
            i--;
            while (i - 1 > 0) {
                R_CON[0] = AES.mult(R_CON[0], 0x02);
                i--;
            }
        }

        return R_CON;
    }

    private arrayToBase64(bytes: number[]) {
        let binary = '';
        const len = bytes.length;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    private arrayToString(bytes: number[]) {
        let string = '';
        for (let i = 0; i < bytes.length; i++) {
            string += String.fromCharCode(bytes[i]);
        }
        return string;
    }

    private base64ToArray(base64: string, convert_to_bytes: boolean = false) {
        const binary_string = window.atob(base64);
        let bytes: number[] = [];
        for (let i = 0; i < binary_string.length; i++) {
            let code = binary_string.charCodeAt(i);
            if (convert_to_bytes && code > 127)
                code -= 256;
            bytes.push(code);
        }
        return bytes;
    }

    public toUTF8Array(str: string) {
        const utf8: number[] = [];
        for (let i = 0; i < str.length; i++) {
            const charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(
                    0xffffffc0 | (charcode >> 6),
                    0xffffff80 | (charcode & 0x3f)
                );
            } else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(
                    0xffffffe0 | (charcode >> 12),
                    0xffffff80 | ((charcode >> 6) & 0x3f),
                    0xffffff80 | (charcode & 0x3f)
                );
            } else {
                // let's keep things simple and only handle chars up to U+FFFF...
                utf8.push(0xef, 0xbf, 0xbd); // U+FFFE "replacement character"
            }
        }
        return utf8;
    }
}
