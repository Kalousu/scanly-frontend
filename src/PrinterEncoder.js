// builds esc/pos byte commands for usb thermal printers
export class PrinterEncoder{
    #commands;
    #ESC;
    #GS;
 
    constructor(){
        this.encoder = new TextEncoder();
        this.#commands = []
        this.#ESC = 0x1B
        this.#GS = 0x1D
    }
 
    init(){
        this.#commands.push([this.#ESC, 0x40])
        return this;
    }
 
    setCodepage(){ // z.B. CP850
        this.#commands.push([this.#ESC, 0x74, 0x02]);
        return this;
    }
 
    setGerman(){
        this.#commands.push([this.#ESC, 0x52, 0x02])
        return this
    }
 
    center(){
        this.#commands.push([this.#ESC, 0x61, 0x01])
        return this;
    }
 
    //TEXT
 
    print(text){
        this.#commands.push(...this.encoder.encode(text))
        return this;
    }
 
    println(text){
        this.#commands.push(...this.encoder.encode(text + '\n'))
        return this;
    }
 
    // FORMATTIERUNG (BOLD, UNDERLINE)
 
    setBold(){
        this.#commands.push([this.#ESC, 0x45, 0x01])
        return this;
    }
 
    unsetBold(){
        this.#commands.push([this.#ESC, 0x45, 0x00])
        return this;
    }
 
    setUnderline(){
        this.#commands.push([this.#ESC, 0x2D, 0x01])
        return this;
    }
 
    unsetUnderline(){
        this.#commands.push([this.#ESC, 0x2D, 0x00])
        return this;
    }
 
    setItalic(){
        this.#commands.push([this.#ESC, 0x34])
        return this
    }
 
    unsetItalic(){
        this.#commands.push([this.#ESC, 0x35])
        return this
    }
 
    beep(){
        this.#commands.push([0x07])
        return this
    }
 
    //NEWLINE (FEED)
 
    feed(num = 1){
        for(let i = 0; i < num; i++){
            this.#commands.push([0x0A, 0x0A, 0x0A])
        }
        return this;
    }
 
    cut(){
        this.#commands.push([this.#GS, 0x56, 0x01])
        return this;
    }
 
    //ENCODING
    // pack all collected commands into one byte array to send to printer
    encode(){
        return new Uint8Array(this.#commands.flat());
    }
}
 