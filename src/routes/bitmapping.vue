<template>
    <div class="options-overview">
        <header class="title">
            <h1>Bitmapper</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1">
                <canvas ref="qrCode"></canvas>
            </div>
            <footer>
                <label for="">
                    {{ encodedObject }}
                </label>
            </footer>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Identity encoding" >
                    <div class="option">
                        <label for="id">Id:</label>
                        <input type="number" id="id" disabled v-model="options.id" />&nbsp;
                        <button @click="options.id = encoder.generateId()" class="button __isSmall">Regenerate ID</button>
                    </div>
                    <div class="option">
                        <label for="name">Name:</label>
                        <input type="text" id="name" v-model="options.name" maxlength="32"/>
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                Max 16 characters, letters A-Z/a-z and space only.
                            </span>
                        </i>
                    </div>


                    <div class="option">
                        <label for="seed">Seed:</label>
                        <input type="text" id="seed" v-model="options.seed" />&nbsp;
                        <button @click="parseSeed(options.seed)" class="button __isSmall">Parse</button>
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                De identity string kan ook gegenereerd vanuit een input string.
                            </span>
                        </i>

                    </div>
                    <div class="option">
                        <label for="seed">Make up parsable seed:</label>
                        <input type="text" id="seed" v-model="parsableSeed" />&nbsp;
                        <button @click="makeUpParsableSeed()" class="button __isSmall">
                            <span v-if="!parsableSeed">Make up</span>    
                            <span v-if="parsableSeed">Another one</span>    
                        </button>
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                Hulper functie om een string te maken die omgezet kan worden naar een valide identity.
                            </span>
                        </i>
                    </div>

                    <div class="option-row">
                        <div class="option">
                            <label for="textureIndex">Texture ID:</label>
                            <input type="number" id="textureIndex" v-model.number="options.textureIndex" min="0" max="1023" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    Number between 0 and 1023.
                                </span>
                            </i>
                        </div>
                        <div class="option">
                            <label for="colorSchemeIndex">Color Scheme ID:</label>
                            <input type="number" id="colorSchemeIndex" v-model.number="options.colorSchemeIndex" min="0" max="1023" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    Number between 0 and 1023.
                                </span>
                            </i>
                        </div>
                        <div class="option">
                            <label for="offset">Offset:</label>
                            <input type="number" id="offset" v-model.number="options.offset" min="0" max="15" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    Number between 0 and 15.
                                </span>
                            </i>
                        </div>
                    </div>
                    <div class="option-row">
                        <div class="option">
                            <label>Gender</label>
                            <input type="radio" id="gender-v0" :value="0" v-model.number="options.gender">
                            <label for="gender-v0">
                                Male
                            </label>

                            <input type="radio" id="gender-v1" :value="1" v-model.number="options.gender">
                            <label for="gender-v1">
                                Female
                            </label>
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    This will set the gender bit to either 0 (male) or 1 (female)
                                </span>
                            </i>
                        </div>
                        <div class="option">
                            <label>Length</label>
                            <input type="number" id="length" v-model.number="options.length" min="3" max="20" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    This will set the length of the wurmpje
                                </span>
                            </i>
                        </div>
                        <div class="option">
                            <label>Thickness</label>
                            <input type="number" id="thickness" v-model.number="options.thickness" min="8" max="40" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    This will set the thickness of the wurmpje
                                </span>
                            </i>
                        </div>
                    </div>
                </div>
                
                <div class="option-group" name="Identity decoder" >
                    <div class="option">
                        <label for="encodedString">Encoded string:</label>
                        <input type="text" id="encodedString" v-model="options.encodedString" />
                    </div>
                    <pre>{{ decodedJSON }}</pre>
                </div>
                <div class="option-group" name="QR options" >
                    <div class="option">
                        <label for="url">Url:</label>
                        <input type="text" id="url" v-model="options.url" placeholder="http://jeffa.nl?i=" />
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                The webaddress where the identity will be used.
                            </span>
                        </i>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import QR from "qrcode"

