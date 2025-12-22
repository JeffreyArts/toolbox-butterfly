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
                            <input type="number" id="textureIndex" v-model="options.textureIndex" min="0" max="1023" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    Number between 0 and 1023.
                                </span>
                            </i>
                        </div>
                        <div class="option">
                            <label for="colorSchemeIndex">Color Scheme ID:</label>
                            <input type="number" id="colorSchemeIndex" v-model="options.colorSchemeIndex" min="0" max="1023" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    Number between 0 and 1023.
                                </span>
                            </i>
                        </div>
                        <div class="option">
                            <label for="offset">Offset:</label>
                            <input type="number" id="offset" v-model="options.offset" min="0" max="15" />
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
                            <input type="radio" id="gender-v0" value="0" v-model="options.gender">
                            <label for="gender-v0">
                                Male
                            </label>

                            <input type="radio" id="gender-v1" value="1" v-model="options.gender">
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
                            <input type="number" id="length" v-model="options.length" min="0" max="32" />
                            <i class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    This will set the length of the wurmpje
                                </span>
                            </i>
                        </div>
                        <div class="option">
                            <label>Thickness</label>
                            <input type="number" id="thickness" v-model="options.thickness" min="8" max="64" />
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
    name: string // max 16 chars, letters A-Z/a-z + space
    textureIndex: number // 0-1023
    colorSchemeIndex: number // 0-1023
    offset: number // 0-15
    url: string
    gender: number // 0 | 1
    seed: string
    length: number // 3-20
    thickness: number // 8-64
    encodedString: string
}

// Set of available characters for QR alphanumeric mode, just here for reference (question mark is not included!)
const qrAlphaNumeric = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"

type IdentityField = {
  id: number;               // 29-bit: 23 bits seconds/4 + 6 bits random
  name: string;             // max 16 chars, letters A-Z/a-z + space
  textureIndex: number;     // 0-1023
  colorSchemeIndex: number; // 0-1023
  offset: number;           // 0-15
  length: number;           // 0-32
  thickness: number;        // 0-64
  gender: number;           // 0 | 1
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
        const textureIndex = readBits(10)      // 0-1023
        const colorSchemeIndex = readBits(10)  // 0-1023
        const offset = readBits(4)             // 0-15
        const gender = readBits(1)             // 0 of 1
        let length = readBits(4)               // 0-15
        let thickness = readBits(5)            // 8-64


        
        return {
            id: this.generateId(),
            name: "",
            textureIndex,
            colorSchemeIndex,
            offset,
            gender,
            length: length + 3,                 // 3-18
            thickness: thickness + 8,           // 8-39
        }
    }

    stringToId(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0 // 32-bit unsigned
        }
        // Limiteer tot 29 bits
        return hash & 0x1FFFFFFF // 29 bits mask: 2^29 - 1
    }

    // Encoding
    private validateIdentityJSON(json: IdentityField): IdentityField {
        if (typeof json !== "object" || json === null) {
            throw new Error("Input must be a non-null object")
        }

        const { id, name, textureIndex, colorSchemeIndex, offset, gender, length, thickness } = json

        // Check id
        if (typeof id !== "number" || id < 0 || id > 0x1FFFFFFF) {
            throw new Error("Invalid id: must be 0-536870911 (29-bit)")
        }
        
        // Check name 
        if (typeof name !== "string" || name.length > 16) {
            throw new Error("Invalid name: must be string of max 16 chars")
        }

        if (!/^[A-Za-z ]*$/.test(name)) {
            throw new Error("Invalid name: must contain only letters A-Z/a-z or space")
        }

        // Check textureIndex
        if (typeof textureIndex !== "number" || textureIndex < 0 || textureIndex > 1023) {
            throw new Error("Invalid textureIndex: must be 0-1023")
        }

        // Check colorSchemeIndex
        if (typeof colorSchemeIndex !== "number" || colorSchemeIndex < 0 || colorSchemeIndex > 1023){
            throw new Error("Invalid colorSchemeIndex: must be 0-1023")
        }

        // Check offset
        if (typeof offset !== "number" || offset < 0 || offset > 15) {
            throw new Error("Invalid offset: must be 0-15")
        }

        // Check gender
        if (gender != 0 && gender != 1) {
            throw new Error("Invalid gender: must be 0 (male) or 1 (female)")
        }
        
        // Check length
        if (typeof length !== "number" || length < 3 || length > 20) {
            throw new Error("Invalid length: must be 3-20")
        }

        // Check thickness
        if (typeof thickness !== "number" || thickness < 8 || thickness > 64) {
            throw new Error("Invalid thickness: must be 8-64")
        }

        return { id, name, textureIndex, colorSchemeIndex, offset, gender, length, thickness }
    }

    // Decoding
    validateIdentityString(encodedString: string): string {
        const BASE45_CHARS = IdentityEncoder.BASE45_CHARS

        for (const c of encodedString) {
            if (!BASE45_CHARS.includes(c)) {
                throw new Error(`Invalid character in Base45 string: '${c}'`)
            }
        }

        // UPDATE: Totaal is nu 160 bits (was 147)
        // 160 bits / 8 = 20 bytes → afgerond naar 20 bytes
        const minBytes = Math.ceil(160 / 8) // 20 bytes
        
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

        // textureIndex: 10 bits
        this.push(bits, identity.textureIndex, 10)
        
        // colorSchemeIndex: 10 bits
        this.push(bits, identity.colorSchemeIndex, 10)

        // offset: 4 bits
        this.push(bits, identity.offset, 4)

        // gender: 1 bit
        this.push(bits, identity.gender, 1)

        // length: 5 bits
        this.push(bits, identity.length, 5)

        // thickness: 6 bits
        this.push(bits, identity.thickness, 6)

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

        // textureIndex: 10 bits
        result = this.unPush(bits, cursor, 10)
        const textureIndex = result.value
        cursor = result.cursor

        // colorSchemeIndex: 10 bits
        result = this.unPush(bits, cursor, 10)
        const colorSchemeIndex = result.value
        cursor = result.cursor

        // offset: 4 bits
        result = this.unPush(bits, cursor, 4)
        const offset = result.value
        cursor = result.cursor

        // gender: 1 bit
        result = this.unPush(bits, cursor, 1)
        const gender = result.value
        cursor = result.cursor

        // length: 5 bits
        result = this.unPush(bits, cursor, 5)
        const length = result.value
        cursor = result.cursor

        // thickness: 6 bits
        result = this.unPush(bits, cursor, 6)
        const thickness = result.value
        cursor = result.cursor

        return { id, name, textureIndex, colorSchemeIndex, offset, gender, length, thickness }
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
        async parseSeed(seed: string) {
            const identity = new IdentityEncoder()
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