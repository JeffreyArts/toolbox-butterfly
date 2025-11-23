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
                        <input type="text" id="name" v-model="options.name" maxlength="16"/>
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                Max 16 characters, letters A-Z/a-z and space only.
                            </span>
                        </i>
                    </div>
                    <div class="option">
                        <label for="textureId">Texture ID:</label>
                        <input type="number" id="textureId" v-model="options.textureId" min="0" max="1023" />
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                Number between 0 and 1023.
                            </span>
                        </i>
                    </div>
                    <div class="option">
                        <label for="colorSchemeId">Color Scheme ID:</label>
                        <input type="number" id="colorSchemeId" v-model="options.colorSchemeId" min="0" max="1023" />
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                Number between 0 and 1023.
                            </span>
                        </i>
                    </div>
                    <div class="option">
                        <label for="colorOffset">Color Offset:</label>
                        <input type="number" id="colorOffset" v-model="options.colorOffset" min="0" max="15" />
                        <i class="info">
                            <span class="info-icon">?</span>
                            <span class="info-details">
                                Number between 0 and 15.
                            </span>
                        </i>
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
                        <input type="text" id="url" v-model="options.url" placeholder="http://jeffa.nl?n=" />
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
import { c, M } from "vite/dist/node/types.d-aGj9QkWt"
import { decode } from "punycode"

interface Options {
    id: number // 29-bit: 23 bits seconds/4 + 6 bits random
    name: string // max 16 chars, letters A-Z/a-z + space
    textureId: number // 0-1023
    colorSchemeId: number // 0-1023
    colorOffset: number // 0-15
    url: string
    encodedString: string
}

// Set of available characters for QR alphanumeric mode, just here for reference (question mark is not included!)
const qrAlphaNumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"

type IdentityField = {
  id: number;            // 29-bit: 23 bits seconds/4 + 6 bits random
  name: string;          // max 16 chars, letters A-Z/a-z + space
  textureId: number;     // 0-1023
  colorSchemeId: number; // 0-1023
  colorOffset: number;   // 0-15
};

// Generate and encode identity to QR-ready Base45 string of 29 + 96 + 10 + 10 + 4 = 149 bits
class IdentityEncoder {
    private static readonly BASE45_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"
    