interface Options {
    id: number // 29-bit: 23 bits seconds/4 + 6 bits random
    name: string // max 32 chars, letters A-Z/a-z + space
    textureIndex: number // 0-1023
    colorSchemeIndex: number // 0-1023
    offset: number // 0-15
    url: string
    gender: number // 0 | 1
    seed: string
    length: number // 3-20
    thickness: number // 8-40
    encodedString: string
}

// Set of available characters for QR alphanumeric mode, just here for reference (question mark is not included!)
const qrAlphaNumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"

type IdentityField = {
  id: number;               // 29-bit: 23 bits seconds/4 + 6 bits random
  name: string;             // max 32 chars, letters A-Z/a-z + space
  textureIndex: number;     // 0-1023
  colorSchemeIndex: number; // 0-1023
  offset: number;           // 0-15
  length: number;           // 0-32
  thickness: number;        // 0-32
  gender: number;           // 0 | 1
};

// Generate and encode identity to QR-ready Base45 string of 29 + 96 + 10 + 10 + 4 + 5 + 5 + 1= 160 bits
class Identity {
    private static readonly BASE45_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"

    // --- Generate 29-bit ID ---
    generateId(): number {
        const now = new Date()
        const yearStart = new Date(now.getFullYear(), 0, 1)
        const secondsSinceYear = Math.floor((now.getTime() - yearStart.getTime()) / 1000)
        const secondsDiv4 = Math.floor(secondsSinceYear / 4)
        const random6 = Math.floor(Math.random() * 64)
        return (secondsDiv4 << 6) | random6
    }

    // Encoding
    encode(json: IdentityField): string {
        const identity = this.validateIdentityJSON(json)
        const bytes = this.bitPack(identity)
        return this.base45Encode(bytes)
    }

    // Decoding
    decode(encoded: string): IdentityField {
        this.validateIdentityString(encoded)
        const bytes = this.base45Decode(encoded)
        return this.bitUnpack(bytes)
    }

    // --- Generate Identity from String ---
    async deriveIdentityFromHash(string: string): Promise<IdentityField> {
        const data = new TextEncoder().encode(string)
        const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", data))
        let bitIndex = 0

        function readBits(n: number): number {
            let val = 0
            for (let i = 0; i < n; i++) {
                const byte = hash[Math.floor(bitIndex / 8)]
                const bit = (byte >> (7 - (bitIndex % 8))) & 1
                val = (val << 1) | bit
                bitIndex++
            }
            return val
        }

        const textureIndex = readBits(10)
        const colorSchemeIndex = readBits(10)
        const offset = readBits(4)
        const gender = readBits(1)
        const length = readBits(4) + 3
        const thickness = readBits(5) + 8

        return {
            id: this.generateId(),
            name: "",
            textureIndex,
            colorSchemeIndex,
            offset,
            gender,
            length,
            thickness,
        }
    }

