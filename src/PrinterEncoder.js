export class PrinterEncoder{
    #commands;
    #ESC;
    #GS;
    static #cp850 = {
        'ä': 0x84, 'ö': 0x94, 'ü': 0x81,
        'Ä': 0x8E, 'Ö': 0x99, 'Ü': 0x9A,
        'ß': 0xE1, '€': 0xD5,
        '░': 0xB0, '▒': 0xB1, '▓': 0xB2,
        '█': 0xB3
    };
 
    constructor(){
        this.#commands = []
        this.#ESC = 0x1B
        this.#GS = 0x1D
    }
 
    #encode(text) {
        const bytes = [];
        for (const char of text) {
            if (PrinterEncoder.#cp850[char] !== undefined) {
                bytes.push(PrinterEncoder.#cp850[char]);
            } else {
                // normales ASCII direkt als Byte
                bytes.push(char.charCodeAt(0));
            }
        }
        return bytes;
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
        this.#commands.push(...this.#encode(text))
        return this;
    }
 
    println(text){
        this.#commands.push(...this.#encode(text + '\n'))
        return this;
    }
 
    printScanlyInfo(){
        this.print("           ░░░░░░░░░░           ")
        this.print("      ░░▒▓▓▒▒▒▒▒▒▓█▓▓▓▓▒▒░      ")
        this.print("    ░▒▓░            ▒▒░  ▒▒░    ")
        this.print("    ░▓               ▓▒   ▓░    ")
        this.print("    ░▓░             ▒▒░  ░▒░    ")
        this.print("     ░▓             ▓▒   ▓▒     ")
        this.print("     ░▓             ▓▒   ▓░     ")
        this.print("     ░▓             ▓▒   ▓░     ")
        this.print("     ▒▓             ▓▒  ░▓░     ")
        this.print("     ░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░      ")
        this.print("                                ")
        this.feed(1);
        this.print("EINFACH SCANNEN! Das ist Scanly\n")
        return this;
    }
 
    printPrice(article, priceGross, priceSingle, amount, taxLabel){
        let width = 32;
    
        const priceGrossStr = priceGross.toFixed(2);
        const priceSingleStr = priceSingle.toFixed(2);
        const amountStr = amount.toFixed(2);
    
        let articleWidth = article.toString().length;
        let priceWidth = priceGrossStr.length;
        let space = width - articleWidth - priceWidth - 2;
    
        let res = "";
        res += article;
        for(let i = 0; i < space; i++){
            res += " ";
        }
        res += priceGrossStr + " " + taxLabel;
        res = res.substring(0, width);
        this.println(res);
    
        if(amount > 1){
            let widthAmountPuffer = 6;
            let widthPriceSingleBuffer = 6;
            let widthAmount = amountStr.length;
            let widthPriceSingle = priceSingleStr.length;
            let resAmount = "";
            let loop1 = widthAmountPuffer - widthAmount;
            let loop2 = widthPriceSingleBuffer - widthPriceSingle;
            for(let i = 0; i < loop1; i++){
                resAmount += " ";
            }
            resAmount += amountStr;
            resAmount += " x  ";
            for(let i = 0; i < loop2; i++){
                resAmount += " ";
            }
            resAmount += priceSingleStr;
            for(let i = 0; i < 16; i++){
                resAmount += " ";
            }
            resAmount = resAmount.substring(0, width);
            this.println(resAmount);
        }
        return this;
    }
 
    printSum(sum){
        let width = 21;
        const sumStr = sum.toFixed(2);
        let space = width - sumStr.length;
        let res = "ZU ZAHLEN: ";
        for(let i = 0; i < space; i++){
            res += " ";
        }
        res += sumStr;
        res = res.substring(0, 32); // max 32 Zeichen
        this.println(res);
        return this;
    }
 
    printTaxGroupTable(taxGroups) {
        this.println("MwSt% MwSt+  Netto = Brutto");
        this.lineSeparator();
        taxGroups.forEach(group => {
            const label = group.label.padEnd(2);
            const rate = (group.rate * 100).toFixed(0).padStart(2) + "%";
            const tax = group.tax.toFixed(2).padStart(6);
            const net = group.net.toFixed(2).padStart(6);
            const gross = group.gross.toFixed(2).padStart(6);
            this.println(`${label} ${rate} ${tax} ${net} ${gross}`);
        });
        this.lineSeparator();
        return this;
    }
 
    printEURLabel(){
        this.#commands.push(...this.#encode("                          EUR \n"))
        return this;
    }
 
    lineSeparator(){
        this.#commands.push(...this.#encode("--------------------------------\n"))
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
            this.#commands.push([0x0A]);
        }
        return this;
    }
 
    cut(){
        this.#commands.push([this.#GS, 0x56, 0x01])
        return this;
    }
 
    //ENCODING
 
    encode(){
        return new Uint8Array(this.#commands.flat());
    }
}