    // --- Generate 29-bit ID ---
    generateId(): number {
        const now = new Date()
        const yearStart = new Date(now.getFullYear(), 0, 1)
        const secondsSinceYear = Math.floor((now.getTime() - yearStart.getTime()) / 1000)
        const secondsDiv4 = Math.floor(secondsSinceYear / 4) // 23 bits
        const random6 = Math.floor(Math.random() * 64)       // 6 bits
    
        // Combineer 23-bit seconds/4 in de hogere bits met 6-bit random in de lagere bits tot één 29-bit ID
        return (secondsDiv4 << 6) | random6                  // combine to 29-bit ID
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

    // Encoding
    private validateIdentityJSON(json: IdentityField): IdentityField {
        if (typeof json !== "object" || json === null)
            throw new Error("Input must be a non-null object")

        const { id, name, textureId, colorSchemeId, colorOffset } = json

        if (typeof id !== "number" || id < 0 || id > 0x1FFFFFFF)
            throw new Error("Invalid id: must be 0-536870911 (29-bit)")

        if (typeof name !== "string" || name.length > 16)
            throw new Error("Invalid name: must be string of max 16 chars")

        if (!/^[A-Za-z ]*$/.test(name))
            throw new Error("Invalid name: must contain only letters A-Z/a-z or space")

        if (typeof textureId !== "number" || textureId < 0 || textureId > 1023)
            throw new Error("Invalid textureId: must be 0-1023")
        if (typeof colorSchemeId !== "number" || colorSchemeId < 0 || colorSchemeId > 1023)
            throw new Error("Invalid colorSchemeId: must be 0-1023")
        if (typeof colorOffset !== "number" || colorOffset < 0 || colorOffset > 15)
            throw new Error("Invalid colorOffset: must be 0-15")

        return { id, name, textureId, colorSchemeId, colorOffset }
    }

    // Decoding
    private validateIdentityString(encodedString: string): string {
        const BASE45_CHARS = IdentityEncoder.BASE45_CHARS

        for (const c of encodedString) {
            if (!BASE45_CHARS.includes(c)) {
                throw new Error(`Invalid character in Base45 string: '${c}'`)
            }
        }

        // UPDATE: Totaal is nu 149 bits (was 147)
        // 149 bits / 8 = 18,625 bytes → afgerond naar 19 bytes (nog steeds 19, maar krap aan!)
        const minBytes = Math.ceil(149 / 8) // 19 bytes
        
        const minLength = Math.ceil(minBytes * 3 / 2) 
        if (encodedString.length < minLength) {
            throw new Error(`Base45 string too short: expected at least ${minLength} characters`)
        }

        return encodedString
    }

    // Encoding
    private encodeChar(c: string): number {
        if (c === " ") return 0
        if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 64
        if (c >= "a" && c <= "z") return c.charCodeAt(0) - 70 // a-z => 27-52
        throw new Error(`Invalid char: ${c}`)
    }

    // Decoding
    private decodeChar(code: number): string {
        if (code === 0) return " "
        if (code >= 1 && code <= 26) return String.fromCharCode(code + 64) // A-Z
        if (code >= 27 && code <= 52) return String.fromCharCode(code + 70) // a-z
        throw new Error(`Invalid char code: ${code}`)
    }

    // Encoding
    private push(bits: number[], value: number, size: number): void {
        for (let i = size - 1; i >= 0; i--) {
            bits.push((value >> i) & 1)
        }
    }

    // Decoding
    private unPush(bits: number[], cursor: number, size: number): { value: number; cursor: number } {
        let val = 0
        for (let i = 0; i < size; i++) {
            val = (val << 1) | bits[cursor++]
        }
        return { value: val, cursor }
    }

    // Encoding
    private bitPack(identity: IdentityField): Uint8Array {
        const bits: number[] = []

        // ID: 29 bits
        this.push(bits, identity.id, 29)

        // Name: 16 × 6 bits
        const name = identity.name.padEnd(16, " ")
        for (const c of name) {
            this.push(bits, this.encodeChar(c), 6)
        }

        // textureId: 10 bits
        this.push(bits, identity.textureId, 10)
        
        // colorSchemeId: 10 bits
        this.push(bits, identity.colorSchemeId, 10)

        // colorOffset: 4 bits
        this.push(bits, identity.colorOffset, 4)

        // Convert bits to bytes
        const bytes = new Uint8Array(Math.ceil(bits.length / 8))
        bits.forEach((bit, i) => {
            bytes[i >> 3] |= bit << (7 - (i % 8))
        })

        return bytes
    }

    // Decoding
    private bitUnpack(bytes: Uint8Array): IdentityField {

        const bits: number[] = []
        for (let i = 0; i < bytes.length; i++) {
            for (let j = 7; j >= 0; j--) {
                bits.push((bytes[i] >> j) & 1)
            }
        }

        let cursor = 0
        let result


        // ID: 29 bits
        result = this.unPush(bits, cursor, 29)
        const id = result.value
        cursor = result.cursor

        // Name: 16 × 6 bits
        let name = ""
        for (let i = 0; i < 16; i++) {
            result = this.unPush(bits, cursor, 6)
            name += this.decodeChar(result.value)
            cursor = result.cursor
        }
        name = name.trimEnd()

        // textureId: 10 bits
        result = this.unPush(bits, cursor, 10)
        const textureId = result.value
        cursor = result.cursor

        // colorSchemeId: 10 bits
        result = this.unPush(bits, cursor, 10)
        const colorSchemeId = result.value
        cursor = result.cursor

        // colorOffset: 4 bits
        result = this.unPush(bits, cursor, 4)
        const colorOffset = result.value
        cursor = result.cursor

        return { id, name, textureId, colorSchemeId, colorOffset }
    }

    private base45Encode(bytes: Uint8Array): string {
        const chars = IdentityEncoder.BASE45_CHARS
        let result = ""

        for (let i = 0; i < bytes.length; i += 2) {
            
            if (i + 1 < bytes.length) {
                // Case 1: Twee bytes (16-bit X -> 3 Base45 karakters)
                const x = (bytes[i] << 8) | bytes[i + 1]

                const e = Math.floor(x / (45*45))
                const d = Math.floor((x % (45*45)) / 45)
                const c = x % 45
                
                result += chars[c] + chars[d] + chars[e]
            } else {
                // Case 2: Eén resterende byte (8-bit X -> 2 Base45 karakters)
                const x = bytes[i] // Correct: X is direct de byte waarde

                const d = Math.floor(x / 45)
                const c = x % 45

                result += chars[c] + chars[d]
            }
        }

        return result
    }
    private base45Decode(str: string): Uint8Array {
        const chars = IdentityEncoder.BASE45_CHARS
        const bytes: number[] = []

        let i = 0
        while (i < str.length) {
            // We hebben altijd minimaal 2 chars nodig voor 1 byte
            const c = chars.indexOf(str[i++])
            const d = chars.indexOf(str[i++])
            
            // Check of er een derde char is
            const hasThirdChar = i < str.length
            let e = 0
            
            if (hasThirdChar) {
                e = chars.indexOf(str[i++])
            }

            const x = c + d * 45 + e * 45 * 45

            if (hasThirdChar) {
                // 3 karakters gelezen = ALTIJD 2 bytes output
                // Ook als de eerste byte 0x00 is (x <= 0xFF)
                bytes.push((x >> 8) & 0xff)
                bytes.push(x & 0xff)
            } else {
                // 2 karakters gelezen = 1 byte output (restant)
                bytes.push(x & 0xff)
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
            encoder: new IdentityEncoder(),
            decodedString: "",
            options: {
                id: 0,
                name: "",
                textureId: 0, // 0-1023
                colorSchemeId: 0, // 0-1023
                colorOffset: 0, // 0-15
                url: "https://jeffa.nl",
                encodedString: "",
            } as Options,
        }
    },
    computed: {
        encodedObject() {
            try {
                const encoded = this.encoder.encode(this.options)

                const canvas = this.$refs.qrCode as HTMLCanvasElement
                QR.toCanvas(canvas, `${this.options.url}?n=${encoded}`, function (error: any) {
                    if (error) {
                        console.error(error)
                    }
                })
                return encoded
            } catch (e) {
                return `Error: ${(e as Error).message}`
            }
        },
        decodedJSON() {
            try {
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
</style>