    stringToId(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0
        }
        return hash & 0x1FFFFFFF
    }

    // ---------------- VALIDATION ----------------

    private validateIdentityJSON(json: IdentityField): IdentityField {
        const { id, name, textureIndex, colorSchemeIndex, offset, gender, length, thickness } = json

        if (typeof id !== "number" || id < 0 || id > 0x1FFFFFFF)
            throw new Error("Invalid id")

        if (typeof name !== "string" || name.length > 32)
            throw new Error("Invalid name")

        if (!/^[A-Za-z ]*$/.test(name))
            throw new Error("Invalid name chars")

        if (textureIndex < 0 || textureIndex > 1023)
            throw new Error("Invalid textureIndex")

        if (colorSchemeIndex < 0 || colorSchemeIndex > 1023)
            throw new Error("Invalid colorSchemeIndex")

        if (offset < 0 || offset > 15)
            throw new Error("Invalid offset")

        
        if (gender !== 0 && gender !== 1)
            throw new Error("Invalid gender")

        if (length < 3 || length > 24)
            throw new Error("Invalid length")

        if (thickness < 8 || thickness > 40)
            throw new Error("Invalid thickness")

        return json
    }

    validateIdentityString(encodedString: string): string {
        for (const c of encodedString) {
            if (!Identity.BASE45_CHARS.includes(c)) {
                throw new Error(`Invalid Base45 character: '${c}'`)
            }
        }

        if (encodedString.length !== 50) {
            throw new Error("Invalid Base45 length")
        }

        return encodedString
    }

    // ---------------- CHAR CODING ----------------

    private encodeChar(c: string): number {
        if (c === " ") return 0
        if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 64
        if (c >= "a" && c <= "z") return c.charCodeAt(0) - 70
        throw new Error(`Invalid char: ${c}`)
    }

    private decodeChar(code: number): string {
        if (code === 0) return " "
        if (code >= 1 && code <= 26) return String.fromCharCode(code + 64)
        if (code >= 27 && code <= 52) return String.fromCharCode(code + 70)
        throw new Error(`Invalid char code: ${code}`)
    }

    // ---------------- BIT PACKING ----------------

    private push(bits: number[], value: number, size: number): void {
        for (let i = size - 1; i >= 0; i--) {
            bits.push((value >> i) & 1)
        }
    }

    private unPush(bits: number[], cursor: number, size: number) {
        let val = 0
        for (let i = 0; i < size; i++) {
            val = (val << 1) | bits[cursor++]
        }
        return { value: val, cursor }
    }

    private bitPack(identity: IdentityField): Uint8Array {
        const bits: number[] = []

        this.push(bits, identity.id, 29)

        const name = identity.name.padEnd(32, " ")
        for (const c of name) this.push(bits, this.encodeChar(c), 6)

        this.push(bits, identity.textureIndex, 10)
        this.push(bits, identity.colorSchemeIndex, 10)
        this.push(bits, identity.offset, 4)
        this.push(bits, identity.gender, 1)
        this.push(bits, identity.length, 5)
        this.push(bits, identity.thickness, 6)

        const bytes = new Uint8Array(Math.ceil(bits.length / 8))
        let byte = 0

        for (let i = 0; i < bits.length; i++) {
            byte = (byte << 1) | bits[i]
            if (i % 8 === 7) {
                bytes[i >> 3] = byte
                byte = 0
            }
        }

        if (bits.length % 8 !== 0) {
            const pad = 8 - (bits.length % 8)
            byte <<= pad
            bytes[bytes.length - 1] = byte
        }

        return bytes
    }

    private bitUnpack(bytes: Uint8Array): IdentityField {
        const bits: number[] = []
        for (const b of bytes) {
            for (let j = 7; j >= 0; j--) {
                bits.push((b >> j) & 1)
            }
        }

        let cursor = 0
        let r

        r = this.unPush(bits, cursor, 29)
        const id = r.value; cursor = r.cursor

        let name = ""
        for (let i = 0; i < 32; i++) {
            r = this.unPush(bits, cursor, 6)
            name += this.decodeChar(r.value)
            cursor = r.cursor
        }
        name = name.trimEnd()

        r = this.unPush(bits, cursor, 10)
        const textureIndex = r.value; cursor = r.cursor

        r = this.unPush(bits, cursor, 10)
        const colorSchemeIndex = r.value; cursor = r.cursor

        r = this.unPush(bits, cursor, 4)
        const offset = r.value; cursor = r.cursor

        r = this.unPush(bits, cursor, 1)
        const gender = r.value; cursor = r.cursor

        r = this.unPush(bits, cursor, 5)
        const length = r.value; cursor = r.cursor

        r = this.unPush(bits, cursor, 6)
        const thickness = r.value

        return { id, name, textureIndex, colorSchemeIndex, offset, gender, length, thickness }
    }

    // ---------------- BASE45 ----------------

    private base45Encode(bytes: Uint8Array): string {
        const chars = Identity.BASE45_CHARS
        let result = ""

        for (let i = 0; i < bytes.length; i += 2) {
            if (i + 1 < bytes.length) {
                const x = (bytes[i] << 8) | bytes[i + 1]
                result += chars[x % 45]
                result += chars[Math.floor(x / 45) % 45]
                result += chars[Math.floor(x / (45 * 45))]
            } else {
                const x = bytes[i]
                result += chars[x % 45]
                result += chars[Math.floor(x / 45)]
            }
        }

        return result
    }

    private base45Decode(str: string): Uint8Array {
        const chars = Identity.BASE45_CHARS
        const bytes: number[] = []

        let i = 0
        while (i < str.length) {
            const remaining = str.length - i

            if (remaining >= 3) {
                const c = chars.indexOf(str[i++])
                const d = chars.indexOf(str[i++])
                const e = chars.indexOf(str[i++])
                const x = c + d * 45 + e * 45 * 45
                bytes.push((x >> 8) & 0xff, x & 0xff)
            } else if (remaining === 2) {
                const c = chars.indexOf(str[i++])
                const d = chars.indexOf(str[i++])
                bytes.push((c + d * 45) & 0xff)
            } else {
                throw new Error("Invalid Base45 data")
            }
        }

        return new Uint8Array(bytes)
    }
}



export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            encoder: new Identity(),
            decodedString: "",
            parsableSeed: "",
            seedIndex: 0,
            options: {
                id: 0,
                name: "",
                seed: "",
                textureIndex: 0, // 0-1023
                colorSchemeIndex: 0, // 0-1023
                offset: 0, // 0-15
                gender: 0,
                url: "https://jeffa.nl",
                encodedString: "",
            } as Options,
        }
    },
    computed: {
        encodedObject() {
            try {
                console.log(this.options)
                const encoded = this.encoder.encode(this.options)
                const canvas = this.$refs.qrCode as HTMLCanvasElement
                QR.toCanvas(canvas, `${this.options.url}?n=${encoded}`, function (error: any) {
                    if (error) {
                        console.error(error)
                    }
                })
                return encoded
                return encodeURIComponent(encoded)
            } catch (e) {
                return `Error: ${(e as Error).message}`
            }
        },
        decodedJSON() {
            try {
                // const encodedString = decodeURIComponent(this.options.encodedString)
                const decoded = this.encoder.decode(this.options.encodedString)
                return JSON.stringify(decoded, null, 2)
            } catch (e) {
                return `Error: ${(e as Error).message}`
            }
        }
    },
    mounted() {
        // Example usage
        this.options.id = this.encoder.generateId() // automatisch gegenereerd
    },
    methods: {
        async parseSeed(seed: string) {
            const identity = new Identity()
            const identityJSON = await identity.deriveIdentityFromHash(seed)

            this.options.textureIndex = identityJSON.textureIndex
            this.options.colorSchemeIndex =  identityJSON.colorSchemeIndex
            this.options.offset = identityJSON.offset
            this.options.gender = identityJSON.gender
            this.options.length = identityJSON.length
            this.options.thickness = identityJSON.thickness
            
            return identityJSON
            
            // console.log(hash,identity.deriveIdentityFromHash(hash))
        },
        async makeUpParsableSeed() {
            let base = "https://www.jeffreyarts.nl/"
            let i = this.seedIndex
            let validMatch = false
            while (!validMatch && i < this.seedIndex+1000) {
                i++
                try {
                    const seed = await this.parseSeed(base + i)
                    if (seed.textureIndex < 100  && seed.colorSchemeIndex <100) {
                        validMatch = true
                        this.parsableSeed = base + i
                        this.seedIndex = i
                        break
                    }
                } catch (e) {
                    validMatch = true
                    console.error(e)
                }
            }
            this.parseSeed(base + i)
            
        }
    }
})
</script>


<style lang="scss" scoped>

.viewport-content-strip {
    width: 100%;
    background-color: #fff;
    height: 48px;
    border-radius: 8px;
}

.option-color-window {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: inline-block;
    translate: 10px 7px;
}
.option-row {
    display: flex;
    flex-flow: row;
    gap: 16px;
}

.option-group pre {
    overflow-x: auto;
    padding-bottom: 16px;
}
</style>